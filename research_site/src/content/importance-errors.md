## Permutation importance

The notebook samples up to 5,000 test loans, shuffles one conceptual field, recomputes AP, and measures the decrease. It repeats three times with seed 42. Larger average decreases indicate stronger predictive reliance in that sample. {{source:notebook|Permutation importance — cell 32, YyFadYuCbFyM}}

Saved largest AP drops are term 0.0460, FICO average 0.0189 and loan-to-income 0.0102. They are saved output, not newly recomputed here. Correlated fields can share or hide importance. Shuffling can create unrealistic borrowers. Importance varies by cohort and does not prove a causal effect. {{evidence:importance}}

## False negatives and false positives

A false negative is a charge-off below the chosen flag threshold; a false positive is a fully paid loan above it. The operating-point table records aggregate precision and recall, but the repository does not preserve loan-level error examples or complete subgroup error tables. Do not infer why an individual was misclassified. {{evidence:operating}}

## Proposed subgroup study

Evaluate false-positive/negative rates, AP, calibration and sample support by term, purpose, FICO band and issue period. The EDA contains group default shares, not model-performance estimates for those groups. Subgroup calibration, protected-class and proxy analyses remain unresolved. A proposed analysis must hold thresholds fixed and use mature outcomes, uncertainty intervals and minimum sample support. {{evidence:future}} {{evidence:fairness}}

## UI indicators are heuristic

The serving code compares selected values with training medians using hand-set risk directions. These indicators are neither permutation importance nor local tree explanations. Rounded input and median can look equal while an unrounded difference triggers an indicator. {{source:predictor|Heuristic indicators|98-173}}
