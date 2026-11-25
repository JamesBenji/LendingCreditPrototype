## Deterministic operations

Dates use month-year parsing with invalid values coerced to missing. Text revol_util loses its percent suffix and becomes numeric. term whitespace is stripped. FICO bounds are averaged. Infinities become missing, rows without issue date are dropped, and rows are sorted by issue date. {{source:notebook|Cleaning — cell 10, NIRO3uBSbFyJ}}

The recorded row count remains 107,625. No complete parse-failure or source-anomaly report is saved. The FICO formula is a midpoint with both bounds present, but pandas row mean skips a missing bound; with one bound present it returns that bound. {{source:notebook|Saved cleaning output — cell 10}} {{evidence:sample}}

## Learned preprocessing waits

Medians, category modes, encoding groups and scaling parameters learn from a distribution. Fitting them before splitting would let later cohorts influence training. They are instead fitted inside training and CV pipelines. {{source:notebook|make_preprocess — cell 20}} {{evidence:pipeline}}

## Outliers remain a limitation

DTI is clipped for plots, not model inputs. Scaling does not remove extreme values. The research sample keeps low-income and high-DTI cases that the API may reject. This is a serving-population mismatch, not a successful outlier fix. {{source:defense|Preprocessing and engineering}} {{source:schema|Numeric rules|5-16}}
