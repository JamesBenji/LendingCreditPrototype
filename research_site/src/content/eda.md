## Year drift → chronological split

Question: is risk stable by issue year? Saved full-sample output gives counts and default shares. Rates rise from 15.2% in 2013 to 23.4% in 2016 and 23.5% in 2017, then fall to 16.2% in the selected 2018 slice. The consequence is temporal evaluation, not random mixing. The latest drop does not prove safer lending because maturity selection remains. {{source:notebook|Year table — cell 12, ce0OOCCdbFyK}} {{evidence:eda}}

## LC grade, FICO, DTI and term

The saved six-panel figure inspects LC grade, FICO bands, clipped DTI quintiles and term against default. LC grade motivates an incumbent benchmark. FICO motivates a one-score reference. DTI and term motivate burden and horizon hypotheses. Exact bar heights are not printed as tables, so no numeric values are invented here. Inspect the original axes in {{source:notebook|Saved EDA figure — cell 12}}. These are associations, not causal evidence. {{evidence:eda}}

## Missingness → indicators

Saved missing rates are 13.1% for recent-inquiry months, 8.7% for num_tl_120dpd_2m and 5.8% for employment length. Some bureau columns are fully absent in early years. Recent-inquiry months are 100% missing from 2007 through 2011. Median imputation plus indicators preserves that absence pattern. It may encode collection era rather than stable borrower risk. {{source:notebook|Missingness — cell 13, lOX_SssWbFyK}}

## FICO redundancy → midpoint; price association → benchmark

FICO bounds correlate at 1.0 to four decimals. Their midpoint avoids near duplication. Midpoint FICO and LC rate correlate at −0.4 in saved output. LC already prices part of this signal, so price must be benchmarked separately. {{source:notebook|Correlation — cells 10 and 13}}

## Extreme values and purpose

The saved sample has 39 DTI values above 100 and 45 incomes below 5,000. DTI is clipped only for the EDA grouping. Saved purpose output shows 1,251 small-business loans at 30.5% default versus 23,506 credit-card loans at 16.9%. Population, term and other factors can confound that comparison. {{source:notebook|Anomalies and purpose — cell 13}} {{evidence:eda}}

## Analyst leakage limits the result

All these inspections use labels from the full frame before splitting. Training-only preprocessing prevents fitted-state leakage, but analyst choices have seen holdout patterns. A stronger protocol would freeze hypotheses from training-only EDA and use a new untouched cohort. {{source:defense|Holdout used in EDA}} {{evidence:future}}
