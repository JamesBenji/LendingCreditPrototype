## Minimum references

Constant training prevalence asks whether probability error improves over one answer for everyone. Only its validation Brier score is printed. FICO-only logistic tests a single score. LC pricing logistic uses sub_grade plus int_rate to set an incumbent bar. {{source:notebook|Baselines — cell 22, t9JMfqiGbFyL}}

Application logistic tests additive eligible information. Application XGBoost tests nonlinear effects and interactions on the same input set. Calibrated XGBoost tests validation-fitted probability adjustment. {{source:notebook|Application models — cells 22–28}}

## Complementary information

Combined logistic and XGBoost add LC pricing to application fields. They test complementary ranking information, not the served application-only model. {{evidence:test-table}}

Combined XGBoost versus LC logistic changes both fields and estimator. It cannot isolate gain to extra fields alone. A matched price-only XGBoost or a paired combined-logistic comparison would separate these effects better. {{source:notebook|Combined model comparison — cell 26}} {{evidence:comparisons}}

## What the hierarchy cannot prove

The model ladder tests information and complexity in one selected historical population. It is not a claim that an algorithm is always best. Training, calibration and policy answer different questions; keep their evidence separate when choosing a model for a new cohort. {{evidence:comparisons}}

## The constant baseline tests a different kind of usefulness

A constant forecast can be close to the average event share and still give every borrower the same score. It therefore cannot prioritise risk. The FICO and LC benchmarks test how much ranking comes from a single familiar signal or the incumbent's assessment. The full models must justify what they add beyond those references; beating a constant forecast alone would be a weak claim for lending usefulness. {{source:notebook|Baselines and constant Brier reference — cell 22}}
