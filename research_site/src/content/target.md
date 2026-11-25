## Binary construction

After filtering to final statuses, the notebook sets Charged Off = 1 and Fully Paid = 0 using a Boolean comparison cast to integer. Active, late and unresolved statuses are excluded rather than forced into a class. {{source:notebook|Target — cell 10, NIRO3uBSbFyJ; filter — cell 8}} {{evidence:pipeline}}

## What the label means

Charge-off is an accounting outcome, not a universal legal definition of default. Exact status policy and event timing need source confirmation. Resolution at one snapshot is not a fixed follow-up horizon. Recent good loans can be missing because they still pay. {{evidence:timing}}

The full sample contains 21,521 charge-offs among 107,625 loans, about 20.00%. Test prevalence is 21.49%. Do not substitute one population’s rate for another. {{evidence:sample}} {{source:notebook|Saved target counts — cell 8}}

## Failure conditions

A new applicant population, changed selection rule, changed status policy or shorter outcome window can change what PD means. A mature fixed-window cohort would support a clearer probability target. Until then, results refer to the recorded resolved accepted-loan design. {{evidence:future}}

## The filter changes the estimated probability

The experiment estimates charge-off among accepted loans whose outcomes were resolved at the snapshot. That conditioning matters. A recent borrower still making payments is not a proven non-default; excluding that borrower also changes the population represented by the labels. A fixed-window study would make the horizon common and let incomplete follow-up be handled explicitly. Until then, the target supports a selected historical charge-off probability, not a universal applicant default probability. {{source:notebook|Resolved-outcome filter — cells 7–10}} {{evidence:sample}}
