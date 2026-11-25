## Search protocol

RandomizedSearchCV samples 18 combinations across three TimeSeriesSplit folds: 54 fits in the saved run. Average precision is the search score; seed 42 controls the search and model. Best saved CV AP is 0.3874. The selected pipeline refits on the full training partition. {{source:notebook|Search — cell 24}} {{evidence:search}}

Defaults are the minority class. Average precision focuses on positive-class ranking more directly than accuracy, but does not calibrate probabilities or optimise lending costs.

## Expanding temporal folds

Each fold trains on earlier loans and validates on a later block. Later folds expand training history. No gap or entity grouping is specified. The diagram is schematic and does not invent exact fold dates. {{source:notebook|TimeSeriesSplit(n_splits=3) — cell 24}}

## Selection boundary

Training CV chooses parameters. Validation fits the calibrator and cutoffs. Test records final metrics. Earlier full-sample EDA prevents a fully blinded-test claim. The paired bootstrap also does not include all search, temporal or multiple-comparison uncertainty. {{source:notebook|EDA and temporal evaluation — cells 12–24}} {{evidence:comparisons}}
