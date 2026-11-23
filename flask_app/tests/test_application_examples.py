import json
from pathlib import Path
import unittest

from app import app
from application_schema import CATEGORICAL_OPTIONS, NUMERIC_RULES


EXAMPLES = json.loads((Path(__file__).resolve().parents[1] / "frontend/src/lib/application-examples.json").read_text())


class ApplicationExampleTests(unittest.TestCase):
    def test_every_example_replaces_every_editable_field(self):
        fields = (set(NUMERIC_RULES) | set(CATEGORICAL_OPTIONS)) - {"dti"}
        for example in EXAMPLES:
            with self.subTest(example=example["title"]):
                self.assertEqual(set(example["form"]), fields)
                self.assertGreaterEqual(float(example["monthlyDebtPayments"]), 0)
                self.assertTrue(all(isinstance(value, str) for value in example["form"].values()))

    def test_examples_produce_the_advertised_results_with_the_saved_model(self):
        client = app.test_client()
        for example in EXAMPLES:
            with self.subTest(example=example["title"]):
                values = dict(example["form"])
                dti = float(example["monthlyDebtPayments"]) * 1200 / float(values["annual_inc"])
                self.assertGreaterEqual(dti, 0)
                self.assertLessEqual(dti, 100)
                values["dti"] = f"{dti:.1f}"
                response = client.post("/api/score", json=values)
                self.assertEqual(response.status_code, 200)
                result = response.get_json()
                self.assertEqual(result["decision"], example["expectedDecision"])
                self.assertEqual(result["risk_tier"], example["expectedRiskTier"])
                self.assertEqual(result["loan_amnt"], float(values["loan_amnt"]))
                self.assertEqual(result["term_months"], int(values["term"].split()[0]))


if __name__ == "__main__":
    unittest.main()
