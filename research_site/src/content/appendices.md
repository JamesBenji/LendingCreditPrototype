## One-click source tracing

Every repository citation uses the central source registry. File links use blob; directory links use tree. Links are pinned to inspected commits. Evidence reports may discuss an older research commit while the report file itself was committed later. The source link and the report’s inspected-commit field serve different purposes. {{source:overview|Repository overview}} {{source:evidence-dir|Evidence directory}}

Notebook citations use zero-based cell index and saved cell ID. GitHub notebook line anchors are unreliable, so they are not invented. The extraction preserves source text and textual output separately. It labels saved output rather than treating it as execution. {{source:notebook|Research notebook}} {{source:notebook-outputs|Saved output extraction}}

## Appendix index

The field catalogue and model-input register include every evidenced loaded field and all final conceptual inputs. The metric chapter defines formulas. Search-space and selected-value tables are in the XGBoost and search chapters. Comparison tables show all five paired questions. The glossary defines terms; the evidence, limitations and ledger pages can be filtered. Each source cell and numeric result has a provenance action.

## Claim-to-evidence matrix

The evidence register below is also a claim matrix: each record states the supported claim, evidence class, locator and limitation. The source map lists all files and directories read. Recorded artifact hashes and data hashes are shown in reproducibility. Nothing in the publication requires model serving or a private raw dataset. {{evidence:frozen}} {{evidence:artifact}}

## Reading evidence classes

REPRODUCED means an existing recorded frozen-model or local audit result. It does not mean this site reran the audit. NOTEBOOK OUTPUT means saved output. CODE-VERIFIED means directly inspected implementation. OWNER-REPORTED means recorded owner deployment information. ASSUMPTION, LIMITATION, PROPOSED and UNRESOLVED preserve uncertainty rather than promoting it to a result.

## Open the full appendices

- [Complete evidenced field catalogue](/LendingCreditPrototype/fields/) and [all 56 conceptual inputs](/LendingCreditPrototype/chapters/model-inputs/).
- [Formulas and metric definitions](/LendingCreditPrototype/chapters/metrics/) and [PD, LGD and price derivation](/LendingCreditPrototype/chapters/loss-price/).
- [Search space and selected parameters](/LendingCreditPrototype/chapters/hyperparameters/).
- [Seven-model experiment table](/LendingCreditPrototype/chapters/baselines/) and [five paired comparisons](/LendingCreditPrototype/chapters/comparisons/).
- [Experiment ledger](/LendingCreditPrototype/timeline/), [evidence registry and claim matrix](/LendingCreditPrototype/evidence/), [limitations register](/LendingCreditPrototype/limitations/), [glossary](/LendingCreditPrototype/glossary/) and [repository source map](/LendingCreditPrototype/sources/).
- [Artifact hashes, versions and reproduction boundaries](/LendingCreditPrototype/chapters/reproducibility/) and [component request trace](/LendingCreditPrototype/chapters/engineering-trace/).
