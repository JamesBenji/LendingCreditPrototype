## Three reproducibility levels

A frozen-model evaluation asks whether the saved pipeline produces the recorded predictions on the reconstructed loans. Retraining asks whether the full data preparation, search and calibration process can produce a comparable model again. Those are different tests. The recorded audit performs the first without fitting new estimators. {{source:reproduce|Frozen-evaluation method}}

Frozen-model reproduction reconstructs the sampled/cleaned split and evaluates saved artifacts. The recorded method calls no estimator fit. Retraining would rerun parameter search, baselines, calibration and export. Complete experiment reproduction would additionally reproduce all data sourcing, EDA, comparison intervals and loss studies in a locked environment. Only the frozen XGBoost evaluation is recorded as reproduced here. {{evidence:frozen}} {{evidence:comparisons}}

## Artifact identities and state

The export contains the XGBoost preprocessing pipeline, Platt calibrator and metadata with ordered fields, training medians/modes, net LGD and cost assumptions. Logistic and combined models are not exported for serving. Recorded hashes and versions are below. {{source:model|Saved model}} {{source:calibrator|Saved calibrator}} {{source:metadata|Metadata}} {{evidence:artifact}}

Seed 42 controls sampling, engineering diagnostics and search; paired bootstrap helper uses seed 0. Broad research requirements do not lock the original training environment. Joblib and fitted preprocessing are version-sensitive. Local Python 3.9 and Python 3.13 compatibility reports are narrower than full Linux/VM equivalence. {{source:requirements|Research requirements}} {{source:python313-compatibility|Compatibility report}}

## Commands and their limits

The repository provides frozen evaluation and runtime inspection scripts. They need an appropriate trusted runtime; the frozen evaluator also needs the exact raw dataset. API and repayment tests prove functional behaviour, not fairness or generalisation. {{source:inspect|Runtime inspector}} {{source:reproduce|Frozen evaluator}} {{source:api-tests|Backend tests}} {{source:dti-test|DTI tests}}

```sh
# From the repository root; optional evidence reproduction, not site build.
.venv/bin/python scripts/inspect_runtime.py
.venv/bin/python scripts/reproduce_saved_model.py /path/to/accepted_2007_to_2018Q4.csv.gz
```

## What a matching hash does and does not establish

Matching artifact and dataset hashes establishes file identity. Reproducing predictions also checks the loaded runtime behaviour. Neither reconstructs undocumented training conditions or newly fits the logistic and combined comparison models. The frozen result is therefore a useful narrower verification; completing the whole experiment requires the original data process, environment and model-selection steps to be repeatable. {{source:reproduced-metrics|Dataset hash, artifact hashes and method}} {{evidence:artifact}}
