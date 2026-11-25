## Decision and implementation

Default rates change by year. A random split mixes older and newer conditions. Sorting by issue month and slicing the oldest 70%, next 15% and newest 15% more closely tests transfer through time. {{source:notebook|Time split — cell 18, iX0uOEGebFyL}} {{evidence:sample}}

The deployment analogy is to train on earlier resolved loans and evaluate on later applicants. The actual test contains later accepted resolved loans, not all later applicants.

## Partition roles

Training fits preprocessing and estimators; temporal CV chooses XGBoost parameters inside training. Validation supports assessment, Platt scaling and recall-threshold selection. Test measures later ranking, calibration and loss. {{source:notebook|Evaluation sequence — cells 20–35}}

## Chronological does not mean unbiased

Shared boundary months show index slicing rather than month-disjoint partitions. Repeated borrower overlap is not audited. Full-sample EDA has already seen test labels, weakening untouched-test language. Censoring, accepted-loan selection and changing underwriting remain. A stricter next study needs mature fixed-window outcomes and entity-aware disjoint periods. {{source:notebook|Ordered split — cell 18}} {{evidence:future}}
