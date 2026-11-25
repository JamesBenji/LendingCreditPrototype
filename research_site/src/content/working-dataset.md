## Exact groups

There are 49 numerical candidates, 6 categorical candidates, 2 dates, 1 target source, 3 LendingClub assessment fields and 3 loss fields: 64 total. They are not all predictors. The full names, definitions or explicit definition gaps, roles and significance are below. {{source:notebook|Candidate groups — cell 6, BjzgT6WxbFyI}}

Numeric candidates cover exposure, income, burden and bureau history. Two FICO bounds are consolidated. Categories describe term, employment, housing, verification, purpose and application type. Dates support ordering and elapsed history. {{evidence:pipeline}}

## Target, benchmark and loss roles

loan_status constructs the target. int_rate, grade and sub_grade represent LC assessment. The fitted benchmark uses only sub_grade plus int_rate; grade is used for EDA and pricing interpretation. funded_amnt, total_rec_prncp and recoveries measure principal loss. {{source:notebook|Policy — cell 4; baseline — cell 22; price — cell 34}}

Funded principal is fixed at origination. Its grouping with outcome fields describes its LGD role, not a claim that it first appears after lending. Repayment and recoveries arrive later. {{evidence:timing}}

## Definition discipline

Where source semantics are absent, the row reports the inspected numeric role and an unresolved definition. Name-based business hypotheses do not establish units, timing, account scope or causality. {{source:notebook|Loaded fields — cell 6}}
