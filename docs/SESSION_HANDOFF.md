# Session handoff — thesis, frontend and deployment

This page indexes the final work and its evidence. It summarizes implemented behavior and decisions rather than reproducing every intermediate chat message. Formal thesis wording and unreported VM results are not treated as verified facts.

## Where to study or operate the project

| Document | Coverage |
|---|---|
| [README](../README.md) | Project purpose, repository map, setup, dependency separation and main research findings |
| [Defense guide](DEFENSE_GUIDE.md) | Draft research framing, all form fields, request/response trace, data/training/evaluation, artifacts, metrics, opening, slides, demo and examiner questions |
| [Deployment guide](DEPLOYMENT.md) | Actual selected VM/domain setup, tar-only updates, HTTPS preservation, caching, verification, memory recovery, logs and rollback |
| [Deployment record](DEPLOYMENT_LOG.md) | Release identities, owner-reported outputs, public observations, failed update and checks awaiting confirmation |
| [Evidence directory](evidence/) | Runtime inspection, artifact hashes, reproduced metrics, saved notebook outputs and local compatibility/HTTP checks |

## Final frontend behavior

The existing EAB Credit UI retains the navy theme, logo, Loan Officer Portal header and compact desktop layout with bounded scrolling. Inputs have explanatory white, rounded, theme-bordered help content and KaTeX formulas. Range errors appear immediately in red. Monthly recurring debt supports a calculated, read-only DTI; that supporting debt total is not sent to the backend. Synthetic examples fill the form before assessment. Results show predicted PD separately from calculated pricing, payments and losses, and retain Credit Risk and Borrower Risk Indicators sections.

The mobile update changes the layout to one document scroll, full-width 48px controls, appropriate numeric keyboards and native dropdowns. Information icons have 44px touch targets and open closable panels on tap, while desktop keeps hover tooltips. Examples appear before the fields, the assessment action follows them, and mobile notifications appear inline rather than over the form. Results and formula help adapt to narrow screens.

Browser flow checks used synthetic API fixtures at **320×740, 360×800, 390×844, 430×932, 932×430, 768×1024 and 1440×900**. They covered layout overflow, native/desktop controls, touch help and dismissal, formulas, immediate validation, submit/error/result/reset behavior, and a reduced 380px viewport to approximate keyboard-driven shrinking. Lint, build and six DTI tests passed. The extracted release also passed exact model-response parity and invalid requests locally. **A real iOS/Android keyboard was not tested.**

## Thesis interpretation to keep consistent

The inspected research/application commit is **d8643c8e1f3aa3c34ba95279291706a7ac96d5eb**. Frozen XGBoost metrics were reproduced without retraining; logistic comparisons/bootstrap intervals remain saved notebook evidence. The full-feature test AUC is about **0.6828**. The reduced browser form defaults 40 raw features, so the notebook's full-feature metrics do not validate its predictive performance directly.

For XGBoost versus the application-only logistic baseline, the saved AUC difference is **0.0029**, with 95% interval **−0.0014 to 0.0073**. Say: “XGBoost achieved slightly higher AUC than the baseline, but the improvement was small and not statistically conclusive.” Do not claim superiority or confuse this comparison with the separate incumbent-pricing/combined-feature benchmarks.

Only default probability is directly predicted. Lending recommendations are policy rules, repayment/pricing/loss figures are calculations, and gross interest is not net profit. Research question/objectives in the guide are drafts pending the formal thesis; data timing/provenance assumptions and fairness limitations are explicitly marked.

## Release and server state last evidenced

| Item | Recorded state |
|---|---|
| Initial deployment source | 6527f59086ab6b7943ca8085982ec3ec0f84efea |
| Mobile implementation commit | 82bb25134554fed4fcb4a56f8db686edba9d10ea |
| Uploaded mobile release | eab-credit-88d83bc006e6.tar.gz; packages the mobile implementation and tar-only instructions |
| Candidate source commit | 88d83bc006e694a34b61f02f8e22cba33574e814 |
| Active path last supplied by owner | /opt/eab-credit/releases/6527f59086ab-8285d330 |
| Prepared candidate path | /opt/eab-credit/releases/88d83bc006e6-ce96cd7f |
| Update failure | Dependency installation/pip check passed; less than 350 MB available stopped model preflight before activation |
| Public URL | https://eab-credit.preview.james-benjamin.com |
| Public observation during investigation | HTTPS responded successfully, but HTML still referenced the initial frontend assets |
| Owner workflow | Upload only the tar; extract its installer in the GCP browser terminal; no server GitHub checkout |

The [recovery procedure](DEPLOYMENT.md#recover-an-update-stopped-by-the-memory-check) temporarily stops the old app, validates the already-prepared candidate, activates it, checks HTTPS and attempts restoration on failure. It preserves domain/certificate settings. The existing uploaded tar is sufficient for this recovery; later documentation commits do not require another upload merely to follow these instructions.

## Outstanding evidence

- Recovery completion and the new active release path have not been supplied.
- Hosted valid/invalid prediction checks and post-restart results for the new release need VM reports.
- Actual VM memory peak/headroom and disk usage after successful activation are not recorded.
- Certificate expiry/renewal and full VM reboot results are not supplied; successful HTTPS retrieval is narrower evidence.
- Actual phone keyboard behavior and live tap help need a device check after activation.
- Approved thesis objectives and authoritative dataset documentation still require confirmation.

Append owner results to the deployment record when available. Keep the thesis evidence at its inspected commit, separate from later operational and UI changes.
