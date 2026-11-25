## FICO average

$$fico\_avg=\frac{fico\_range\_low+fico\_range\_high}{2}$$

Two bounds describe one score range. Their saved correlation is 1.0 to four decimals. One midpoint is easier to interpret and avoids duplication. Range-width information is lost; its added value is not tested. Missing-bound row-mean behaviour is covered in cleaning. {{source:notebook|FICO — cell 10}} {{evidence:eda}}

## Credit-history length

$$credit\_history\_years=\max\left(\frac{issue\_d-earliest\_cr\_line}{365.25},0\right)$$

The subtraction is in days. The duration describes history maturity at issue rather than an absolute date. Negative values are clipped to zero; an invalid date could be hidden by that rule. Both raw dates are excluded afterward. Saved quintile default shares decline from 22.3% to 17.5%, supporting an association rather than a causal claim. {{source:notebook|History — cell 16, 4VtlLw-BbFyK}} {{evidence:eda}}

## Loan-to-income

$$loan\_to\_income=\frac{loan\_amnt}{annual\_inc}$$

The same principal represents more burden at lower income. This uses proposed exposure and annual income. DTI measures existing debt payments relative to income. Zero income becomes missing; low positive income can make the ratio unstable. Plotting clips high quantiles but model inputs are not clipped. Saved quintile default rates rise from 13.4% to 29.1%. Serving recomputes the ratio using current inputs. {{source:notebook|Burden — cell 16}} {{source:predictor|Ratio recomputation|83-94}}

## Admission rule and debt

The stated rule requires monotonic default patterns. The code only prints grouped rates and always adds all three features. There is no formal test or automatic rejection. A complete process would state a hypothesis, derive a feature, inspect training-only quantiles, test stability and apply a predeclared admission rule. Non-monotonic effects may still be useful when supported by domain reasoning. {{source:notebook|Rule — cell 15; unconditional list — cell 16}} {{evidence:future}}

## The ratios answer different burden questions

Loan-to-income compares proposed principal with annual income; DTI compares existing monthly obligations with income. Neither alone measures the proposed monthly instalment. Two loans with the same principal and income can have the same loan-to-income ratio but different payments because term and rate differ. This explains why term remains an input and why the ratio should not be described as a complete affordability test. {{source:notebook|Loan-to-income and term inputs — cell 16}} {{source:repayment|Payment depends on rate and term|4-38}}
