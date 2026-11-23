import math

# Keep server validation consistent with the application fields.
# Omitted fields use training defaults; explicitly invalid values are rejected.
NUMERIC_RULES = {
    "loan_amnt": (500, 40000, False, True, "Loan amount"),
    "annual_inc": (1000, None, False, True, "Annual income"),
    "fico_avg": (300, 850, True, True, "FICO score"),
    "dti": (0, 100, False, True, "DTI"),
    "revol_util": (0, 100, False, False, "Revolving utilisation"),
    "mths_since_recent_inq": (0, 240, True, False, "Months since last inquiry"),
    "delinq_2yrs": (0, None, True, False, "Delinquencies"),
    "open_acc": (0, None, True, False, "Open accounts"),
    "pub_rec": (0, None, True, False, "Public records"),
}

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

CATEGORICAL_OPTIONS = {
    "term": TERM_OPTIONS,
    "emp_length": EMP_LENGTH_OPTIONS,
    "home_ownership": HOME_OWNERSHIP_OPTIONS,
    "verification_status": VERIFICATION_OPTIONS,
    "application_type": APPLICATION_TYPE_OPTIONS,
    "purpose": [option["value"] for option in PURPOSE_OPTIONS],
}


class ApplicationValidationError(ValueError):
    def __init__(self, errors):
        self.errors = errors
        super().__init__(" ".join(errors.values()))


def validate_application(data):
    if not isinstance(data, dict):
        raise ApplicationValidationError({"application": "The application must be a JSON object."})

    values = {}
    errors = {}
    for field, (minimum, maximum, integer, required, label) in NUMERIC_RULES.items():
        if field not in data:
            continue
        value = data[field]
        if value is None or (isinstance(value, str) and not value.strip()):
            if required:
                errors[field] = f"{label} is required."
            continue
        if isinstance(value, bool) or not isinstance(value, (int, float, str)):
            errors[field] = f"{label} must be a valid number."
            continue
        try:
            number = float(value)
        except (TypeError, ValueError, OverflowError):
            errors[field] = f"{label} must be a valid number."
            continue
        if not math.isfinite(number):
            errors[field] = f"{label} must be a finite number."
        elif number < minimum or (maximum is not None and number > maximum):
            if maximum is None:
                errors[field] = f"{label} must be at least {minimum:,}."
            else:
                errors[field] = f"{label} must be between {minimum:,} and {maximum:,}."
        elif integer and not number.is_integer():
            errors[field] = f"{label} must be a whole number."
        else:
            values[field] = number

    for field, choices in CATEGORICAL_OPTIONS.items():
        if field not in data:
            continue
        value = data[field]
        if not isinstance(value, str) or value.strip() not in choices:
            errors[field] = f"Choose a supported value for {field.replace('_', ' ')}."
        else:
            values[field] = value.strip()

    if errors:
        raise ApplicationValidationError(errors)
    return values
