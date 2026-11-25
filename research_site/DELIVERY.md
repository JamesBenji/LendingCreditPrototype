# Research publication delivery

Implemented on feature/technical-research-site. The independent [research_site/](https://github.com/JamesBenji/LendingCreditPrototype/tree/feature/technical-research-site/research_site) has 34 authored chapters and 42 complete static pages. It uses Astro, Markdown-it, build-time KaTeX, project-specific SVG diagrams and Pagefind. This gives direct static chapter URLs, no runtime model server, readable no-JavaScript content and local full-text search.

## What changed

76 added or modified files are listed below. Changes consist of the new publication, its dedicated Pages workflow and a small appended root documentation section. Existing product, model, infrastructure and release files are unchanged.

## Validation

- Installed dependencies with npm ci from the standalone lockfile. Formatting and lint/static consistency checks passed.
- Eight Node tests passed: group/input counts, extracted notebook/metadata consistency, forbidden fields, repository source paths, URL/line syntax, rendered mathematics, numeric table evidence and copyable source-linked code.
- Production build generated 42 HTML pages and a local Pagefind index. Built-output checks verified 2,777 internal links/assets, source-link types, heading anchors, numeric evidence and the Pages prefix.
- Static preview: 34 direct chapter URLs at 360, 768 and 1440 pixels, 102 viewport checks with no page overflow.
- Axe scanned all 42 pages for WCAG 2 A/AA and 2.1 AA rules with zero violations. Search, field/evidence/limitations/ledger filters, keyboard skip navigation, print styles and no-JavaScript reading passed.
- Browser network checks recorded zero prediction API calls. Mobile and desktop screenshots were inspected. Browser-generated JSON reports and screenshots are in the ignored local reports directory; the checker can regenerate them.
- Human screen-reader review and real-device reading tests were not performed. Automated checks are narrower than a complete accessibility audit.
- Confirmed an empty diff for the existing Flask application, frontend, model artifacts, infrastructure and runtime/release scripts. The explicit VM release input list still excludes the publication. No notebook training or new frozen-model evaluation was performed.

## Pages deployment

[Dedicated workflow](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/.github/workflows/research-site-pages.yml) installs Node 22.21.1, uses the lockfile, runs tests/static checks/build, uploads only the research static output and deploys with official GitHub Pages actions. Only the deploy job receives pages write and id-token write permissions. Pull requests do not deploy. Browser checks remain available locally and are not part of GitHub Actions.

Expected URL: <https://jamesbenji.github.io/LendingCreditPrototype/>. Every route and asset uses /LendingCreditPrototype/.

Owner setting: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Allow main in the github-pages environment if environment protection is configured. Merge the implementation branch into main, then let the dedicated workflow deploy, or dispatch it on main. The live product domain is unaffected. This delivery does not merge main or activate Pages.

## Evidence sources used

All required repository sources were inspected. Every JSON file in the evidence directory was read, classified and included in deterministic extraction. The source registry pins existing evidence paths to inspected commits and distinguishes each report file revision from the research commit stated inside it.

- [README.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/README.md) — Inspected repository source
- [Lending_project_v2 (1).ipynb](https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/Lending_project_v2%20%281%29.ipynb) — Historical research notebook
- [docs/SESSION_HANDOFF.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/SESSION_HANDOFF.md) — Inspected repository source
- [docs/DEPLOYMENT.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/DEPLOYMENT.md) — Inspected repository source
- [docs/DEPLOYMENT_LOG.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/DEPLOYMENT_LOG.md) — Inspected repository source
- [flask_app/application_schema.py](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/application_schema.py) — Inspected repository source
- [flask_app/predictor.py](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/predictor.py) — Inspected repository source
- [flask_app/repayment.py](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/repayment.py) — Inspected repository source
- [flask_app/app.py](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/app.py) — Inspected repository source
- [flask_app/frontend/](https://github.com/JamesBenji/LendingCreditPrototype/tree/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/frontend) — Inspected repository source
- [flask_app/frontend/src/components/LoanForm.jsx](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/frontend/src/components/LoanForm.jsx) — Inspected repository source
- [flask_app/frontend/src/components/ResultView.jsx](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/frontend/src/components/ResultView.jsx) — Inspected repository source
- [flask_app/frontend/src/App.jsx](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/frontend/src/App.jsx) — Inspected repository source
- [flask_app/frontend/src/lib/debt-to-income.js](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/frontend/src/lib/debt-to-income.js) — Inspected repository source
- [scripts/inspect_runtime.py](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/scripts/inspect_runtime.py) — Inspected repository source
- [scripts/reproduce_saved_model.py](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/scripts/reproduce_saved_model.py) — Inspected repository source
- [scripts/package_release.py](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/scripts/package_release.py) — Inspected repository source
- [deploy/smoke-fixtures.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/deploy/smoke-fixtures.json) — Inspected repository source
- [lending_artifacts/metadata.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/lending_artifacts/metadata.json) — Inspected repository source
- [lending_artifacts/](https://github.com/JamesBenji/LendingCreditPrototype/tree/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/lending_artifacts) — Inspected repository source
- [lending_artifacts/xgb_risk_model.joblib](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/lending_artifacts/xgb_risk_model.joblib) — Inspected repository source
- [lending_artifacts/platt_calibrator.joblib](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/lending_artifacts/platt_calibrator.joblib) — Inspected repository source
- [deploy/nginx.conf](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/deploy/nginx.conf) — Inspected repository source
- [deploy/eab-credit.service](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/deploy/eab-credit.service) — Inspected repository source
- [deploy/install-vm.sh](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/deploy/install-vm.sh) — Inspected repository source
- [deploy/requirements.txt](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/deploy/requirements.txt) — Inspected repository source
- [requirements.txt](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/requirements.txt) — Inspected repository source
- [flask_app/tests/](https://github.com/JamesBenji/LendingCreditPrototype/tree/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/tests) — Inspected repository source
- [flask_app/frontend/src/lib/debt-to-income.test.js](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/frontend/src/lib/debt-to-income.test.js) — Inspected repository source
- [docs/evidence/](https://github.com/JamesBenji/LendingCreditPrototype/tree/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/evidence) — Inspected repository source
- [flask_app/wsgi.py](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/flask_app/wsgi.py) — Inspected repository source
- [docs/evidence/extracted-bundle-check.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/evidence/extracted-bundle-check.json) — Inspected repository source
- [docs/evidence/linux-wheel-availability.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/evidence/linux-wheel-availability.json) — Inspected repository source
- [docs/evidence/local-wsgi-http-first-start.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/evidence/local-wsgi-http-first-start.json) — Inspected repository source
- [docs/evidence/local-wsgi-http.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/evidence/local-wsgi-http.json) — Inspected repository source
- [docs/evidence/notebook-outputs.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/evidence/notebook-outputs.json) — Inspected repository source
- [docs/evidence/python313-compatibility.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/evidence/python313-compatibility.json) — Inspected repository source
- [docs/evidence/reproduced-metrics.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/evidence/reproduced-metrics.json) — Inspected repository source
- [docs/evidence/runtime-inspection.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/3d0101e9e36f3e92d4fbc4ae6fd465e8fad3d868/docs/evidence/runtime-inspection.json) — Inspected repository source
- [research_site/](https://github.com/JamesBenji/LendingCreditPrototype/tree/a98367f4b6f238525af2a61213fbacb55d456e88/research_site) — Standalone static publication; absent from VM release
- [research_site/README.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/a98367f4b6f238525af2a61213fbacb55d456e88/research_site/README.md) — Local build and evidence-update instructions
- [.github/workflows/research-site-pages.yml](https://github.com/JamesBenji/LendingCreditPrototype/blob/a98367f4b6f238525af2a61213fbacb55d456e88/.github/workflows/research-site-pages.yml) — Independent official GitHub Pages build/deploy workflow
- [research_site/tests/consistency.test.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/a98367f4b6f238525af2a61213fbacb55d456e88/research_site/tests/consistency.test.mjs) — Content, feature counts, provenance and source-link tests
- [research_site/scripts/extract.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/a98367f4b6f238525af2a61213fbacb55d456e88/research_site/scripts/extract.mjs) — Deterministic extraction without Python or private raw data
- [research_site/scripts/browser-check.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/a98367f4b6f238525af2a61213fbacb55d456e88/research_site/scripts/browser-check.mjs) — Static preview, responsive, axe and interaction checks
- [research_site/src/content/](https://github.com/JamesBenji/LendingCreditPrototype/tree/a98367f4b6f238525af2a61213fbacb55d456e88/research_site/src/content) — All 34 authored chapters
- [research_site/src/data/](https://github.com/JamesBenji/LendingCreditPrototype/tree/a98367f4b6f238525af2a61213fbacb55d456e88/research_site/src/data) — Structured evidence, field and experiment records

## Chapters

1. [Research question and lending decision](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/lending-decision.md)
2. [Project chronology and experiment ledger](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/chronology.md)
3. [Data source, population and sampling](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/population.md)
4. [Complete field-disposition audit](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/field-audit.md)
5. [The 64-column working dataset](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/working-dataset.md)
6. [Leakage policy and prediction-time availability](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/leakage.md)
7. [Target construction](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/target.md)
8. [Cleaning before modelling](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/cleaning.md)
9. [EDA as methodological evidence](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/eda.md)
10. [Feature engineering](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/engineering.md)
11. [The final 56 conceptual model inputs](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/model-inputs.md)
12. [Feature-selection honesty](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/selection.md)
13. [Temporal experimental design](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/temporal-design.md)
14. [Preprocessing and transformed feature space](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/preprocessing.md)
15. [Baselines and model hierarchy](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/baselines.md)
16. [Why logistic regression](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/logistic.md)
17. [Why XGBoost](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/xgboost.md)
18. [Hyperparameter selection](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/hyperparameters.md)
19. [Evaluation metrics from first principles](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/metrics.md)
20. [Controlled comparisons and uncertainty](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/comparisons.md)
21. [Calibration](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/calibration.md)
22. [Operating point and threshold policy](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/thresholds.md)
23. [Feature importance and error analysis](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/importance-errors.md)
24. [From PD to LGD to price](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/loss-price.md)
25. [Pricing back-test](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/pricing-backtest.md)
26. [Training versus serving reality](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/training-serving.md)
27. [Request-to-response engineering trace](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/engineering-trace.md)
28. [Reproducibility and artifacts](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/reproducibility.md)
29. [Deployment and operational history](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/operations.md)
30. [Hardships, corrections and methodological debt](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/hardships.md)
31. [Fairness, governance and responsible use](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/governance.md)
32. [Limitations and failure conditions](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/limitations.md)
33. [Open questions and next experiments](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/next-experiments.md)
34. [Appendices and source map](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/appendices.md)

## Known gaps and unresolved content

All 64 loaded fields and three engineered fields are audited. 36 loaded field names have no source definition in the repository; those rows explicitly state the gap rather than inventing a definition. The complete 151-field audit needs the exact raw header, authoritative dictionary and collection-time records. Even source-supported working meanings do not independently prove authoritative timing.

Other unresolved issues: resolved-loan selection/censoring, accepted-only sampling, full-sample EDA before splitting, temporal/entity separation, drift and calibration transfer, inconclusive complexity gain, confounded incremental comparisons, exact reduced-form validation and 40 defaults, source DTI/eligibility differences, unused application type, unenforced monotonicity rule, absent fairness/governance study, simplified lifetime-loss pricing, fixed LGD, missing monitoring, original environment locking, saved-only baseline/interval evidence and owner-reported VM recovery/renewal/resources.

These are substantive chapter findings with evidence, impact and proposed next work. They are not placeholder chapters. The limitations register has 22 entries; the evidence registry has 25 records.

## Complete file summary

- [.github/workflows/research-site-pages.yml](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/.github/workflows/research-site-pages.yml) — Dedicated research-only build, checks and official Pages deployment.
- [README.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/README.md) — Small appended link section; existing overview preserved.
- [research_site/.gitignore](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/.gitignore) — Standalone package, lockfile, Astro/format configuration or generated-output ignore boundary.
- [research_site/.prettierignore](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/.prettierignore) — Standalone package, lockfile, Astro/format configuration or generated-output ignore boundary.
- [research_site/.prettierrc.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/.prettierrc.json) — Standalone package, lockfile, Astro/format configuration or generated-output ignore boundary.
- [research_site/DELIVERY.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/DELIVERY.md) — Full file/chapter/evidence and validation delivery record.
- [research_site/README.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/README.md) — Local setup, content/evidence maintenance and exact Pages configuration.
- [research_site/astro.config.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/astro.config.mjs) — Standalone package, lockfile, Astro/format configuration or generated-output ignore boundary.
- [research_site/package-lock.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/package-lock.json) — Standalone package, lockfile, Astro/format configuration or generated-output ignore boundary.
- [research_site/package.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/package.json) — Standalone package, lockfile, Astro/format configuration or generated-output ignore boundary.
- [research_site/public/figures/eda-cell-12.png](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/public/figures/eda-cell-12.png) — Deterministically extracted original saved notebook EDA figure.
- [research_site/scripts/browser-check.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/scripts/browser-check.mjs) — Extraction, validation, built-link or browser/accessibility quality gate.
- [research_site/scripts/check-built.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/scripts/check-built.mjs) — Extraction, validation, built-link or browser/accessibility quality gate.
- [research_site/scripts/extract.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/scripts/extract.mjs) — Extraction, validation, built-link or browser/accessibility quality gate.
- [research_site/scripts/validate.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/scripts/validate.mjs) — Extraction, validation, built-link or browser/accessibility quality gate.
- [research_site/src/components/AuditTable.astro](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/components/AuditTable.astro) — Reusable source-link, audit table or sharp reasoning/CV diagram.
- [research_site/src/components/Diagram.astro](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/components/Diagram.astro) — Reusable source-link, audit table or sharp reasoning/CV diagram.
- [research_site/src/components/SourceLink.astro](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/components/SourceLink.astro) — Reusable source-link, audit table or sharp reasoning/CV diagram.
- [research_site/src/components/TemporalCV.astro](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/components/TemporalCV.astro) — Reusable source-link, audit table or sharp reasoning/CV diagram.
- [research_site/src/content/appendices.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/appendices.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/baselines.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/baselines.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/calibration.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/calibration.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/chronology.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/chronology.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/cleaning.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/cleaning.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/comparisons.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/comparisons.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/eda.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/eda.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/engineering-trace.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/engineering-trace.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/engineering.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/engineering.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/field-audit.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/field-audit.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/governance.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/governance.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/hardships.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/hardships.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/hyperparameters.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/hyperparameters.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/importance-errors.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/importance-errors.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/leakage.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/leakage.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/lending-decision.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/lending-decision.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/limitations.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/limitations.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/logistic.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/logistic.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/loss-price.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/loss-price.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/metrics.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/metrics.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/model-inputs.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/model-inputs.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/next-experiments.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/next-experiments.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/operations.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/operations.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/population.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/population.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/preprocessing.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/preprocessing.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/pricing-backtest.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/pricing-backtest.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/reproducibility.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/reproducibility.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/selection.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/selection.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/target.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/target.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/temporal-design.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/temporal-design.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/thresholds.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/thresholds.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/training-serving.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/training-serving.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/working-dataset.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/working-dataset.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/content/xgboost.md](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/content/xgboost.md) — Authored technical chapter with inline source/evidence links.
- [research_site/src/data/chapters.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/chapters.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/comparisons.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/comparisons.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/diagrams.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/diagrams.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/evidence.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/evidence.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/experiments.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/experiments.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/extracted.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/extracted.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/fields.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/fields.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/glossary.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/glossary.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/limitations.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/limitations.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/metrics.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/metrics.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/model-features.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/model-features.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/sources.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/sources.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/data/timeline.json](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/timeline.json) — Structured source, claim, field, experiment or extracted notebook/evidence data.
- [research_site/src/layouts/Publication.astro](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/layouts/Publication.astro) — Publication shell, navigation, breadcrumbs, local TOC, previous/next and copy controls.
- [research_site/src/lib/registers.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/lib/registers.mjs) — Central source URLs, Markdown/equation rendering or structured table views.
- [research_site/src/lib/render.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/lib/render.mjs) — Central source URLs, Markdown/equation rendering or structured table views.
- [research_site/src/lib/sources.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/lib/sources.mjs) — Central source URLs, Markdown/equation rendering or structured table views.
- [research_site/src/pages/[register].astro](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/pages/%5Bregister%5D.astro) — Static chapter/register routes, home index or Pagefind search UI.
- [research_site/src/pages/chapters/[slug].astro](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/pages/chapters/%5Bslug%5D.astro) — Static chapter/register routes, home index or Pagefind search UI.
- [research_site/src/pages/index.astro](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/pages/index.astro) — Static chapter/register routes, home index or Pagefind search UI.
- [research_site/src/pages/search.astro](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/pages/search.astro) — Static chapter/register routes, home index or Pagefind search UI.
- [research_site/src/styles/publication.css](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/styles/publication.css) — Research typography, contrast, responsive reading, reduced-motion and print styles.
- [research_site/tests/consistency.test.mjs](https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/tests/consistency.test.mjs) — Automated content, counts, provenance, rendering and link checks.
