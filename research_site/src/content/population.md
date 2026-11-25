## Data source and width

The notebook downloads Kaggle wordsforthewise/lending-club. Saved output identifies version 3 and the accepted-loan CSV. It counts 151 raw columns, then selects 64. It never prints the full header. {{source:notebook|Data loading — cells 5–6}} {{evidence:screening}}

The raw CSV is not needed to build this site. Its recorded SHA-256 is in {{source:reproduced-metrics|Frozen report — source_csv_sha256}}. A matching hash supports file identity, not source correctness or timing.

## Sampling implementation

Each chunk has 200,000 raw rows. The code keeps Fully Paid and Charged Off, samples 8% with seed 42 plus chunk index, concatenates samples, then caps at 150,000 with seed 42. Environment variables can change these settings; the recorded default run is the evidence target. {{source:notebook|Sampling — cell 8, Nptx2sTqbFyJ}}

The sample has 107,625 loans: 86,104 fully paid and 21,521 charged off, about 20.00% prevalence. Sampling is not class balancing. Rejected applicants are absent. {{evidence:sample}} {{source:notebook|Saved status counts — cell 8}}

## Selection and censoring

Active loans are excluded, not labelled good. Recent bad loans may resolve early while good loans remain active. New resolved cohorts may therefore overrepresent adverse outcomes, affecting prevalence and calibration. The size and direction depend on maturity and snapshot timing. {{source:notebook|Sampling caveat — cell 7}}

There is no common follow-up horizon. Accepted-loan selection prevents claims about rejected borrowers. Repeated borrower overlap is unaudited. A next study needs maturity rules, a fixed outcome window and entity-aware temporal evaluation. {{evidence:future}}

## Cohorts

The ordered split uses the oldest 70% for training, next 15% for validation and newest 15% for test. Shared boundary months reflect row-index slicing, not disjoint month groups. Exact cohort sizes and rates are below. {{evidence:sample}}
