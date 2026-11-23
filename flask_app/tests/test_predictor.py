import unittest
from unittest.mock import patch

import numpy as np

import predictor
from app import app
from application_schema import ApplicationValidationError, CATEGORICAL_OPTIONS


class PredictorTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_ratio_tracks_amount_and_income_instead_of_training_default(self):
        for amount, income in [(500, 64000), (12000, 64000), (40000, 100000)]:
            with self.subTest(amount=amount, income=income):
                row = predictor._build_row({"loan_amnt": amount, "annual_inc": income})
                self.assertEqual(list(row.columns), predictor.FEATURE_COLS)
                self.assertAlmostEqual(row.iloc[0]["loan_to_income"], amount / income)

    def test_ratio_uses_defaults_for_omitted_inputs(self):
        row = predictor._build_row({"loan_amnt": 500})
        self.assertAlmostEqual(row.iloc[0]["loan_to_income"], 500 / predictor.DEFAULTS["annual_inc"])
        row = predictor._build_row({"annual_inc": 100000})
        self.assertAlmostEqual(row.iloc[0]["loan_to_income"], predictor.DEFAULTS["loan_amnt"] / 100000)

    def test_derived_ratio_cannot_be_overridden_or_mutate_defaults(self):
        defaults = dict(predictor.DEFAULTS)
        row = predictor._build_row({"loan_amnt": 500, "annual_inc": 100000, "loan_to_income": 99})
        self.assertAlmostEqual(row.iloc[0]["loan_to_income"], 0.005)
        self.assertEqual(predictor.DEFAULTS, defaults)

    def test_zero_income_matches_training_missing_value_handling(self):
        row = predictor._build_row({"annual_inc": 0})
        self.assertTrue(np.isnan(row.iloc[0]["loan_to_income"]))

    def test_decision_boundaries_use_unrounded_probability(self):
        for probability, decision, tier in [
            (0.14999, "Approve", "Low Risk"),
            (0.15, "Refer to Senior Officer", "Medium Risk"),
            (0.29999, "Refer to Senior Officer", "Medium Risk"),
            (0.30, "Decline", "High Risk"),
        ]:
            with self.subTest(probability=probability):
                with patch.object(predictor._platt, "predict_proba", return_value=np.array([[1 - probability, probability]])):
                    result = predictor.score({})
                self.assertEqual(result["decision"], decision)
                self.assertEqual(result["risk_tier"], tier)

    def test_api_passes_current_amount_and_income_to_the_real_model(self):
        client = app.test_client()
        for amount, decision in [(500, "Approve"), (12000, "Refer to Senior Officer")]:
            with self.subTest(amount=amount):
                with patch.object(predictor._xgb, "predict_proba", wraps=predictor._xgb.predict_proba) as predict:
                    response = client.post("/api/score", json={"loan_amnt": str(amount), "annual_inc": "64000"})
                self.assertEqual(response.status_code, 200)
                self.assertAlmostEqual(predict.call_args.args[0].iloc[0]["loan_to_income"], amount / 64000)
                result = response.get_json()
                self.assertEqual(result["decision"], decision)
                self.assertEqual(result["loan_amnt"], amount)
                self.assertAlmostEqual(result["el_dollars"], result["pd_pct"] / 100 * predictor.LGD * amount, delta=amount * 0.0005 * predictor.LGD + 0.01)

    def test_invalid_numeric_values_never_reach_the_model(self):
        cases = [
            ("loan_amnt", 0), ("loan_amnt", -500), ("loan_amnt", 40001),
            ("annual_inc", 0), ("annual_inc", -1000),
            ("fico_avg", 299), ("fico_avg", 851),
            ("dti", -1), ("dti", 101),
            ("revol_util", -1), ("revol_util", 101),
            ("mths_since_recent_inq", -1), ("mths_since_recent_inq", 241),
            ("delinq_2yrs", -1), ("open_acc", -1), ("pub_rec", -1),
            ("loan_amnt", "not a number"), ("annual_inc", True),
            ("dti", "NaN"), ("dti", "Infinity"), ("dti", float("-inf")),
            ("revol_util", []), ("revol_util", {}),
        ]
        with patch.object(predictor._xgb, "predict_proba") as model:
            for field, value in cases:
                with self.subTest(field=field, value=value):
                    response = self.client.post("/api/score", json={field: value})
                    self.assertEqual(response.status_code, 400)
                    self.assertIn(field, response.get_json()["field_errors"])
            model.assert_not_called()

    def test_counts_and_fico_require_whole_numbers(self):
        for field in ("fico_avg", "mths_since_recent_inq", "delinq_2yrs", "open_acc", "pub_rec"):
            with self.subTest(field=field):
                value = 692.5 if field == "fico_avg" else 1.5
                response = self.client.post("/api/score", json={field: value})
                self.assertEqual(response.status_code, 400)
                self.assertIn("whole number", response.get_json()["field_errors"][field])

    def test_explicitly_empty_required_values_are_not_replaced_with_defaults(self):
        for field in ("loan_amnt", "annual_inc", "fico_avg", "dti"):
            for value in (None, "", " "):
                with self.subTest(field=field, value=value):
                    response = self.client.post("/api/score", json={field: value})
                    self.assertEqual(response.status_code, 400)
                    self.assertIn(field, response.get_json()["field_errors"])

    def test_omitted_and_optional_blank_inputs_preserve_training_defaults(self):
        baseline = self.client.post("/api/score", json={}).get_json()
        response = self.client.post("/api/score", json={"revol_util": "", "pub_rec": None})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), baseline)
        self.assertEqual(baseline["purpose_label"], "Debt Consolidation")

    def test_unsupported_categories_are_rejected_before_prediction(self):
        with patch.object(predictor._xgb, "predict_proba") as model:
            for field in CATEGORICAL_OPTIONS:
                for value in ("unsupported", None, True, []):
                    with self.subTest(field=field, value=value):
                        response = self.client.post("/api/score", json={field: value})
                        self.assertEqual(response.status_code, 400)
                        self.assertIn(field, response.get_json()["field_errors"])
            model.assert_not_called()

    def test_malformed_request_bodies_return_json_errors(self):
        for body in ("null", "[]", "true", "42", '"application"', "{broken"):
            with self.subTest(body=body):
                response = self.client.post("/api/score", data=body, content_type="application/json")
                self.assertEqual(response.status_code, 400)
                self.assertIn("error", response.get_json())
        response = self.client.post("/api/score", data="loan_amnt=500")
        self.assertEqual(response.status_code, 415)
        self.assertIn("error", response.get_json())

    def test_all_fields_and_zero_values_reach_the_correct_model_columns(self):
        values = {
            "loan_amnt": 40000, "annual_inc": 80000, "fico_avg": 750,
            "dti": 0, "revol_util": 0, "mths_since_recent_inq": 24,
            "delinq_2yrs": 2, "open_acc": 7, "pub_rec": 1,
            "term": "60 months", "emp_length": "2 years",
            "home_ownership": "RENT", "verification_status": "Verified",
            "purpose": "car", "application_type": "Joint App",
        }
        with patch.object(predictor._xgb, "predict_proba", wraps=predictor._xgb.predict_proba) as model:
            response = self.client.post("/api/score", json=values)
        self.assertEqual(response.status_code, 200)
        row = model.call_args.args[0].iloc[0]
        for field, value in values.items():
            self.assertEqual(row[field], value)
        self.assertEqual(row["loan_to_income"], 0.5)
        self.assertEqual(response.get_json()["purpose_label"], "Car")

    def test_frontend_only_monthly_debt_value_cannot_override_dti(self):
        with patch.object(predictor._xgb, "predict_proba", wraps=predictor._xgb.predict_proba) as model:
            response = self.client.post("/api/score", json={"dti": 10, "monthlyDebtPayments": 99999})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(model.call_args.args[0].iloc[0]["dti"], 10)
        self.assertNotIn("monthlyDebtPayments", model.call_args.args[0].columns)

    def test_pricing_units_losses_and_cap_match_the_training_formula(self):
        for probability in (0.1, 0.9):
            with self.subTest(probability=probability):
                with patch.object(predictor._platt, "predict_proba", return_value=np.array([[1 - probability, probability]])):
                    result = predictor.score({"loan_amnt": 2000})
                loss_rate = probability * predictor.LGD
                uncapped_rate = predictor.FUNDING_COST + predictor.OPERATING_MARGIN + loss_rate
                self.assertEqual(result["el_rate_pct"], round(loss_rate * 100, 1))
                self.assertEqual(result["el_dollars"], round(loss_rate * 2000, 2))
                self.assertEqual(result["suggested_rate_pct"], round(min(uncapped_rate, 0.4) * 100, 2))
                self.assertEqual(result["uncapped_suggested_rate_pct"], round(uncapped_rate * 100, 2))
                self.assertEqual(result["pricing_capped"], uncapped_rate > 0.4)

    def test_risk_indicators_use_the_same_derived_ratio_as_the_model(self):
        result = predictor.score({"loan_amnt": 40000, "annual_inc": 64000})
        lti = next(driver for driver in result["risk_drivers"] if driver["label"] == "Loan-to-Income Ratio (LTI)")
        self.assertEqual(lti["value_str"], f"{40000 / 64000:.2f}")

    def test_model_metadata_and_dropdowns_match_training(self):
        self.assertEqual(list(predictor._xgb.feature_names_in_), predictor.FEATURE_COLS)
        self.assertFalse(set(predictor.FEATURE_COLS) & {"grade", "int_rate", "sub_grade", "loan_status", "recoveries"})
        encoder = predictor._xgb.named_steps["prep"].named_transformers_["cat"].named_steps["oh"]
        for field, categories in zip(predictor.CATEGORICAL_FEATURES, encoder.categories_):
            self.assertFalse(set(CATEGORICAL_OPTIONS[field]) - set(categories))

    def test_direct_scorer_also_rejects_invalid_values(self):
        with self.assertRaises(ApplicationValidationError):
            predictor.score({"loan_amnt": 0})


if __name__ == "__main__":
    unittest.main()
