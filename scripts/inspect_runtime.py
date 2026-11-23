"""Inspect trusted repository artifacts and trace synthetic API requests."""
import argparse
import hashlib
import importlib.metadata
import json
import math
import os
from pathlib import Path
import platform
import resource
import subprocess
import sys
import time
import warnings

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "flask_app"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "docs/evidence/runtime-inspection.json")
    parser.add_argument("--iterations", type=int, default=100)
    args = parser.parse_args()
    started = time.perf_counter()
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        import predictor
        from app import app
        from application_schema import CATEGORICAL_OPTIONS, NUMERIC_RULES, validate_application
    startup_seconds = time.perf_counter() - started
    import numpy as np

    model = predictor._xgb.named_steps["model"]
    prep = predictor._xgb.named_steps["prep"]
    names = [str(name) for name in prep.get_feature_names_out()]
    used_indices = {int(key[1:]) for key in model.get_booster().get_score().keys() if key.startswith("f") and key[1:].isdigit()}
    used_encoded = [names[index] for index in sorted(used_indices)]
    used_raw = set()
    for name in used_encoded:
        if name.startswith("num__missingindicator_"):
            used_raw.add(name.removeprefix("num__missingindicator_"))
        elif name.startswith("num__"):
            used_raw.add(name.removeprefix("num__"))
        else:
            for field in predictor.CATEGORICAL_FEATURES:
                if name.startswith(f"cat__{field}_"):
                    used_raw.add(field)
    supplied = set(NUMERIC_RULES) | set(CATEGORICAL_OPTIONS)
    defaulted = sorted(set(predictor.FEATURE_COLS) - supplied - {"loan_to_income"})
    examples = json.loads((ROOT / "flask_app/frontend/src/lib/application-examples.json").read_text())
    client = app.test_client()
    traces = []
    for example in examples:
        payload = dict(example["form"])
        payload["dti"] = f"{float(example['monthlyDebtPayments']) * 1200 / float(payload['annual_inc']):.1f}"
        normalized = validate_application(payload)
        row = predictor._build_row(normalized)
        transformed = prep.transform(row)
        raw_array = predictor._xgb.predict_proba(row)[:, 1]
        raw = float(raw_array[0])
        probability = float(predictor._platt.predict_proba(predictor._logit(raw_array))[0, 1])
        response = client.post("/api/score", json=payload)
        assert response.status_code == 200
        assert response.json["decision"] == example["expectedDecision"]
        assert list(row.columns) == list(predictor._xgb.feature_names_in_)
        traces.append({
            "example": example["title"], "frontend_only_monthly_debt": example["monthlyDebtPayments"],
            "request": payload, "normalized": normalized,
            "model_row": row.iloc[0].to_dict(), "dtypes": {key: str(value) for key, value in row.dtypes.items()},
            "transformed_shape": list(transformed.shape), "transformed_type": type(transformed).__name__,
            "raw_pd": raw, "calibrated_pd": probability,
            "status": response.status_code, "response": response.json,
        })
    invalid = client.post("/api/score", json={"loan_amnt": 0, "annual_inc": 0, "dti": "NaN"})
    timings = []
    for _ in range(args.iterations):
        start = time.perf_counter()
        predictor.score(traces[1]["request"])
        timings.append((time.perf_counter() - start) * 1000)
    rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    peak_mib = rss / (1024 ** 2 if sys.platform == "darwin" else 1024)
    artifact_dir = ROOT / "lending_artifacts"
    versions = {}
    for name in ["numpy", "pandas", "scikit-learn", "xgboost", "joblib", "Flask", "flask-cors", "gunicorn"]:
        try:
            versions[name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            versions[name] = None
    coef = float(predictor._platt.coef_[0, 0])
    intercept = float(predictor._platt.intercept_[0])
    report = {
        "inspected_commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
        "platform": platform.platform(), "python": platform.python_version(), "versions": versions,
        "artifact_manifest": {path.name: {"bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()} for path in sorted(artifact_dir.iterdir()) if path.is_file()},
        "load_warnings": [str(w.message) for w in caught],
        "feature_count": len(predictor.FEATURE_COLS), "numeric_count": len(predictor.NUMERIC_FEATURES),
        "categorical_count": len(predictor.CATEGORICAL_FEATURES), "api_feature_count": len(supplied),
        "defaulted_features": defaulted, "used_raw_features": sorted(used_raw),
        "unused_supplied_features_in_saved_trees": sorted(supplied - used_raw),
        "transformed_feature_count": len(names), "encoded_feature_names": names,
        "model_type": type(model).__name__, "tree_count": model.get_booster().num_boosted_rounds(),
        "model_parameters": {key: model.get_params().get(key) for key in ["n_estimators", "max_depth", "learning_rate", "subsample", "colsample_bytree", "min_child_weight", "reg_alpha", "reg_lambda", "scale_pos_weight", "n_jobs", "objective"]},
        "calibrator_classes": predictor._platt.classes_.tolist(),
        "calibrator_coefficient": coef, "calibrator_intercept": intercept,
        "calibrator_intercept_odds_multiplier": math.exp(intercept),
        "startup_seconds": startup_seconds, "process_peak_rss_mib": peak_mib,
        "score_latency_ms": {"iterations": args.iterations, "p50": float(np.percentile(timings, 50)), "p95": float(np.percentile(timings, 95))},
        "thread_environment": {key: os.environ.get(key) for key in ["OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS"]},
        "invalid_request": {"status": invalid.status_code, "response": invalid.json},
        "traces": traces,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, allow_nan=False) + "\n")
    print(json.dumps({key: report[key] for key in ["inspected_commit", "versions", "tree_count", "transformed_feature_count", "unused_supplied_features_in_saved_trees", "startup_seconds", "process_peak_rss_mib", "score_latency_ms"]}, indent=2))
    print(f"Full evidence: {args.output}")


if __name__ == "__main__":
    main()
