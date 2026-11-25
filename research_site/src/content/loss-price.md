## Measure principal loss on training charge-offs

$$GrossLoss_i=\max(Funded_i-PrincipalRepaid_i,0)$$
$$NetLoss_i=\max(GrossLoss_i-Recoveries_i,0)$$
$$LGD=\frac{\sum_{i:Y_i=1} NetLoss_i}{\sum_{i:Y_i=1} Funded_i}$$

Funded principal comes from funded_amnt, principal repaid from total_rec_prncp and recoveries from recoveries. This is exposure-weighted severity among training charge-offs. It is not the mean of per-loan LGDs and not a predicted LGD for each borrower. {{source:notebook|Loss measurement — cell 34, qOsJma-tbFyM}}

Saved gross LGD is about 67.2%; measured net LGD is 0.5898284294117135 in exported metadata. Deducting recoveries reduces principal loss. The timing and cost of collection are not valued. {{evidence:pricing}} {{source:metadata|Measured net LGD}}

## Combine probability and severity

$$ELRate=PD\times LGD,\qquad ELDollars=Principal\times ELRate$$
$$SuggestedRate=Funding+Margin+ELRate$$

Funding is assumed 4%; margin is assumed 2.5%. PD is calibrated model output. LGD is measured from the training loss population. Serving caps the calculated annual-looking rate at 40%; the notebook sensitivity rule is not the capped API calculation. {{evidence:cost}} {{source:predictor|Loss and rate calculation|205-213}}

## Simplifications that prevent real pricing

The rule omits interest received before default, prepayment, time value of money, collection costs, capital charge, liquidity premium, acquisition cost, tax, regulatory constraints and competitive demand response. It combines lifetime loss with annual-looking funding and margin terms. A fixed aggregate LGD also misses borrower, term and cohort variation. {{source:notebook|Simplified pricing rule — cell 34}}

These omissions can move price in different directions. The rule is illustrative, not a verified profit-maximising or production-ready price. A financially consistent alternative needs default timing, cash flows, discounting, recoveries and costs over the same horizon. {{evidence:future}}
