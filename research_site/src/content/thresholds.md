## Validation-selected recall threshold

For each model, the notebook chooses the highest validation cutoff still reaching at least 70% default recall. It then applies that unchanged cutoff to test and reports flagged share, precision and achieved recall. {{source:notebook|Operating point — cell 30, vx-KJEY5bFyL}} {{evidence:operating}}

Saved calibrated XGBoost cutoff is 0.226. Test flags 46.4% of loans, precision is 30.6% and recall is 66.1%. The desired validation recall does not automatically transfer. A false negative can miss a future charge-off; a false positive can block or burden a borrower who would repay. {{evidence:operating}}

## Application policy is different

The deployed rule approves PD below 15%, refers PD from 15% to below 30%, and declines PD at or above 30%. It uses unrounded PD. These are hand-set policy assumptions, not the notebook’s recall cutoffs or learned classifier weights. {{source:predictor|Thresholds|35-38}} {{source:predictor|Decision rule|214-222}}

## What approval would require

Costs of errors, capacity for review, applicant rights and regulation must be validated separately. A high-risk flag is not a justified adverse-action reason. Neither this experiment nor the prototype establishes an approved lending policy. {{evidence:fairness}}
