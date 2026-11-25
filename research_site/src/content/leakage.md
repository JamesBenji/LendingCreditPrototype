## Decision: separate information sets

The application model excludes target, payments, recoveries and LC pricing. The notebook asserts that named forbidden fields are absent. This tests independent borrower information rather than copying the incumbent’s assessment. {{source:notebook|Leakage assertion — cell 16}} {{evidence:pipeline}}

## Four timing groups

Application fields are intended pre-decision snapshots, but timing still needs authoritative confirmation. Grade, sub-grade and rate encode LC’s own underwriting and are benchmarked separately. Target and later loss fields describe outcomes. {{source:notebook|Leakage groups — cell 4}}

loan_status reveals the answer. Payments, recoveries and later credit scores occur after pricing. issue_d orders cohorts and anchors history length, then stays outside the raw borrower input list. LC fields can improve prediction but answer a different question: how much information is already in incumbent pricing? {{source:notebook|Combined comparisons — cell 26}}

## Limits of the guard

The assertion catches listed direct leakage. It cannot prove every bureau snapshot is from application time. It also cannot prevent analyst exposure to test outcomes in full-sample EDA. A confirmed post-application field would invalidate the clean application-only interpretation and require reevaluation. {{source:notebook|EDA, feature engineering and split — cells 12–18}} {{evidence:timing}}
