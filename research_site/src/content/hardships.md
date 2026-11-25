## A correction can expose a second problem

Several fixes improved one part of the project without validating the next part. The chronological split made drift visible but did not remove resolved-loan selection. Calibration improved probability levels on validation but overpredicted test defaults. Training defaults made the reduced form runnable but did not establish its predictive performance. These are distinct problems with distinct tests. {{evidence:sample}} {{evidence:frozen}} {{evidence:gap}}

## The reduced form is the most consequential engineering gap

Recomputing loan-to-income prevents a stale ratio from describing a different loan and income. That is a real implementation correction. It still leaves 40 uncollected fields at typical training values. Fixing the ratio therefore cannot justify transferring the full-feature score to the product. The masking diagnostic supports making exact-form evaluation a separate study. {{source:predictor|Current-input ratio|83-94}} {{evidence:gap}}

## Complexity increased the burden of proof

Search produced a working XGBoost pipeline, but its small AUC advantage over logistic regression was inconclusive. More parameters and dependencies also create more state to reproduce and maintain. The project needs a reason to accept that cost beyond the fact that a complex model was successfully fitted. {{evidence:comparisons}} {{evidence:artifact}}

## Functional tests and research tests answer different questions

A smoke test can show that a release returns the expected synthetic response. It cannot show that the response is calibrated for new applicants or that the price is financially sound. The VM memory gate made a similar distinction: dependency installation had succeeded, but model preflight and activation had not. Success at one stage must not be carried forward as proof of the next. {{source:deployment-log|Memory-gate failure}} {{evidence:vm}}

The [limitations register](/LendingCreditPrototype/limitations/) ties these gaps to affected claims and next steps. Closing a gap means evaluating the claim after the correction, not merely documenting that a patch or procedure exists. {{source:overview|Research limitations}} {{evidence:future}}
