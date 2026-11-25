## Trace the conclusion, not just the filename

Start with the claim you want to check. A ranking claim needs predictions and outcomes from the same evaluation loans. A probability claim also needs calibration evidence. A price claim adds measured severity and cost assumptions. A serving claim needs the exact collected-input workflow. Finding code that returns a number is not enough to support all four. {{source:notebook|Evaluation and pricing — cells 20–35}} {{evidence:frozen}}

## Use the detailed tables where they answer your question

- [Field catalogue](/LendingCreditPrototype/fields/): which values were loaded, used, excluded or derived, and which definitions remain unconfirmed.
- [All model inputs](/LendingCreditPrototype/chapters/model-inputs/): the 56 conceptual inputs and why they differ from encoded columns.
- [Metric definitions](/LendingCreditPrototype/chapters/metrics/) and [paired comparisons](/LendingCreditPrototype/chapters/comparisons/): what was measured and which differences were demonstrated.
- [Search space](/LendingCreditPrototype/chapters/hyperparameters/): what the tuning result was allowed to choose.
- [Loss and price](/LendingCreditPrototype/chapters/loss-price/) and [back-test](/LendingCreditPrototype/chapters/pricing-backtest/): measured loss, assumptions and the mismatch with realised outcomes.
- [Artifacts and reproduction](/LendingCreditPrototype/chapters/reproducibility/) and [request trace](/LendingCreditPrototype/chapters/engineering-trace/): which state was saved and what serving does with it.

## Keep evidence strength separate from presentation

Notebook links show saved output. RESULTS links show recorded frozen-model or local evaluations; this publication did not rerun the notebook. CODE links show implementation. PRICING INPUTS links explain the cost assumptions. None of these substitutes for the missing study described by an OPEN QUESTION or NEXT STEPS link. {{source:notebook|Research notebook}} {{source:reproduced-metrics|Frozen-model evaluation}}

The [evidence table](/LendingCreditPrototype/evidence/) connects claims to records and limits. The [source map](/LendingCreditPrototype/sources/) identifies the inspected file revision. A report can discuss an older model commit while existing at a later documentation commit; those identities answer different reproducibility questions. {{evidence:artifact}}

## Decide what would make you stop trusting the result

Use the [limitations](/LendingCreditPrototype/limitations/) to check population changes, unavailable inputs, drift, unsupported policy and pricing assumptions. Use the [decision ledger](/LendingCreditPrototype/timeline/) to see how those problems changed the work, and the [glossary](/LendingCreditPrototype/glossary/) for unfamiliar terms. A conclusion remains conditional until the relevant next experiment has new evidence. {{evidence:future}}
