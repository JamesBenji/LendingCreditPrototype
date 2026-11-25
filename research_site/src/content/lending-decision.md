## The lender’s decision

The business objective is to estimate the risk of a loan for a given customer profile and use that estimate to support risk-based loan pricing. The lender commits money before seeing repayment. A risk estimate must use information available at application or pricing time. {{evidence:pipeline}}

The unit is one accepted LendingClub loan. The recorded issue month is a proxy for the decision timestamp. The target is final charge-off status at the dataset snapshot. There is no fixed outcome window or exact application timestamp in the working design. This limits the claim about future applicants. {{evidence:timing}}

## What the model predicts

Probability of default (PD) is the conditional chance of the target event:

$$PD(x)=P(Y=1\mid X=x)$$

Here, $Y=1$ means Charged Off, $Y=0$ means Fully Paid, and $X$ is the eligible application feature set. Default here is a charge-off proxy, not every legal definition. The target is set in {{source:notebook|Target and cleaning — cell 10, NIRO3uBSbFyJ}}.

Only PD is directly predicted. A binary class requires a cutoff. Underwriting policy decides what to do at that cutoff. An approve or refer recommendation is a policy result, not a second trained model. {{evidence:serving}}

## How probability becomes loss and price

Loss given default (LGD) is the principal-loss fraction conditional on charge-off. The notebook measures one aggregate LGD from training-period charge-offs. It does not predict borrower-specific severity. {{evidence:pricing}}

$$\text{Expected loss rate}=PD\times LGD$$

Multiplying this fraction by principal gives an illustrative expected loss amount. This assumes training loss severity transfers across applicants, terms and cohorts.

$$\text{Suggested rate}=\text{Funding cost}+\text{Operating margin}+PD\times LGD$$

| Quantity         | Source                                                  |
| ---------------- | ------------------------------------------------------- |
| PD               | Calibrated model output. {{evidence:frozen}}            |
| LGD              | Measured training charge-off loss. {{evidence:pricing}} |
| Funding cost     | Assumption. {{evidence:cost}}                           |
| Operating margin | Assumption. {{evidence:cost}}                           |
| Suggested rate   | Calculation. {{evidence:serving}}                       |

This rule combines lifetime loss with annual-looking cost terms. It is not a validated price. A repayment schedule answers another question: what payments clear a balance if every payment arrives on time? Gross scheduled interest is not net profit.

## Claims and boundaries

A useful model must rank risk, estimate probabilities, transfer to later cohorts and compare with LendingClub’s own assessment. Accuracy alone cannot answer those questions. Pricing needs calibrated probabilities, not just rankings.

The evidence supports historical comparisons and a synthetic engineering trace. It does not establish lawful policy, fairness, profit, reject-inference validity or reduced-form performance. {{evidence:fairness}}

## A price inherits every assumption behind PD

A calibrated PD can still lead to a poor price if loss severity or the time horizon is wrong. Multiplying by LGD transfers the training severity assumption into every applicant's estimate; adding funding and margin transfers financial assumptions too. The business question therefore needs separate checks on probability, severity and cash-flow timing. One good ranking metric cannot establish that whole chain. {{source:notebook|Calibration and pricing — cells 28–35}} {{evidence:pricing}}
