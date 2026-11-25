## Changing default rates made a random split less convincing

The saved sample's default share rises from 15.2% in 2013 to 23.4% in 2016 and 23.5% in 2017. A random split would mix these lending conditions across training and evaluation, making transfer to a later cohort harder to see. This observation supports the chronological split. {{source:notebook|Issue-year default table — cell 12}} {{evidence:eda}}

The 2018 share falls to 16.2%, but only resolved loans are present. That fall cannot by itself establish safer lending: outcome maturity and selection also changed. Counts matter too. The saved table has 30,029 loans in 2015, compared with 24 in 2007 and 4,537 in 2018. The annual rates therefore have very different support. {{source:notebook|Issue-year counts — cell 12}}

## Missingness can describe the collection process

Recent-inquiry months are missing for 13.1% of the sample and for all sampled loans from 2007 through 2011. Other bureau fields also have year-specific gaps. Replacing each missing value with a median would erase that absence pattern, so the numerical pipeline adds indicators. {{source:notebook|Missingness by field and year — cell 13}}

This is a useful modelling response, but an ambiguous risk signal. An indicator can identify a data-collection era rather than a borrower characteristic. If collection changes in a new cohort, the relationship may disappear. Missingness indicators preserve information; they do not prove that the information is stable. {{evidence:pipeline}}

## The incumbent already contains useful risk information

The saved grade bars rise from A through G. Higher observed FICO bands have lower charge-off shares, and midpoint FICO correlates with LC interest rate at −0.4. These patterns explain why a FICO-only reference and an LC-pricing benchmark are needed. A model must be compared with the information already used to price loans, not only with a weak reference. {{source:notebook|Grade, FICO and rate inspections — cells 12–13}} {{evidence:eda}}

The two FICO bounds correlate at 1.0 to four decimals, supporting their consolidation into a midpoint. Empty plotted bars in the lowest FICO intervals do not establish zero risk or validate the form's broader allowed score range. {{source:notebook|FICO consolidation and bands — cells 10–12}}

## Burden and term suggest hypotheses, not causal effects

Default shares rise across plotted DTI quintiles, and the 60-month term bar is higher than the 36-month bar. These observations support retaining burden and horizon information and investigating loan-to-income. They do not show that changing a borrower's term or DTI alone would cause the observed risk change. Borrower selection, other characteristics and time to resolve can differ. {{source:notebook|DTI and term figures — cell 12}}

The sample also retains 39 DTI values above 100 and 45 incomes below 5,000. Clipping DTI for a plot only makes the picture readable; it does not repair those model inputs. The API later excludes some of these values, creating a research-to-serving mismatch that needs its own evaluation. {{source:notebook|Extreme values — cell 13}} {{source:schema|Serving ranges|5-16}}

## Purpose changes the population being compared

Debt consolidation accounts for 62,291 loans in the saved purpose table. Small business has a 30.5% charge-off share, compared with 16.9% for credit card. Purpose is therefore a useful description of borrowing context. Those group shares are not proof of subgroup model quality: a model can rank well overall while making poor decisions within a smaller purpose group. {{source:notebook|Purpose counts and rates — cell 13}} {{evidence:eda}}

## The exploration also weakens the test boundary

These findings came from the full outcome-labelled frame before splitting. Training-fitted preprocessing avoids one form of leakage, but the analyst has already seen later-loan patterns when motivating features. The right correction is to freeze hypotheses using earlier data and evaluate on a genuinely new cohort. Repeating the same test after seeing its patterns would not restore that independence. {{source:notebook|EDA before the split — cells 12–18}} {{evidence:future}}
