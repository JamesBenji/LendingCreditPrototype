# EAB Credit — Lending Credit Prototype

A university research prototype for estimating loan charge-off risk and demonstrating illustrative lending decisions, pricing and repayments with synthetic applications.

The React frontend collects application and credit information. Flask validates it, prepares the saved model’s 56-feature input, runs an XGBoost pipeline and a Platt calibrator, and returns risk, expected loss and a fixed-payment schedule. **Only default probability is directly predicted.** Interest, repayment and loss amounts are calculations; “Profit (Before Costs)” is gross interest income.

## Study and defend the project

- [Defense guide](docs/DEFENSE_GUIDE.md): business/research framing, every field, request-to-response trace, training, evaluation, artifacts, opening speech, demo and examiner questions.
- [Runtime evidence](docs/evidence/runtime-inspection.json): inspected commit, artifact hashes, versions, feature usage, synthetic traces and local resource measurements.
- [Reproduced metrics](docs/evidence/reproduced-metrics.json): frozen-model evaluation on the cached dataset, without retraining.
- [Saved notebook outputs](docs/evidence/notebook-outputs.json): historical notebook evidence, explicitly separated from reproduced results.
- [Deployment guide](docs/DEPLOYMENT.md): prepared nginx/Gunicorn/systemd setup, compatibility evidence, SSH-tunnel access, verification and rollback; GCP activation awaits instance/SSH details.

The audit starts at commit **d8643c8e1f3aa3c34ba95279291706a7ac96d5eb**. Documentation/deployment additions are not a new training run.

## What the evidence shows

The resolved-loan sample has 107,625 records and an ordered 70%/15%/15% train/validation/test split. The saved application-only XGBoost’s reproduced test ROC-AUC is **0.6828**, average precision **0.3601**, and top-decile lift **2.0732**. Calibration reduces ten-bin ECE from **0.0363** to **0.0318**, but mean calibrated PD is **24.41%** versus **21.49%** observed defaults.

The notebook’s bootstrap interval for XGBoost versus logistic regression includes zero: do not claim demonstrated superiority. Application-plus-incumbent-pricing models show incremental ranking information, but those combined models are not served by Flask.

The UI supplies 15 raw model features, including calculated DTI; the backend derives loan-to-income. **40 other features use training defaults.** Full-feature notebook metrics are not a validated performance claim for the reduced form. A post-hoc 40-default diagnostic reduces test AUC to **0.6697** and AP to **0.3379**; it is not an exact browser/API simulation. The saved trees never split on application type, although the API validates and encodes it.

## Repository map

| Path | Role |
|---|---|
| Lending_project_v2 (1).ipynb | Sampling, training, calibration, comparisons, pricing back-test and export |
| lending_artifacts/ | Saved preprocessing/XGBoost pipeline, calibrator and metadata |
| flask_app/app.py | Flask options and scoring routes |
| flask_app/application_schema.py | Validation and dropdown definitions |
| flask_app/predictor.py | Loading, feature preparation, PD, decisions, pricing and indicators |
| flask_app/repayment.py | Amortisation and cent-rounded final payment |
| flask_app/frontend/ | React/Vite UI, calculated DTI, tooltips and synthetic examples |
| flask_app/tests/ | API, mapping, thresholds, examples and repayment tests |
| scripts/ | Reproducible runtime inspection and frozen-model evaluation |

## Run locally

The verified existing environment uses Python 3.9.6, NumPy 2.0.2, pandas 2.3.3, scikit-learn 1.6.1, XGBoost 2.1.4, joblib 1.5.3, Flask 3.1.3 and flask-cors 6.0.5. The original requirements are broad ranges, **not a training-environment lock**. Check compatibility before using Debian’s newer Python.

~~~sh
python3 -m venv .venv
.venv/bin/python -m pip install -r flask_app/requirements.txt
.venv/bin/python flask_app/app.py
~~~

In another terminal, with a Vite-compatible Node version (the audit used Node 24.13.0):

~~~sh
cd flask_app/frontend
npm ci
npm run dev
~~~

Open the URL printed by Vite; its /api proxy reaches Flask on port 5001. The Python command starts the **development** server. Deployment uses a production WSGI server instead.

Examples → Set fills a complete synthetic application and recalculates DTI. Assess Application then sends the request. Preset outcomes are regression-tested against the actual artifacts.

## Check and reproduce

~~~sh
cd flask_app
../.venv/bin/python -m unittest discover -s tests -v
cd frontend
node --test src/lib/debt-to-income.test.js
npm run lint
npm run build
~~~

From the repository root:

~~~sh
OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1 \
  .venv/bin/python scripts/inspect_runtime.py

# Existing dataset copy only; no download or training is performed.
.venv/bin/python scripts/reproduce_saved_model.py /path/to/accepted_2007_to_2018Q4.csv.gz
~~~

The audit passed **27 backend tests**, **6 DTI tests**, lint/build, synthetic Flask-client predictions and invalid-request checks. The complete notebook was not retrained; logistic/comparison metrics and confidence intervals remain saved notebook evidence.

## Training versus serving dependencies

The root requirements.txt supports research. NumPy, pandas, scikit-learn, XGBoost and joblib are shared with inference; matplotlib supports plots, kagglehub downloads data, and Gradio is an optional notebook demo. IPython/a notebook runner is also needed but is not explicitly pinned there.

flask_app/requirements.txt adds Flask/flask-cors and shared inference libraries. It lacks a production WSGI server. Node/Vite/Tailwind build the frontend off the VM; a reverse proxy can serve the resulting files without Node. **Do not train or download the dataset on the 1 GB VM.**

Discuss accepted/resolved-loan selection, temporal drift, full-sample EDA, source-field timing, default-filled inputs, unvalidated policy cutoffs, absent fairness evaluation and illustrative lifetime-loss/annual-rate pricing in the defense. Successful code tests do not remove these research limitations.
