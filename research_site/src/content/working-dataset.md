## Exact groups

There are 49 numerical candidates, 6 categorical candidates, 2 dates, 1 target source, 3 LendingClub assessment fields and 3 loss fields: 64 total. They are not all predictors. The groups below show why each kind of information is loaded. The [field catalogue](/LendingCreditPrototype/fields/) supplies the per-field meanings, roles and definition gaps. {{source:notebook|Candidate groups — cell 6, BjzgT6WxbFyI}}

Numeric candidates cover exposure, income, burden and bureau history. Two FICO bounds are consolidated. Categories describe term, employment, housing, verification, purpose and application type. Dates support ordering and elapsed history. {{evidence:pipeline}}

## Target, benchmark and loss roles

loan_status constructs the target. int_rate, grade and sub_grade represent LC assessment. The fitted benchmark uses only sub_grade plus int_rate; grade is used for EDA and pricing interpretation. funded_amnt, total_rec_prncp and recoveries measure principal loss. {{source:notebook|Policy — cell 4; baseline — cell 22; price — cell 34}}

Funded principal is fixed at origination. Its grouping with outcome fields describes its LGD role, not a claim that it first appears after lending. Repayment and recoveries arrive later. {{evidence:timing}}

## Meaning and units are part of the model

A numeric value is only useful if its unit and scope match training. DTI is represented as a percentage; the form calculates it from monthly debt and annual income. A different debt definition could produce a different value for the same borrower even when both implementations divide correctly. That is why field meanings and collection timing belong in model validation, not just in a glossary. Unconfirmed bureau definitions remain explicit below. {{source:notebook|Loaded fields — cell 6}} {{source:dti|Serving DTI calculation}}
