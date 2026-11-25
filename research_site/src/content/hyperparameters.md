## Search protocol

RandomizedSearchCV samples 18 combinations across three TimeSeriesSplit folds: 54 fits in the saved run. Average precision is the search score; seed 42 controls the search and model. Best saved CV AP is 0.3874. The selected pipeline refits on the full training partition. {{source:notebook|Search — cell 24}} {{evidence:search}}

Defaults are the minority class. Average precision focuses on positive-class ranking more directly than accuracy, but does not calibrate probabilities or optimise lending costs.

## Expanding temporal folds

Each fold trains on earlier loans and validates on a later block. Later folds expand training history. No gap or entity grouping is specified. The folds follow row order inside training rather than a separately defined calendar or borrower boundary. {{source:notebook|TimeSeriesSplit(n_splits=3) — cell 24}}

## Selection boundary

Training CV chooses parameters. Validation fits the calibrator and cutoffs. Test records final metrics. Earlier full-sample EDA prevents a fully blinded-test claim. The paired bootstrap also does not include all search, temporal or multiple-comparison uncertainty. {{source:notebook|EDA and temporal evaluation — cells 12–24}} {{evidence:comparisons}}

## The winning score is conditional on the search

The best candidate is the best among the combinations and temporal folds that were evaluated. It is not a global optimum, and average precision varies with the event share in each fold. More search could alter the selected configuration without resolving label maturity or serving inputs. The next priority is a cleaner evaluation boundary and a matched serving study, rather than assuming that a larger parameter search will fix those problems. {{evidence:search}} {{evidence:future}}
