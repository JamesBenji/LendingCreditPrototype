## Count the inputs

$$49-2+6+3=56$$

49 numerical candidates minus two FICO bounds leaves 47 original numeric fields. Six categorical fields remain. Three engineered fields bring the total to 56: 50 numeric and 6 categorical. {{source:notebook|Final feature list — cell 16}} {{source:metadata|Exported feature order}}

Missing indicators and one-hot categories expand those inputs. The saved preprocessor has 124 transformed columns. Different retraining categories or missingness can change that width. {{evidence:artifact}}

## Forbidden fields

The application-only list excludes loan_status, default, issue_d, earliest_cr_line, int_rate, grade, sub_grade, funded_amnt, total_rec_prncp and recoveries. The notebook assertion and site tests enforce this boundary. {{evidence:pipeline}}

## Full list and serving roles

All 56 fields appear below with definitions or explicit definition gaps, rationale, timing and preprocessing. Serving roles distinguish browser inputs, backend loan-to-income and training defaults. A correctly sized input vector does not prove the reduced form has full-feature performance. {{evidence:gap}}

## Representation does not create information

The 124-column matrix is a representation of 56 conceptual inputs. One category can become several indicators, and one missing measurement can add an absence flag. That expansion helps algorithms work with the data but does not add independent borrower knowledge. The serving problem is therefore about which measurements were collected, not whether preprocessing produced the expected matrix width. {{evidence:artifact}} {{evidence:gap}}
