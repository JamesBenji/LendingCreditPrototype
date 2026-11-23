import unittest
from unittest.mock import patch

import numpy as np

import predictor
from app import app
from repayment import calculate_repayment


class RepaymentTests(unittest.TestCase):
    def test_one_month_loan_has_one_month_of_interest(self):
        result = calculate_repayment(1000, 12, 1)
        self.assertEqual(result["monthly_payment"], 1010)
        self.assertEqual(result["final_payment"], 1010)
        self.assertEqual(result["total_repayment"], 1010)
        self.assertEqual(result["total_interest"], 10)

    def test_two_month_loan_charges_interest_on_the_remaining_balance(self):
        result = calculate_repayment(1000, 12, 2)
        self.assertEqual(result["monthly_payment"], 507.51)
        self.assertEqual(result["total_repayment"], 1015.02)
        self.assertEqual(result["total_interest"], 15.02)

    def test_zero_interest_adjusts_the_last_payment_without_creating_interest(self):
        result = calculate_repayment(1000, 0, 3)
        self.assertEqual(result["monthly_payment"], 333.33)
        self.assertEqual(result["final_payment"], 333.34)
        self.assertEqual(result["total_repayment"], 1000)
        self.assertEqual(result["total_interest"], 0)

    def test_longer_term_reduces_monthly_payment_but_increases_total_interest(self):
        short = calculate_repayment(12000, 12, 36)
        long = calculate_repayment(12000, 12, 60)
        self.assertLess(long["monthly_payment"], short["monthly_payment"])
        self.assertGreater(long["total_interest"], short["total_interest"])

    def test_displayed_payments_sum_to_total_and_interest(self):
        result = calculate_repayment(12000, 15.97, 36)
        self.assertEqual(round(result["monthly_payment"] * 35 + result["final_payment"], 2), result["total_repayment"])
        self.assertEqual(round(result["total_repayment"] - 12000, 2), result["total_interest"])

    def test_invalid_calculation_inputs_are_rejected(self):
        for principal, rate, months in [(0, 12, 36), (1000, -1, 36), (1000, 12, 0), (1000, 12, 1.5), (1000, float("inf"), 36)]:
            with self.subTest(principal=principal, rate=rate, months=months):
                with self.assertRaises(ValueError):
                    calculate_repayment(principal, rate, months)

    def test_api_uses_the_selected_term_and_displayed_capped_rate(self):
        client = app.test_client()
        for term in ("36 months", "60 months"):
            with self.subTest(term=term):
                with patch.object(predictor._platt, "predict_proba", return_value=np.array([[0.1, 0.9]])):
                    response = client.post("/api/score", json={"loan_amnt": 12000, "term": term})
                self.assertEqual(response.status_code, 200)
                result = response.get_json()
                self.assertEqual(result["suggested_rate_pct"], 40)
                expected = calculate_repayment(12000, 40, int(term.split()[0]))
                for field, value in expected.items():
                    self.assertEqual(result[field], value)


if __name__ == "__main__":
    unittest.main()
