from flask import Flask, request, jsonify
from flask_cors import CORS
import predictor

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Dropdown option lists (single source of truth for the React frontend)
# ---------------------------------------------------------------------------
TERM_OPTIONS = ["36 months", "60 months"]

EMP_LENGTH_OPTIONS = [
    "< 1 year", "1 year", "2 years", "3 years", "4 years",
    "5 years", "6 years", "7 years", "8 years", "9 years", "10+ years",
]

HOME_OWNERSHIP_OPTIONS = ["RENT", "OWN", "MORTGAGE", "OTHER"]

VERIFICATION_OPTIONS = ["Not Verified", "Verified", "Source Verified"]

APPLICATION_TYPE_OPTIONS = ["Individual", "Joint App"]

PURPOSE_OPTIONS = [
    {"value": "debt_consolidation",  "label": "Debt Consolidation"},
    {"value": "credit_card",         "label": "Credit Card"},
    {"value": "home_improvement",    "label": "Home Improvement"},
    {"value": "other",               "label": "Other"},
    {"value": "major_purchase",      "label": "Major Purchase"},
    {"value": "small_business",      "label": "Small Business"},
    {"value": "car",                 "label": "Car"},
    {"value": "medical",             "label": "Medical"},
    {"value": "moving",              "label": "Moving"},
    {"value": "vacation",            "label": "Vacation"},
    {"value": "house",               "label": "House"},
    {"value": "wedding",             "label": "Wedding"},
    {"value": "renewable_energy",    "label": "Renewable Energy"},
    {"value": "educational",         "label": "Educational"},
]


# ---------------------------------------------------------------------------
# API routes
# ---------------------------------------------------------------------------

@app.route("/api/options", methods=["GET"])
def options():
    """Return all dropdown options and training-period defaults for the form."""
    return jsonify({
        "defaults": predictor.DEFAULTS,
        "term_options": TERM_OPTIONS,
        "emp_length_options": EMP_LENGTH_OPTIONS,
        "home_ownership_options": HOME_OWNERSHIP_OPTIONS,
        "verification_options": VERIFICATION_OPTIONS,
        "application_type_options": APPLICATION_TYPE_OPTIONS,
        "purpose_options": PURPOSE_OPTIONS,
    })


@app.route("/api/score", methods=["POST"])
def score():
    """Accept a JSON object of form values and return the risk assessment."""
    data = request.get_json(force=True)

    form_values = {
        "loan_amnt":             _float(data.get("loan_amnt")),
        "term":                  data.get("term"),
        "purpose":               data.get("purpose"),
        "annual_inc":            _float(data.get("annual_inc")),
        "emp_length":            data.get("emp_length"),
        "home_ownership":        data.get("home_ownership"),
        "verification_status":   data.get("verification_status"),
        "application_type":      data.get("application_type"),
        "fico_avg":              _float(data.get("fico_avg")),
        "dti":                   _float(data.get("dti")),
        "revol_util":            _float(data.get("revol_util")),
        "mths_since_recent_inq": _float(data.get("mths_since_recent_inq")),
        "delinq_2yrs":           _float(data.get("delinq_2yrs")),
        "open_acc":              _float(data.get("open_acc")),
        "pub_rec":               _float(data.get("pub_rec")),
    }
    form_values = {k: v for k, v in form_values.items() if v is not None}

    result = predictor.score(form_values)

    # Resolve purpose label for display
    purpose_label = next(
        (p["label"] for p in PURPOSE_OPTIONS if p["value"] == form_values.get("purpose")),
        form_values.get("purpose", ""),
    )
    result["purpose_label"] = purpose_label

    return jsonify(result)


def _float(value):
    if value is None or str(value).strip() == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=5001)
