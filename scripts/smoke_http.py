"""Verify static frontend and synthetic API parity through one HTTP origin."""
import argparse
import json
from pathlib import Path
import re
import time
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


def main():
    if sys.flags.optimize:
        raise RuntimeError("Run verification without -O so assertions remain enabled")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base_url", help="e.g. http://127.0.0.1:8080 via nginx or SSH tunnel")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--api-only", action="store_true", help="For direct WSGI verification before proxy access")
    args = parser.parse_args()
    base = args.base_url.rstrip("/")
    fixtures = json.loads((ROOT / "deploy/smoke-fixtures.json").read_text())

    def fetch(path, payload=None, timeout=30):
        data = None if payload is None else json.dumps(payload).encode()
        req = Request(base + path, data=data, headers={} if data is None else {"Content-Type": "application/json"})
        try:
            with urlopen(req, timeout=timeout) as response:
                return response.status, response.read(), response.headers.get("Content-Type", "")
        except HTTPError as error:
            return error.code, error.read(), error.headers.get("Content-Type", "")

    deadline = time.monotonic() + 90
    while time.monotonic() < deadline:
        try:
            status, body, _ = fetch("/api/health", timeout=3)
            if status == 200 and json.loads(body) == {"status": "ok"}:
                break
        except URLError as error:
            if isinstance(error.reason, PermissionError):
                raise RuntimeError("Networking permission denied; run the authorized check outside the sandbox") from error
        except TimeoutError:
            pass
        time.sleep(1)
    else:
        raise RuntimeError("Service did not become healthy within the startup window")
    checks = ["health"]
    if not args.api_only:
        status, body, _ = fetch("/")
        html = body.decode()
        assert status == 200 and "EAB Credit" in html
        assets = re.findall(r'(?:src|href)="(/assets/[^"]+)"', html)
        assert any(path.endswith(".js") for path in assets) and any(path.endswith(".css") for path in assets)
        for path in assets + ["/eab-credit-logo.png", "/eab-credit-favicon.png"]:
            asset_status, asset_body, _ = fetch(path)
            assert asset_status == 200 and len(asset_body) > 0, path
        checks.append("frontend HTML/JS/CSS/logo/favicon")
    assert fetch("/api/options")[0] == 200
    checks.append("options")
    actual_cases = []
    for case in fixtures["cases"]:
        start = time.perf_counter()
        status, body, _ = fetch("/api/score", case["request"])
        actual = json.loads(body)
        assert status == 200 and actual == case["expected"], (case["name"], status, actual)
        actual_cases.append({"name": case["name"], "request": case["request"], "response": actual, "elapsed_ms": (time.perf_counter() - start) * 1000})
        checks.append(case["name"] + " prediction parity")
    status, body, _ = fetch("/api/score", {"loan_amnt": 0, "annual_inc": 0})
    invalid = json.loads(body)
    assert status == 400 and {"loan_amnt", "annual_inc"} <= set(invalid["field_errors"])
    checks.append("invalid request: structured 400")
    report = {"base_url": base, "research_commit": fixtures["research_commit"], "checks": checks, "cases": actual_cases, "invalid_response": invalid}
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
