from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import BadRequest
import predictor

from application_schema import (
    TERM_OPTIONS, EMP_LENGTH_OPTIONS, HOME_OWNERSHIP_OPTIONS,
    VERIFICATION_OPTIONS, APPLICATION_TYPE_OPTIONS, PURPOSE_OPTIONS,
    ApplicationValidationError,
)

app = Flask(__name__)
CORS(app)

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
    if not request.is_json:
        return jsonify(error="Send the application as JSON."), 415
    try:
        data = request.get_json()
    except BadRequest:
        return jsonify(error="The application contains invalid JSON."), 400
    try:
        return jsonify(predictor.score(data))
    except ApplicationValidationError as error:
        return jsonify(error=str(error), field_errors=error.errors), 400


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=5001)
