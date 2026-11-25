## Log-odds formulation

$$P(Y=1\mid X)=\sigma(\beta_0+\beta^TX),\qquad \sigma(z)=\frac{1}{1+e^{-z}}$$

The intercept is $\beta_0$. Coefficients $\beta$ act on transformed inputs $X$. The sigmoid converts an additive score to probability. A coefficient changes conditional log-odds, not a fixed number of probability points. {{source:notebook|logit_pipe — cell 22}}

## Regularised reference

Additive structure is simpler to inspect than interactions in hundreds of trees. Regularisation discourages extreme coefficients. The code sets C=1.0 and max_iter=3000 without explicit class weights. Scaling makes the penalty less dependent on raw units. {{evidence:pipeline}}

A scaled coefficient concerns a standardised unit. One-hot coding, correlation and penalties affect interpretation. Coefficients are not causal and are not exported here, so there is no justified fitted-coefficient table. {{source:defense|Learned parameters and weights}}

## Result

Saved application-logistic test AUC is 0.6800, close to XGBoost’s 0.6828. The paired difference interval includes zero. Logistic remains a credible simple reference. Transparency alone does not establish calibration or fairness. {{evidence:test-table}} {{evidence:comparisons}}
