## Hypothesis and implementation

Burden can interact with term, utilisation and credit history. Trees represent threshold interactions. Boosting adds trees sequentially to improve the current score; a logistic link maps the ensemble margin to probability. The pipeline uses histogram trees, binary logistic objective, log-loss evaluation and seed 42. {{source:notebook|XGBoost — cell 24, CMoSPKcQbFyL}}

## Complexity controls

Search varies tree count, depth, learning rate, row/column sampling, child weight and L1/L2 penalties. The saved choice is 250 trees, depth 5, rate 0.02, subsample 0.85, column sample 1.0, child weight 10, alpha 0.2 and lambda 5. The artifact inspection agrees. These settings constrain complexity without proving an optimal solution. {{evidence:search}} {{evidence:artifact}}

## Result and doubt

Frozen test AUC is 0.6828235319536293. Saved XGBoost-minus-logistic difference is 0.0029 with interval −0.0014 to 0.0073. No stronger-model gain was demonstrated. Exporting XGBoost is the project’s implemented choice, not proof that its complexity was necessary. Changed cohorts or default-filled serving inputs may alter the comparison. {{evidence:frozen}} {{evidence:comparisons}}
