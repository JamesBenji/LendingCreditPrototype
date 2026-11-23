"""Gate a trusted release on artifact hashes and synthetic WSGI prediction parity."""
import argparse
import hashlib
import importlib.metadata
import json
from pathlib import Path
import platform
import resource
import sys
import time
import warnings

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "flask_app"))


def main():
    if sys.flags.optimize:
        raise RuntimeError("Run verification without -O so assertions remain enabled")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    fixtures = json.loads((ROOT / "deploy/smoke-fixtures.json").read_text())
    for name, expected in fixtures["artifact_sha256"].items():
        actual = hashlib.sha256((ROOT / "lending_artifacts" / name).read_bytes()).hexdigest()
        if actual != expected:
            raise RuntimeError(f"Artifact hash mismatch: {name}")
    started = time.perf_counter()
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        from wsgi import app
        import predictor
    startup = time.perf_counter() - started
    if any("Trying to unpickle estimator" in str(w.message) for w in caught):
        raise RuntimeError("scikit-learn artifact/runtime mismatch; do not activate")
    client = app.test_client()
    assert app.debug is False
    assert client.get("/api/health").json == {"status": "ok"}
    assert client.get("/api/options").status_code == 200
    checks = []
    for case in fixtures["cases"]:
        response = client.post("/api/score", json=case["request"])
        if response.status_code != 200 or response.json != case["expected"]:
            raise RuntimeError(f"Prediction parity failed for {case['name']}: {response.status_code} {response.json}")
        checks.append(case["name"])
    assert client.post("/api/score", json={"loan_amnt": 0}).status_code == 400
    assert client.post("/api/score", data="null", content_type="application/json").status_code == 400
    assert client.post("/api/score", data="not JSON").status_code == 415
    timings = []
    for _ in range(50):
        start = time.perf_counter()
        client.post("/api/score", json=fixtures["cases"][1]["request"])
        timings.append((time.perf_counter() - start) * 1000)
    import numpy as np
    peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 ** 2 if sys.platform == "darwin" else 1024)
    report = {
        "platform": platform.platform(), "python": platform.python_version(),
        "research_commit": fixtures["research_commit"], "artifact_sha256": fixtures["artifact_sha256"],
        "versions": {},
        "model_threads": predictor._xgb.named_steps["model"].get_params()["n_jobs"],
        "startup_seconds": startup, "process_peak_rss_mib": peak,
        "flask_client_latency_ms": {"p50": float(np.percentile(timings, 50)), "p95": float(np.percentile(timings, 95)), "iterations": 50},
        "fixture_parity": checks, "invalid_requests": "400/400/415 passed", "load_warnings": [str(w.message) for w in caught],
    }
    import xgboost
    report["xgboost_module_version"] = xgboost.__version__
    for name in ["numpy", "pandas", "scikit-learn", "xgboost", "xgboost-cpu", "joblib", "Flask", "flask-cors", "gunicorn", "scipy"]:
        try:
            report["versions"][name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            report["versions"][name] = None
    if peak > 600:
        raise RuntimeError(f"Process peak {peak:.1f} MiB leaves insufficient headroom for the planned 650 MiB service cap")
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
