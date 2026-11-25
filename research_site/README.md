# Credit risk research publication

This standalone static site presents 34 technical chapters, source-linked evidence, field and limitations registers, the experiment ledger, formulas and the request trace. It reads repository records as evidence. It does not train, load or serve the lending model.

Astro creates complete HTML pages. Markdown-it renders Markdown; KaTeX renders equations during the build. Project-specific SVG diagrams render without JavaScript. Pagefind indexes built HTML for local search. JavaScript adds search, filters and copy controls; text, tables and formulas remain readable without it.

## Local commands

Use Node 22.21.1, pinned by the [Pages workflow][workflow], or a supported version at least 22.12.0. Install from this project’s [lockfile][lockfile].

```sh
cd research_site
npm ci --no-audit --no-fund
npm run dev
npm test
npm run format
npm run lint
npm run build
npm run preview
```

Open the printed address below /LendingCreditPrototype/. Search is indexed during production build, so check it in preview rather than the development server.

```sh
npx playwright install chromium
npm run test:browser
```

Browser checks are optional local checks. GitHub Actions does not install or run Playwright.

The [browser checker][browser] starts and closes a static preview on port 4327. It visits all chapters at 360, 768 and 1440 pixels, scans all 42 pages with axe, and checks search, filters, keyboard navigation, print, no-JavaScript content and absence of API requests. Screenshots and JSON reports go into the ignored reports directory. Automated checks do not replace a human screen-reader or real-device review.

## Content and structured data

- [Chapter Markdown][content] holds authored explanations. [Chapter metadata][chapters] controls order, sources, diagrams and registers.
- [Structured data][data] contains fields, model inputs, experiments, comparisons, evidence, limitations, glossary, metrics, timeline and sources.
- [Source registry][sources] owns paths and commits. [SourceLink][source-component] uses the shared [link helper][source-helper] to encode file/directory URLs and optional commit/line anchors.
- [Renderer][renderer] expands source/evidence tokens, renders mathematics, anchors headings and links known repository filenames even in saved output.
- [Registers][registers] render data as accessible tables. Large data values stay outside UI components.
- [Extraction script][extractor] reads the notebook, metadata and every evidence JSON. It preserves zero-based cell indices, stable IDs, saved text and the saved EDA figure. It never needs the raw dataset, Python, Flask or a model loader.

## Evidence-update workflow

1. Add or update committed evidence without erasing old evidence identity.
2. Run <code>npm run extract</code>. Review [extracted records][extracted] and the saved-figure diff.
3. Update the [source registry][sources] with a valid path and commit. A report file may exist at a later commit than the research commit it discusses; link each to the correct revision.
4. Update [evidence records][evidence] and affected text. Give each claim an evidence class, source, locator and limitation.
5. Verify numbers against the strongest record. Saved notebook results remain NOTEBOOK OUTPUT unless a new reproduction report exists.
6. Run tests, lint, production build and browser checks. Stale extracted records fail the build.

Build metadata stamps the current commit in an ignored generated file. The footer separates the build commit from the frozen-model research commit. A dirty local preview is not a committed evidence revision; Pages builds a checked-out commit.

## Add a chapter or claim

Add a Markdown file to [content][content] and its record to [chapter metadata][chapters]. Use clear headings. Explain decision, reason, evidence, implementation, result and uncertainty. The validator expects the required 34 chapters; update the invariant deliberately if extending the publication.

Use <code>{{source:predictor|Feature preparation|83-94}}</code>, <code>{{source:notebook|Target — cell 10, NIRO3uBSbFyJ}}</code> and <code>{{evidence:frozen}}</code> tokens. IDs must exist in the [registry][sources]. Do not invent notebook line anchors. Every named repository item must render as a link; the production checker rejects unlinked known paths.

Add numeric comparison rows to the appropriate [data file][data] with an evidence ID. [Consistency checks][validator] require roles, source references and definitions or explicit definition limitations. [Built-output checks][built-checker] reject broken internal links, missing anchors, wrong base paths and numeric rows without evidence.

## Update the field audit

Use [field records][fields] for evidenced loaded and engineered fields. Separate source-supported working meaning from authoritative definitions and unresolved semantics. Name-based business hypotheses do not prove definitions. Record timing, roles, source, exclusion reason and preprocessing.

Counts must match the extracted notebook: 49 numeric + 6 categorical + 2 dates + 1 target + 3 benchmark + 3 loss = 64. Final inputs must match exported metadata: 49 − 2 FICO bounds + 6 categories + 3 engineered = 56. Outcome, benchmark and raw-date fields are forbidden in the application-only set. Transformed width is separately recorded as 124 for the inspected artifact. Run <code>npm test</code> for counts and <code>npm run build</code> for generated links.

The full 151-field audit is unresolved. Obtain the exact raw header, authoritative dictionary and field collection-time records. Do not invent missing names or definitions.

## GitHub Pages

Open repository **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. If environment protection is enabled, permit the github-pages environment to deploy from main.

Merge into main or run the dedicated [workflow][workflow] on main. Pull requests build and test without deployment. The workflow installs the lockfile with Node 22.21.1, runs tests and static checks, builds and uploads only this project’s static output. Official upload/deploy Pages actions publish it. Only the deploy job receives pages write and id-token write permissions.

Expected URL: <https://jamesbenji.github.io/LendingCreditPrototype/>.

[Astro configuration][config] sets the project base and directory-index routes. Scripts, styles, fonts, figures, search and links work below /LendingCreditPrototype/. Direct chapter URLs need no routing fallback or server rendering.

## Product separation and known gaps

This project has its own [manifest][package], [lockfile][lockfile], source, styles, tests and build output. It imports nothing from the [product frontend][frontend], calls no prediction API and needs no Flask or Python runtime. The unchanged [release packager][packager] uses explicit product inputs and excludes this site. The existing VM/domain deployment is separate.

Known gaps remain visible: the 151-field screening record, authoritative definitions and timing, resolved-loan censoring, holdout EDA, drift, inconclusive complexity gain, exact reduced-form validation, fairness, original training environment, annualised pricing, monitoring and owner-reported recovery. These are explained limitations, not unfinished chapter placeholders.

[workflow]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/.github/workflows/research-site-pages.yml
[lockfile]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/package-lock.json
[package]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/package.json
[config]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/astro.config.mjs
[content]: https://github.com/JamesBenji/LendingCreditPrototype/tree/feature/technical-research-site/research_site/src/content
[data]: https://github.com/JamesBenji/LendingCreditPrototype/tree/feature/technical-research-site/research_site/src/data
[chapters]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/chapters.json
[sources]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/sources.json
[source-component]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/components/SourceLink.astro
[source-helper]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/lib/sources.mjs
[renderer]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/lib/render.mjs
[registers]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/lib/registers.mjs
[extractor]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/scripts/extract.mjs
[extracted]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/extracted.json
[evidence]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/evidence.json
[fields]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/src/data/fields.json
[validator]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/scripts/validate.mjs
[built-checker]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/scripts/check-built.mjs
[browser]: https://github.com/JamesBenji/LendingCreditPrototype/blob/feature/technical-research-site/research_site/scripts/browser-check.mjs
[frontend]: https://github.com/JamesBenji/LendingCreditPrototype/tree/main/flask_app/frontend
[packager]: https://github.com/JamesBenji/LendingCreditPrototype/blob/main/scripts/package_release.py
