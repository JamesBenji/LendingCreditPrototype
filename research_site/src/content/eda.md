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

All these inspections use labels from the full frame before splitting. Training-only preprocessing prevents fitted-state leakage, but analyst choices have seen holdout patterns. A stronger protocol would freeze hypotheses from training-only EDA and use a new untouched cohort. {{source:notebook|Full-sample EDA before splitting — cells 12–18}} {{evidence:future}}

## Loan counts show unequal cohort support

Question: which years dominate the evidence? The saved year table peaks at 30,029 sampled loans in 2015, compared with 24 in 2007 and 4,537 in 2018. The sample reads every chunk, but that does not give equal support to every year. A small early-cohort rate is much less stable than a large middle-cohort rate. The consequence is to carry counts alongside rates and avoid treating all years as equally precise. Sampling and final-outcome selection still limit population claims. {{source:notebook|Counts by issue year — cell 12}} {{evidence:eda}}

## LC grade separates observed risk

Question: does incumbent grade already rank risk? The saved full-sample grade bars rise from A through G. This supports using LC assessment as a serious benchmark. It does not prove that the independent application model beats that assessment. The decision is to fit a separate sub-grade-plus-rate benchmark and keep those fields outside the application-only model. Grade differences are descriptive; selection, maturity and LC’s own underwriting are part of the association. {{source:notebook|Grade figure — cell 12; benchmark — cell 22}} {{evidence:eda}}

## Higher observed FICO bands have lower default shares

Question: does one score provide a useful simple reference? The drawn FICO-band bars decline across the higher observed bands. The decision is to retain a FICO-only logistic baseline and consolidate the two score bounds into one midpoint. Empty bars in the lowest intervals must not be read as zero default risk. The figure does not validate performance for those applicants, and the form’s broader allowed FICO range is a separate serving concern. {{source:notebook|FICO-band figure — cell 12; FICO reference — cell 22}} {{evidence:eda}}

## Higher plotted DTI groups have higher default shares

Question: does existing debt burden relate to the outcome? The saved clipped-DTI quintile bars rise across groups. This supports investigating burden variables, including loan-to-income, which describes proposed exposure rather than existing monthly debt. The DTI clipping is a plotting decision and is not fitted model preprocessing. Quantile association is not causality, and source debt definitions still need confirmation. {{source:notebook|DTI quintile figure — cell 12; feature engineering — cell 16}} {{evidence:eda}}

## Longer term is associated with more charge-offs

Question: does the repayment horizon matter? The saved 60-month term bar is higher than the 36-month bar. Keeping term lets models use an exposure-horizon signal. It also motivates checking model performance by term in a future study. The figure is not a controlled estimate of term’s causal effect: borrowers and loan sizes can differ, and longer loans have different time to resolve. {{source:notebook|Term figure — cell 12}} {{evidence:eda}}

## Purpose changes both sample mix and observed risk

Question: is the sample mainly one borrowing purpose? The saved purpose table has 62,291 debt-consolidation loans, the largest printed group. Small business has a higher observed charge-off share than credit card in the same table. Retaining purpose preserves a meaningful borrowing context, but group prevalence is not subgroup model performance. A proposed error analysis must evaluate fixed-threshold errors and calibration within purpose, with sample support and uncertainty. {{source:notebook|Purpose counts and default shares — cell 13}} {{evidence:eda}} {{evidence:future}}
