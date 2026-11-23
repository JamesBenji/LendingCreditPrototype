import json
import pathlib
import numpy as np
import pandas as pd
import joblib
from application_schema import PURPOSE_OPTIONS, validate_application
from repayment import calculate_repayment

# ---------------------------------------------------------------------------
# Paths — artifacts live one level up from this file
# ---------------------------------------------------------------------------
_BASE = pathlib.Path(__file__).parent.parent / "lending_artifacts"

# ---------------------------------------------------------------------------
# Load artifacts once at import time
# ---------------------------------------------------------------------------
_xgb = joblib.load(_BASE / "xgb_risk_model.joblib")
_platt = joblib.load(_BASE / "platt_calibrator.joblib")

with open(_BASE / "metadata.json") as fh:
    _meta = json.load(fh)

FEATURE_COLS = _meta["feature_cols"]
NUMERIC_FEATURES = _meta["numeric_features"]
CATEGORICAL_FEATURES = _meta["categorical_features"]
DEFAULTS = _meta["defaults"]
LGD = _meta["LGD_measured_net"]          # 0.5898 — measured on training data
FUNDING_COST = _meta["FUNDING_COST_assumed"]      # 0.04
OPERATING_MARGIN = _meta["OPERATING_MARGIN_assumed"]  # 0.025
RATE_CAP = 0.40

# ---------------------------------------------------------------------------
# Decision thresholds
# ---------------------------------------------------------------------------
THRESHOLDS = {
    "approve": 0.15,
    "refer": 0.30,
}

# ---------------------------------------------------------------------------
# Human-readable labels for risk driver display
# ---------------------------------------------------------------------------
DRIVER_LABELS = {
    "dti":                    "Debt-to-Income Ratio (DTI)",
    "fico_avg":               "FICO Credit Score (FICO)",
    "revol_util":             "Revolving Utilisation Rate (RUR)",
    "inq_last_6mths":         "Credit Inquiries in Last 6 Months",
    "delinq_2yrs":            "Delinquencies in Last 2 Years",
    "credit_history_years":   "Credit History Length",
    "loan_to_income":         "Loan-to-Income Ratio (LTI)",
    "pub_rec":                "Public Records",
    "open_acc":               "Number of Open Accounts",
    "revol_bal":              "Revolving Balance (USD)",
    "tot_cur_bal":            "Total Current Balance (USD)",
    "mths_since_recent_inq":  "Months Since Last Inquiry",
}

# Direction of "risky" deviation: +1 means higher value → more risk, -1 means lower → more risk
_RISK_DIRECTION = {
    "dti":                   +1,
    "fico_avg":              -1,
    "revol_util":            +1,
    "inq_last_6mths":        +1,
    "delinq_2yrs":           +1,
    "credit_history_years":  -1,
    "loan_to_income":        +1,
    "pub_rec":               +1,
    "open_acc":              +1,
    "revol_bal":             +1,
    "tot_cur_bal":           +1,
    "mths_since_recent_inq": -1,
}

# Training-period typical values (medians pre-loaded from defaults)
_TYPICAL = {k: DEFAULTS.get(k) for k in DRIVER_LABELS}


def _logit(p: np.ndarray) -> np.ndarray:
    p = np.clip(p, 1e-6, 1 - 1e-6)
    return np.log(p / (1 - p)).reshape(-1, 1)


def _build_row(form_values: dict) -> pd.DataFrame:
    """
    Merge form values over training defaults, return a single-row DataFrame
    with all feature columns in the correct order.
    """
    row = dict(DEFAULTS)
    row.update({k: v for k, v in form_values.items() if k in row})
    # Match training-time feature engineering after applying the current inputs.
    # A default ratio would otherwise describe a different loan and income.
    annual_inc = float(row["annual_inc"])
    row["loan_to_income"] = float(row["loan_amnt"]) / annual_inc if annual_inc else np.nan
    return pd.DataFrame([row], columns=FEATURE_COLS)


def _top_risk_drivers(row_values: dict) -> list[dict]:
    """
    Return up to 3 interpretable risk factors where the customer deviates
    most from the typical borrower in the risky direction.
    """
    scored = []
    for feat, label in DRIVER_LABELS.items():
        val = row_values.get(feat)
        if val is None:
            continue
        try:
            val = float(val)
        except (TypeError, ValueError):
            continue
        if not np.isfinite(val):
            continue

        typical = _TYPICAL.get(feat)
        if typical is None:
            continue
        try:
            typical = float(typical)
        except (TypeError, ValueError):
            continue

        direction = _RISK_DIRECTION.get(feat, +1)
        # Normalise by typical so magnitudes are comparable
        if typical != 0:
            deviation = direction * (val - typical) / abs(typical)
        else:
            deviation = direction * val

        scored.append({
            "feature": feat,
            "label": label,
            "value": val,
            "typical": typical,
            "deviation": deviation,
        })

    scored.sort(key=lambda x: -x["deviation"])
    drivers = []
    for item in scored[:3]:
        if item["deviation"] <= 0:
            break  # customer is not risky on any measured dimension
        feat = item["feature"]
        val = item["value"]
        typical = item["typical"]

        # Format values nicely
        if feat == "fico_avg":
            val_str = f"{val:.0f}"
            typ_str = f"{typical:.0f}"
            unit = ""
        elif feat in ("dti", "revol_util"):
            val_str = f"{val:.1f}%"
            typ_str = f"{typical:.1f}%"
            unit = ""
        elif feat == "credit_history_years":
            val_str = f"{val:.1f} years"
            typ_str = f"{typical:.1f} years"
            unit = ""
        elif feat == "loan_to_income":
            val_str = f"{val:.2f}"
            typ_str = f"{typical:.2f}"
            unit = ""
        elif feat in ("revol_bal", "tot_cur_bal"):
            val_str = f"${val:,.0f}"
            typ_str = f"${typical:,.0f}"
            unit = ""
        else:
            val_str = f"{val:.0f}"
            typ_str = f"{typical:.0f}"
            unit = ""

        drivers.append({
            "label": item["label"],
            "value_str": val_str,
            "typical_str": typ_str,
            "unit": unit,
        })

    return drivers


def score(form_values: dict) -> dict:
    """
    Score a single application from form input.

    Parameters
    ----------
    form_values : dict
        Keys are feature names from the form; values are raw strings or numbers.

    Returns
    -------
    dict with keys:
        pd_pct, el_rate_pct, el_dollars, suggested_rate_pct,
        decision, risk_tier, risk_drivers,
        loan_amnt, lgd_pct, funding_cost_pct, operating_margin_pct
    """
    form_values = validate_application(form_values)
    row = _build_row(form_values)
    row_values = row.iloc[0].to_dict()
    loan_amnt = float(row_values["loan_amnt"])
    raw_pd = _xgb.predict_proba(row)[:, 1]
    pd_prob = float(_platt.predict_proba(_logit(raw_pd))[:, 1][0])

    el_rate = pd_prob * LGD
    uncapped_rate = FUNDING_COST + OPERATING_MARGIN + el_rate
    suggested_rate = float(np.clip(uncapped_rate, 0, RATE_CAP))
    suggested_rate_pct = round(suggested_rate * 100, 2)
    # Repayments must use the same rate and term that the officer sees.
    term_months = int(row_values["term"].split()[0])
    repayment = calculate_repayment(loan_amnt, suggested_rate_pct, term_months)
    el_dollars = el_rate * loan_amnt

    if pd_prob < THRESHOLDS["approve"]:
        decision = "Approve"
        risk_tier = "Low Risk"
    elif pd_prob < THRESHOLDS["refer"]:
        decision = "Refer to Senior Officer"
        risk_tier = "Medium Risk"
    else:
        decision = "Decline"
        risk_tier = "High Risk"

    risk_drivers = _top_risk_drivers(row_values)

    return {
        "pd_pct": round(pd_prob * 100, 1),
        "el_rate_pct": round(el_rate * 100, 1),
        "el_dollars": round(el_dollars, 2),
        "suggested_rate_pct": suggested_rate_pct,
        **repayment,
        "pricing_capped": uncapped_rate > RATE_CAP,
        "rate_cap_pct": round(RATE_CAP * 100, 2),
        "uncapped_suggested_rate_pct": round(uncapped_rate * 100, 2),
        "decision": decision,
        "risk_tier": risk_tier,
        "risk_drivers": risk_drivers,
        "loan_amnt": loan_amnt,
        "purpose_label": next(option["label"] for option in PURPOSE_OPTIONS if option["value"] == row_values["purpose"]),
        "lgd_pct": round(LGD * 100, 2),
        "funding_cost_pct": round(FUNDING_COST * 100, 2),
        "operating_margin_pct": round(OPERATING_MARGIN * 100, 2),
    }
