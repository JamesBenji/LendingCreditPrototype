## Three reproducibility levels

This site extracts committed notebook source/output, metadata and all JSON evidence deterministically. It does not run Python, load joblib, read the private raw CSV or retrain models. {{source:notebook|Export — cell 37}} {{source:reproduce|Frozen-evaluation script}}

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

The notebook was not retrained for this site. Changes in source or evidence should regenerate extracted records, fail consistency checks and receive an editorial review rather than silently upgrading evidence labels.

## Rebuild this independent publication

The static site has its own checks. {{source:site-guide|View the local build and evidence-update guide}} {{source:site-test|Open the content-consistency tests}} {{source:site-extract|Inspect deterministic extraction}} {{source:site-browser|Open responsive and accessibility checks}} {{source:pages-workflow|View the dedicated Pages workflow}}

These checks validate publication content, links, counts and reading behaviour. They do not retrain the notebook or establish new model-performance evidence. {{evidence:frozen}}
