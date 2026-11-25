## Form and client calculations

React loads options and defaults, holds controlled fields, then sends a score request. Monthly debt is client-only. DTI is monthly debt divided by annual income times 1200 and is sent with one decimal. Invalid income/debt returns no DTI. Network and server errors become form messages. {{source:react-app|Options and result state}} {{source:dti|DTI calculation}} {{source:form|Submission|138-163}}

## API and validation

Flask checks JSON content type, parses the body and returns structured validation errors. Numeric rules reject nonfinite values, booleans, ranges and invalid counts. Category whitelists reject unsupported choices. Omitted keys default even when a supplied blank would be required; unknown keys are ignored. Browser increments are not API rules. {{source:api|Score route|33-49}} {{evidence:schema}}

## Feature preparation and prediction

The predictor copies training defaults, overwrites accepted current fields, recomputes loan-to-income and builds the exact saved column order. The saved preprocessing/XGBoost pipeline produces raw PD. The validation-fitted calibrator transforms clipped raw log-odds to calibrated PD. No request fits a model. Artifact-load or version errors can prevent startup. {{source:predictor|Loading|17-30}} {{source:predictor|Build row|83-94}} {{source:predictor|Raw and calibrated PD|199-206}}

## Calculations and policy

Calibrated PD times measured LGD gives expected loss rate, then principal gives loss dollars. Funding, margin and loss produce an uncapped rate, clipped to 40%. Unrounded PD chooses approve/refer/decline. Hand-directed median deviations create heuristic indicators. The displayed annual rate is rounded before repayment calculation. {{source:predictor|Calculations, policy and response|205-243}}

## Repayment and rendering

$$M=\frac{Pr}{1-(1+r)^{-n}},\qquad r=\frac{annual\_rate\_pct}{1200}$$

At zero rate, $M=P/n$. Decimal arithmetic rounds each regular payment and interest amount to cents. The final payment clears the residual balance. Total repayment is $(n-1)$ regular rounded payments plus final payment; interest is total minus principal. No default, fee or prepayment is simulated. {{source:repayment|Amortisation|4-38}}

The API returns risk, recommendation, loss, price, payments and indicators. The UI renders them and can reset the assessment. A declined case still has a hypothetical schedule; it is not a loan offer. Gross interest does not equal net profit. {{source:result|Response rendering}} {{evidence:serving}}
