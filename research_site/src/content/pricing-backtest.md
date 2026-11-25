## Test-loan risk deciles

The notebook groups test loans into calibrated-risk deciles. It prints mean PD, predicted loss, realised default, realised principal loss, LC rate and suggested rate. Predicted mean PD times fixed LGD is not weighted the same way as total realised loss divided by total funded principal. This limits a direct equality claim. {{source:notebook|Back-test — cell 34}} {{evidence:pricing}}

Saved top-decile predicted loss is 31.4% while realised loss is 37.7%. The lowest decile rounds to 4.3% for both. Increasing risk generally tracks loss, but middle and upper bins understate realised principal loss. Calibration alone cannot correct severity or exposure-weighting errors. {{evidence:pricing}}

## LC grade interpretation

The grade table compares incumbent rates and losses. Grade G has only 181 test loans; grade A has 2,894. Some realised loss shares exceed annual LC rates. Subtracting a lifetime loss share from annual interest is not net profit. Neither that subtraction nor gross scheduled interest validates an economic return. {{source:notebook|Grade table — cell 34}} {{source:defense|Pricing interpretation}}

## Sensitivity separates evidence and assumptions

The saved grid varies LGD by ±10 percentage points and funding from 3% to 5%, holding margin at 2.5%. Median suggested rates span 16.0% to 22.3%. The model’s own PD×LGD contribution has saved p10/p50/p90 of 5.7/12.6/26.1 percentage points. {{source:notebook|Sensitivity — cell 35, 8WXB_6sDbFyM}}

The derivatives explain why assumptions matter: $\partial Rate/\partial Funding=1$, $\partial Rate/\partial Margin=1$, and $\partial Rate/\partial LGD=PD$. A one-point margin increase shifts every uncapped rate by one point. No saved operating-margin grid is present; this derivative is algebra, not a newly run simulation. {{evidence:cost}}

The back-test is descriptive test evidence; the sensitivity grid is an illustrative scenario simulation. Neither establishes applicant demand, approval utility or net lending returns. {{evidence:pricing}}
