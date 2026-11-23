"""Reproduce held-out XGBoost metrics without retraining or downloading data."""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import subprocess
import importlib.metadata

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "flask_app"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "docs/evidence/reproduced-metrics.json")
    args = parser.parse_args()
    import numpy as np
    import pandas as pd
    from sklearn.metrics import average_precision_score, brier_score_loss, precision_recall_curve, roc_auc_score
    import predictor
    from application_schema import CATEGORICAL_OPTIONS, NUMERIC_RULES

    notebook = json.loads((ROOT / "Lending_project_v2 (1).ipynb").read_text())
    cells = notebook["cells"]
    namespace = {"ALL_COLUMNS": pd.read_csv(args.csv, nrows=0).columns.tolist()}
    exec(compile("".join(cells[6]["source"]), "notebook-cell-6", "exec"), namespace)
    parts = []
    for index, chunk in enumerate(pd.read_csv(args.csv, usecols=namespace["USECOLS"], chunksize=200000, low_memory=False)):
        resolved = chunk[chunk["loan_status"].isin(["Fully Paid", "Charged Off"])]
        if len(resolved):
            parts.append(resolved.sample(frac=0.08, random_state=42 + index))
        print(f"Read chunk {index + 1}", flush=True)
    frame = pd.concat(parts, ignore_index=True)
    if len(frame) > 150000:
        frame = frame.sample(150000, random_state=42)
    frame["default"] = (frame["loan_status"] == "Charged Off").astype(int)
    for col in ["issue_d", "earliest_cr_line"]:
        frame[col] = pd.to_datetime(frame[col], format="%b-%Y", errors="coerce")
    if frame["revol_util"].dtype == "object":
        frame["revol_util"] = pd.to_numeric(frame["revol_util"].str.rstrip("%"), errors="coerce")
    frame["term"] = frame["term"].astype(str).str.strip()
    frame["fico_avg"] = frame[["fico_range_low", "fico_range_high"]].mean(axis=1)
    frame = frame.replace([np.inf, -np.inf], np.nan).dropna(subset=["issue_d"]).sort_values("issue_d").reset_index(drop=True)
    frame["credit_history_years"] = ((frame["issue_d"] - frame["earliest_cr_line"]).dt.days / 365.25).clip(lower=0)
    frame["loan_to_income"] = frame["loan_amnt"] / frame["annual_inc"].replace(0, np.nan)
    n = len(frame)
    groups = {"train": frame.iloc[:int(n * .70)], "validation": frame.iloc[int(n * .70):int(n * .85)], "test": frame.iloc[int(n * .85):]}
    def metrics(y, p):
        precision, recall, _ = precision_recall_curve(y, p)
        bins = pd.DataFrame({"y": np.asarray(y), "p": p})
        bins["bin"] = pd.qcut(bins["p"], 10, duplicates="drop")
        grouped = bins.groupby("bin", observed=False).agg(predicted=("p", "mean"), observed=("y", "mean"), n=("y", "size"))
        k = max(int(len(y) * .1), 1)
        return {"roc_auc": float(roc_auc_score(y, p)), "average_precision": float(average_precision_score(y, p)), "brier": float(brier_score_loss(y, p)), "ece_10_quantile_bins": float((grouped.n * (grouped.predicted - grouped.observed).abs()).sum() / grouped.n.sum()), "lift_top_10_pct": float(np.asarray(y)[np.argsort(-p)[:k]].mean() / np.asarray(y).mean()), "precision_at_70_pct_recall": float(precision[recall >= .70].max()), "mean_predicted_pd": float(p.mean())}
    digest = hashlib.sha256()
    with args.csv.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    report = {"inspected_commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
              "artifact_sha256": {name: hashlib.sha256((ROOT / "lending_artifacts" / name).read_bytes()).hexdigest() for name in ["xgb_risk_model.joblib", "platt_calibrator.joblib", "metadata.json"]},
              "versions": {name: importlib.metadata.version(name) for name in ["numpy", "pandas", "scikit-learn", "xgboost", "joblib"]},
              "method": "Sampling and cleaning from notebook cells 6/8/10/16/18; saved artifacts only; no estimator fit called", "source_csv_sha256": digest.hexdigest(), "rows": n, "splits": {}, "metrics": {}}
    for name, group in groups.items():
        report["splits"][name] = {"rows": len(group), "first_issue_month": group.issue_d.min().strftime("%Y-%m"), "last_issue_month": group.issue_d.max().strftime("%Y-%m"), "default_rate": float(group.default.mean())}
        if name == "train":
            continue
        raw = predictor._xgb.predict_proba(group[predictor.FEATURE_COLS])[:, 1]
        calibrated = predictor._platt.predict_proba(predictor._logit(raw))[:, 1]
        report["metrics"][name] = {"raw": metrics(group.default, raw), "calibrated": metrics(group.default, calibrated)}
    # Post-hoc serving-gap diagnostic: substitute only the 40 uncollected inputs.
    # This isolates default filling; it is not a complete browser/API simulation.
    test = groups["test"]
    masked = test[predictor.FEATURE_COLS].copy()
    defaulted = set(predictor.FEATURE_COLS) - set(NUMERIC_RULES) - set(CATEGORICAL_OPTIONS) - {"loan_to_income"}
    for field in defaulted:
        masked[field] = predictor.DEFAULTS[field]
    raw = predictor._xgb.predict_proba(masked)[:, 1]
    calibrated = predictor._platt.predict_proba(predictor._logit(raw))[:, 1]
    report["post_hoc_default_filling_diagnostic"] = {
        "description": "Saved model; same test loans; 40 uncollected features replaced with training defaults. Collected features retain dataset values/missingness. UI rounding and API eligibility are not simulated. Not part of the original notebook evaluation.",
        "defaulted_features": sorted(defaulted), "metrics": metrics(test.default, calibrated),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
