## A field must answer the decision-time question

Before admitting a field, ask whether the lender could know its value before setting the price. A payment total may predict charge-off strongly, but it answers a question using events that happened after lending. A higher score obtained that way would not help an actual applicant decision. {{source:notebook|Leakage policy — cell 4}} {{evidence:pipeline}}

The catalogue therefore separates borrower information, LendingClub's own assessment, the target and loss measurement. These are different sources of knowledge. Mixing them would make it unclear whether the model learned borrower risk, copied the incumbent or read the outcome. {{source:notebook|Loaded field groups — cell 6}}

## Why loaded columns are not all predictors

The working file needs loan_status to build the answer, dates to order the experiment, and principal/recovery fields to measure loss. Those columns belong in the research data without belonging in the application PD model. LendingClub grade and rate are kept for separate benchmarks so the independent-information question can still be tested. {{evidence:pipeline}}

The documented transition is 64 loaded fields to 56 conceptual model inputs. Imputation indicators and category encoding then expand the fitted representation to 124 columns. The extra columns describe the same collected information; they do not create new borrower measurements. {{evidence:artifact}}

## What prevents a complete 151-field audit

The notebook reports 151 raw columns but records only the selected working list. The full header, authoritative definitions and per-field exclusions are missing. This matters because a retained bureau field could be a later update, or an excluded field could contain useful eligible information. The gap limits both the leakage claim and the completeness of feature selection. {{source:notebook|Raw width and manual selection — cells 5–6}} {{evidence:screening}}

The exact dataset header and version-matched dictionary are needed to finish that assessment. Until then, the table distinguishes inspected code roles from unconfirmed meanings and timing. A field name alone cannot resolve either question. {{evidence:timing}}
