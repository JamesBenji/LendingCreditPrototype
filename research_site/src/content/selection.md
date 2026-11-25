## The final list follows an explicit rule

The notebook declares candidates, keeps names present in the source, removes the two FICO bounds, adds three engineered inputs and checks the forbidden fields. This explains the 64-to-56 transition. It does not explain every choice made when narrowing 151 original fields to 64. {{source:notebook|Field and feature lists — cells 6 and 16}} {{evidence:screening}}

## A defensible reason must precede the score

Prediction-time availability, credit relevance and avoidance of outcomes are sensible screening criteria. A favourable correlation is not enough. A later payment field could look useful precisely because it reveals the eventual answer; a redundant field could add matrix width without adding information. The reasoning must establish eligibility before assessing predictive value. {{source:notebook|Leakage groups — cell 4}} {{evidence:timing}}

## What would make the selection repeatable

Record the original header, field definition, collection time and reason for retaining or excluding each field. Then freeze the list before holdout evaluation. That would let another reader distinguish a business judgement from a result selected after inspecting outcomes. The present manual list leaves that distinction partly unresolved. {{evidence:future}}

The [field catalogue](/LendingCreditPrototype/fields/) records what can currently be inspected. Completing the missing screening record requires source documentation, not a longer justification written after the experiment. {{evidence:screening}}
