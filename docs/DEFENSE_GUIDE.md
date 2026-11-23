# Thesis defense guide: EAB Credit

## Evidence boundary

**Inspected commit: d8643c8e1f3aa3c34ba95279291706a7ac96d5eb**, JamesBenji/LendingCreditPrototype. The existing checkout was used. Later deployment additions are operational changes, not a new estimator fit. Artifact hashes and full synthetic traces are in [runtime-inspection.json](evidence/runtime-inspection.json).

Use four kinds of claim when explaining the project:

| Kind | What it means | Example |
|---|---|---|
| Implemented | Directly visible in inspected code | Model pipeline, calibration and 15%/30% policy |
| Reproduced | Run during this audit | Frozen XGBoost metrics, feature mapping, synthetic API responses and tests |
| Saved output | Existing notebook result, not newly reproduced | Logistic comparisons, bootstrap intervals and permutation importance |
| Inference / needs confirmation | Reasoning or information outside the code’s proof | Approved thesis objectives and source-field availability at application time |

Notebook references use **zero-based cell index**, anchored to the inspected commit; important cells also have stable IDs below. [Notebook source][NB] and [saved output extraction](evidence/notebook-outputs.json) are the original evidence. No complete notebook retraining or new fitting of baseline models was performed. The cached version-3 dataset was available, allowing frozen-artifact evaluation to be reproduced.

## 1. Business use case and research framing

**Say aloud:** “A loan officer needs to understand credit risk before committing money. This prototype estimates charge-off probability and illustrates a decision, price, expected loss and repayment schedule. It supports explanation and comparison of synthetic applications; it does not establish a production underwriting policy.”

The app is a loan-officer portal. Its main model uses application/bureau features, excluding LendingClub’s own grade and rate. The notebook deliberately evaluates separate benchmark and combined models that do include incumbent pricing. Those combined models are not deployed. [A][P][R]

### Draft question and objectives — confirm with your thesis

No approved thesis proposal or formal objectives document is present. Notebook cell 0, ID zfMRzO_DbFyE, already asks five research questions. A consolidated **draft** question fitting those questions is:

> To what extent can LendingClub application-time information support temporally evaluated charge-off prediction and illustrative loan pricing, and does it add predictive information beyond the platform’s own pricing assessment?

| Draft objective | Implementation/evaluation | What the evidence establishes |
|---|---|---|
| Rank resolved loans using application information | Application logistic/XGBoost; cells 22, 24, 28 | Moderate ranking in one selected historical sample |
| Compare complex and simple models | Random-search XGBoost and paired AUC bootstrap; cell 26 | Small AUC difference; interval includes zero, so no demonstrated superiority |
| Test incremental information beyond incumbent pricing | LC-price baseline and application-plus-price models; cells 22/26 | Combined features add ranking information in this dataset; not a causal business improvement |
| Assess calibrated probabilities across time | Validation Platt scaling, test Brier/ECE/deciles; cell 28 | Calibration changes probabilities but temporal miscalibration remains |
| Translate PD into an illustrative price | Training LGD, assumed funding/margin, back-test/sensitivity; cells 34/35 | Transparent scenario rule, not optimal or verified profitable pricing |
| Supporting engineering objective | React/Flask, artifact inference, repayment/tests | Working synthetic workflow; full-feature metrics do not validate reduced-form predictive performance |

### Explain each output

| Output | Meaning |
|---|---|
| Principal | Requested amount, supplied by the applicant |
| Risk (Predicted) | Calibrated probability of charge-off; the only directly predicted displayed quantity |
| Risk tier/recommendation | Policy derived from PD, not a separately trained classifier |
| Interest rate | Funding cost + margin + PD × LGD, capped at 40% |
| Expected loss rate/amount | Expected principal loss fraction PD × LGD; dollars multiply by principal |
| Loan price | Scheduled total repayment assuming full/on-time repayment; not default-adjusted expected cash receipts |
| Monthly payment/duration | Fixed-payment amortisation and selected number of months |
| Profit (Before Costs) | Scheduled total interest, not net profit after funding, expenses or credit losses |
| Borrower indicators | Hand-directed deviations from training medians, not local model explanations |

Policy is **approve for PD <15%; refer for 15% ≤ PD <30%; decline for PD ≥30%**, using unrounded PD. The frontend says “Refer to Superior”; the API returns “Refer to Senior Officer.” Its visible “<30%” referral caption must be read together with the preceding approve rule. These thresholds are application assumptions, not learned weights or the notebook’s recall-selected operating point. [P:35–38,214–222][P], [R][R]

Volunteer the main limitations: accepted/resolved-loan selection; differing follow-up and temporal drift; full-sample EDA before splitting; unverified field timing; 40 default-filled model features; no subgroup fairness audit; heuristic indicators; and pricing that combines lifetime credit loss with annual cost/rate assumptions. Tests establish functional behavior, not creditworthiness or policy validity.

## 2. Frontend and every field

App fetches /api/options at mount, then renders defaults and dropdowns. Inputs are controlled React state. NumberInput uses browser validity flags for immediate red errors and submission blocking. Monthly debt is frontend-only state; DTI = monthly debt / annual income × 1200 and is sent rounded to one decimal. [App:12–16][A], [LoanForm:88–163][F], [NumberInput:4–49][N], [DTI helper][D]

Numeric strings become finite Python floats; categories remain canonical strings. Browser increments and server validation are separate: the API does not enforce the money/percentage step sizes. “Required” rejects an explicitly supplied blank, but **an omitted key still uses a default**, even for a required form field. Unknown keys are ignored. [Schema:63–108][V]

| UI label / LoanForm line | API key | Type/units | UI and API validation | Business rationale | Destination and actual effect |
|---|---|---|---|---|---|
| Loan Amount (USD), 172 | loan_amnt | String → float, USD | 500–40,000; UI step 500, required | Requested exposure | Model amount/LTI, loss dollars, repayment principal; used by trees |
| Loan Term, 182 | term | 36 months / 60 months | Whitelist/select | Horizon and instalment burden | Model feature and repayment months; used by trees |
| Loan Purpose, 195 | purpose | Category, e.g. debt_consolidation | Whitelist, not display label | Borrowing reason | Model encoding and result purpose label; used by trees |
| Annual Income (USD), 208 | annual_inc | String → float, gross USD/year | ≥1,000; UI step 1,000, required | Repayment capacity | Model income, backend LTI, frontend DTI; used by trees |
| Monthly Debt Payments (USD), 221 | **Not sent** | Nonnegative USD/month | UI min 0, step .01, required | Existing required debt service | Frontend DTI only, not an independent model feature |
| Employment Length, 240 | emp_length | Year category | Whitelist/select | Stability proxy | Encoded/used by trees; confirm total employment versus current-employer tenure |
| Home Ownership, 250 | home_ownership | RENT/OWN/MORTGAGE/OTHER | Whitelist/select | Housing/financial profile | Encoded/used by trees; no housing payment is independently collected |
| Verification Status, 265 | verification_status | Not Verified/Verified/Source Verified | Whitelist/select | Reliability of income | Encoded/used by trees; selection does not actually verify documents |
| Application Type, 279 | application_type | Individual/Joint App | Whitelist/select | Solo/joint application | Validated/encoded, **no saved-tree split usage**; no prediction, repayment or loss effect; no co-applicant finances collected |
| FICO Credit Score, 295 | fico_avg | Integer 300–850 | Bounds/integer, required | Credit-history summary | Used model feature; training uses midpoint of FICO low/high bounds |
| DTI %, 310 | dti | Read-only percentage, numeric string sent | Derived; 0–100; API bounds | Existing debt burden/income | Used model feature and indicator; server trusts DTI because debt total is not sent |
| Revolving Utilisation %, 324 | revol_util | Percentage 0–100 | Bounds; UI step .1; blank may default | Revolving-credit usage | Used model feature/indicator; related balance/limit inputs remain defaults |
| Months Since Inquiry, 338 | mths_since_recent_inq | Integer months 0–240 | Bounds/integer; blank may default | Recent credit seeking | Used model feature/indicator; does not derive the separate inquiry-count feature |
| Delinquencies, 351 | delinq_2yrs | Nonnegative integer count | Min/integer; blank may default | Prior payment problems | Used model feature/indicator; other delinquency fields remain defaults |
| Open Accounts, 364 | open_acc | Nonnegative integer count | Min/integer; blank may default | Credit-account profile | Used model feature/indicator; related account counts remain defaults |
| Public Records, 381 | pub_rec | Nonnegative integer count | Min/integer; blank may default | Derogatory records | Used model feature/indicator; bankruptcy/tax-lien subtypes remain defaults |

Sources for all rows: [LoanForm][F], [schema rules:5–54][V] and [artifact split-usage inspection](evidence/runtime-inspection.json). Correct mapping does not mean every input change changes a prediction: trees can stay in the same leaves. Application Type has no split usage at all in this saved estimator.

### Derived inputs and serving gaps

The model expects **56 raw columns: 50 numeric, 6 categorical**. The API supplies 15, including DTI. Backend LTI adds one; **40 other columns use training defaults**. These include credit-history length, inquiry counts, revolving balances/limits, bankruptcy and bureau-account details; the full list is in runtime evidence. [Predictor:83–94][P]

Training engineers midpoint FICO, credit-history years between earliest credit line and issue date, and LTI (cells 10/16). Serving asks for midpoint FICO, recomputes LTI, and defaults credit-history years. DTI is a new UI convenience; training uses the dataset’s DTI.

**Needs source-document confirmation:** DTI’s debt definition, especially mortgage treatment; employment-tenure meaning; delinquency event definitions; and whether bureau fields represent origination snapshots or later updates. Tooltip wording/column names do not independently establish those definitions. Everyday expenses and a proposed new instalment are not existing debt payments.

Defaulting can create inconsistent profiles: edited utilisation with unchanged revolving balances/limits, edited open accounts with unchanged related counts, and defaults treated as observed values rather than genuinely missing information. A post-hoc test replacing only the 40 uncollected features reduced AUC from .6828 to **.6697** and AP from .3601 to **.3379**. ECE improved to .0221 and mean PD moved closer to prevalence, showing that ranking and calibration can move differently. This diagnostic retains dataset values/missingness for collected fields and does not simulate browser rounding/API eligibility; it is **not original notebook evidence or exact UI-mode performance**. [Reproduced metrics](evidence/reproduced-metrics.json)

### Form lifecycle and result display

LoanForm:138–163 sets loading, sends JSON to /api/score, displays server error messages, or a connection failure message. Assessment is disabled during the request. Success stores the response in App and switches to ResultView. New Assessment clears it and starts a default form; no database or credit-report integration exists. [A][F][R]

Examples → Set replaces all editable fields, recalculates DTI, clears old control errors/scroll and announces a five-second notification; it does not submit. The three synthetic outcomes are tested against the artifact, not hardcoded result screens. [LoanForm:118–136,410–435][F]

Known inspected UI limitation: /api/options fetch has no failure handler, so an unavailable backend can leave “Loading…”. Numeric steps are enforced only in the browser. Result percentages are rounded; policy and expected-loss arithmetic use unrounded values. The PD color/risk tier are based on the returned decision, not another browser model.

## 3. A synthetic request through Flask

Use the Risky fixture: monthly debt **938.67 USD**, annual income **64,000 USD**, DTI about **17.60006%**, displayed/sent **17.6%**. Debt itself is not sent.

~~~json
{
  "loan_amnt": "12000", "term": "36 months", "purpose": "debt_consolidation",
  "annual_inc": "64000", "emp_length": "10+ years", "home_ownership": "MORTGAGE",
  "verification_status": "Source Verified", "application_type": "Individual",
  "fico_avg": "692", "revol_util": "55.0", "mths_since_recent_inq": "5",
  "delinq_2yrs": "0", "open_acc": "11", "pub_rec": "0", "dti": "17.6"
}
~~~

1. React sends same-origin JSON. Vite proxies /api to localhost:5001 in development. Deployment will use a reverse proxy. [F][VT]
2. Flask rejects non-JSON media type (415), malformed JSON (400) and schema failures (400 with error/field_errors). It calls predictor.score. [App:33–45][A]
3. Validator converts amounts/counts to floats and keeps whitelisted category strings; invalid finite/range/count/category values fail. Omitted keys select defaults. [V]
4. Predictor copies defaults, overwrites accepted inputs and recomputes **LTI = .1875**. It builds a 1-row pandas DataFrame in exact metadata feature order. Evidence records every value/dtype. [P:83–94][P]
5. Saved preprocessing transforms 56 raw columns into a **1×124 dense ndarray**: 50 numeric values + 38 numeric missing indicators + 36 encoded category columns. It transforms, never refits.
6. The saved 250-tree classifier returns raw PD **.11040423065423965**.
7. Platt calibration on the clipped raw logit returns PD **.16016832034559084**. Positive class is 1; artifact classes [0,1] were checked.
8. Expected loss is PD×LGD with LGD **.5898284294117135**. Price adds .04 funding + .025 margin, caps at .40, then displays **15.95%**. Repayment uses that displayed rate and 36 months.
9. Unrounded PD belongs to [.15,.30), so recommendation is referral/Medium Risk. UI formats the JSON response; it does not predict again.

These steps were executed with Flask’s test client and the saved pipeline. [P:78–94,198–242][P], [complete trace](evidence/runtime-inspection.json)

### Actual verified response

~~~json
{
  "decision": "Refer to Senior Officer", "risk_tier": "Medium Risk",
  "pd_pct": 16.0, "el_rate_pct": 9.4, "el_dollars": 1133.66,
  "suggested_rate_pct": 15.95, "uncapped_suggested_rate_pct": 15.95,
  "pricing_capped": false, "rate_cap_pct": 40.0,
  "loan_amnt": 12000.0, "purpose_label": "Debt Consolidation",
  "term_months": 36, "monthly_payment": 421.59, "final_payment": 421.51,
  "total_repayment": 15177.16, "total_interest": 3177.16,
  "lgd_pct": 58.98, "funding_cost_pct": 4.0, "operating_margin_pct": 2.5,
  "risk_drivers": [{"label": "Debt-to-Income Ratio (DTI)",
    "value_str": "17.6%", "typical_str": "17.6%", "unit": ""}]
}
~~~

The indicator shows 17.6% versus 17.6% because the underlying median is **17.59** and input is **17.6**. The heuristic has no meaningful-deviation threshold; rounding hides the tiny difference. It does not prove DTI caused the model decision. Similarly, displayed 9.4% × 12,000 is not exactly 1,133.66: expected loss uses unrounded probability/severity. [P:114–155,205–212][P]

### Startup, artifacts and repayment

Running python flask_app/app.py starts Flask’s development server on loopback:5001, debug enabled, reloader disabled. Importing app imports predictor, which loads both joblib files and metadata **once per process**. Each WSGI worker independently loads them; there is no live training or parameter update during scoring. [A:1–13,48–49][A], [P:12–30][P]

Repayment uses r = annual percent /1200 and n months:

~~~text
M = P*r / (1 - (1+r)^(-n)); at zero rate, M = P/n
Total repayment = (n-1)*rounded_monthly_payment + adjusted_final_payment
Total interest = total repayment - principal
~~~

Decimal/ROUND_HALF_UP rounds the regular instalment and each month’s remaining-principal interest to cents. The final instalment clears the remaining balance. This avoids multiplying a rounded payment by n while leaving an unexplained residue. No fees/early repayments/default events are modelled in this schedule. A declined scenario still has a hypothetical schedule; it is not an offer. [Repayment:4–37][RP]

## 4. Data, training and evaluation

### Provenance, sampling and target

Cell 5, ID nIgGeNfEbFyI, downloads Kaggle wordsforthewise/lending-club and chooses accepted_2007_to_2018Q4.csv(.gz); saved download output identifies version 3 and 151 raw columns. The cached version-3 gzip SHA-256 is **55c16f75120f897683f02e7aabcf080d0e4a20c4832feb1d592cfa941bd62a2d**. The repository does not contain the authoritative data dictionary, license record or an approved thesis document. Confirm these independently.

Cells 6/8 whitelist 64 loaded columns, filter Fully Paid/Charged Off, sample 8% from each 200,000-row chunk with seed 42+chunk index, then cap at 150,000. Saved/reproduced sample: **107,625 loans; 86,104 Fully Paid, 21,521 Charged Off**. This is not class balancing or a rejected-applicant sample. Environment knobs allow different fractions/row caps; reproduction used the recorded default run parameters.

Cell 10, ID NIRO3uBSbFyJ, maps Charged Off to 1/Fully Paid to 0, parses month-year dates, cleans utilisation and term, computes midpoint FICO, replaces infinities with missing, drops missing issue dates and sorts by issue date. Unresolved/late statuses are excluded, not treated as defaults. Resolution at one dataset snapshot is not a fixed follow-up horizon: recent loans still running are missing, creating selection/maturity bias.

### Preprocessing and engineering

Cell 13 reports 13.1% missing recent-inquiry months, 8.7% missing num_tl_120dpd_2m, 5.8% missing employment and historical blocks of absent bureau data. Cell 20, ID izmmPQzWbFyL, fits numeric median imputation with indicators followed by StandardScaler, and categorical most-frequent imputation followed by OneHotEncoder with unknown='ignore' and min_frequency=20. Fit happens inside training pipelines/CV, not on the holdout or during requests.

Scaling helps logistic regression and supports shared preprocessing; it is not generally essential for trees. Rare categories can be grouped. API whitelisting now rejects unsupported categories before that encoder, and accepted UI categories were checked against fitted categories.

Cells 10/16 engineer FICO midpoint, nonnegative credit-history years, and loan/income with zero income mapped to missing. Quantile clipping is for EDA plots, not model inputs. Markdown says an engineered feature must show monotonicity, but code always includes the three engineered fields; there is no conditional selection test. Serving rejects DTI >100 and income <1,000 although training retained 39 sample DTI values above 100 and very low incomes. Browser precision/increments are also serving constraints, not learned data transformations.

### Split, estimators and imbalance

Cell 18, ID iX0uOEGebFyL, and new reproduction agree:

| Split | Records | Issue-month span | Default rate | Role |
|---|---:|---|---:|---|
| Train | 75,337 | 2007-07–2016-04 | 18.60% | Preprocessing/estimator fitting and internal CV |
| Validation | 16,144 | 2016-04–2017-02 | 25.03% | Calibration and operating-point/model assessments |
| Test | 16,144 | 2017-02–2018-12 | 21.49% | Ranking/calibration/pricing evaluation |

Ordered splitting exposes temporal drift more plausibly than random mixing. Boundary months overlap, so it is not a month-disjoint split; no repeated-borrower/entity split audit is implemented.

Cell 22 fits three logistic references: LC sub_grade+int_rate; FICO only; application features. Logistic has C=1 and max_iter=3000, with no class-weight setting. Cell 24, ID CMoSPKcQbFyL, searches XGBoost histogram trees with binary logistic objective, logloss eval metric and seed 42. RandomizedSearchCV evaluates **18 candidates ×3 TimeSeriesSplit folds inside train**, optimising average precision, then refits on train.

Selected and artifact-confirmed parameters: **250 trees; max depth 5; learning rate .02; subsample .85; colsample 1; min child weight 10; L1 alpha .2; L2 lambda 5**. Controlling complexity/overfitting is a reasonable rationale, not proof of general optimality. No SMOTE, class resampling or explicit positive-class weighting is set. Average precision, recall/precision and lift address minority-default evaluation; they do not rebalance training.

### Leakage and training-serving audit

| Concern | Supported conclusion |
|---|---|
| Target/payments/recoveries in main PD | Cell 16 assertion and artifact columns exclude the named target/outcome/benchmark fields. This guards listed direct leakage. |
| Grade/rate in comparison models | Deliberately present in benchmarks/combined estimators, absent from deployed PD. Describe these experiments separately. |
| Future data fitting preprocessing | Saved imputers/encoders/scalers are fitted on train/CV folds and reused at inference. |
| Holdout used in EDA | Cells 12–16 analyse all DF with outcome labels before splitting. Analyst feature motivation sees the holdout, weakening “untouched test” claims. |
| Application-time availability | Column names/whitelists cannot establish snapshot timing. Data dictionary confirmation is necessary. |
| Temporal/entity separation | Index-ordered, shared month boundaries and unverified borrower overlap; improve with disjoint month/entity groups. |
| Reduced form versus research model | Forty defaults, related-feature inconsistencies and hidden missingness; full-feature metrics do not validate the form. The new masking diagnostic isolates part of this gap. |
| Derived LTI | Correctly recomputed/tested in Flask at this commit. Optional Gradio cell 38 only overwrites raw fields and does not recompute it: do not defend that old demo as the serving path. |
| Calibration and policy | Validation calibrator; application thresholds .15/.30 are separate from validation recall thresholds, with no financial-policy optimisation. |

### Metrics: saved outputs versus reproduction

Cell 28’s saved test table:

| Model | ROC-AUC | AP | Brier | ECE | Lift@10% | Precision@≥70% recall |
|---|---:|---:|---:|---:|---:|---:|
| LC pricing | .6760 | .3355 | .1595 | .0346 | 1.8165 | .3004 |
| FICO only | .5963 | .2623 | .1669 | .0394 | 1.3437 | .2583 |
| Application logistic | .6800 | .3540 | .1600 | .0418 | 2.0789 | .3049 |
| Application XGBoost raw | .6828 | .3601 | .1583 | .0363 | 2.0732 | .2989 |
| Application XGBoost calibrated | .6828 | .3601 | .1583 | .0318 | 2.0732 | .2989 |
| Application+LC logistic | .6923 | .3612 | .1581 | .0379 | 2.0357 | .3129 |
| Application+LC XGBoost | .6948 | .3704 | .1561 | .0278 | 2.0876 | .3099 |

**Reproduced frozen artifacts:** test AUC **.68282353195**, AP **.36013359135**, lift **2.07315707936**. Raw Brier **.15827571586**, calibrated **.15827126758**: equality at four decimals hides a tiny change. Raw ECE **.03627689778**, calibrated **.03179226320**. Raw mean PD **17.86%**, calibrated **24.41%**, observed **21.49%**. See [reproduced-metrics.json](evidence/reproduced-metrics.json). Logistic/combined estimators and bootstrap intervals were not retrained/recomputed. The cell-39 narrative’s earlier .689 AUC and .43/.10 F1 are not this final table; do not use them as current results.

Explain metrics aloud:

- **ROC-AUC:** how often a random default ranks above a random non-default. It is not 68.3% accuracy; it ignores decision costs/calibration.
- **AP:** precision–recall summary for defaults. Code calls average_precision_score, not trapezoidal PR area; compare to 21.49% prevalence. Changing prevalence changes AP.
- **Brier:** mean squared probability error. Good averages can hide subgroup/high-risk errors.
- **ECE:** weighted absolute gaps in ten equal-count probability bins; depends on binning and can hide local/subgroup miscalibration.
- **Lift@10%:** highest-scored tenth has about 2.07× overall default prevalence; useful for review priority, not proof of profitable approval.
- **Precision@≥70% recall:** descriptive best precision over thresholds meeting that recall on the evaluated set. It is not the deployed cutoff.

A false negative can approve a later charge-off; a false positive blocks/reviews a borrower who would repay. Aggregate ranking metrics do not price this financial/fairness trade-off. Accuracy could be deceptively high by predicting the majority class; current final tables do not measure accuracy/F1.

Cell 26, ID Im35SAQ9bFyL, uses paired test-loan bootstrap samples (500) for AUC differences. Saved intervals:

| Difference | AUC difference | 95% interval |
|---|---:|---|
| XGBoost − application logistic | .0029 | −.0014 to .0073 |
| Application logistic − LC pricing | .0039 | −.0051 to .0126 |
| Application XGBoost − LC pricing | .0068 | −.0020 to .0153 |
| Combined XGBoost − LC pricing | .0188 | .0133 to .0244 |
| Combined XGBoost − application XGBoost | .0120 | .0075 to .0166 |

Only the latter two exclude zero. “No demonstrated difference” is not proof of equivalence. These intervals do not account for all selection uncertainty, temporal dependence or multiple comparisons.

Another design caveat: LC-price-only is logistic, while the combined XGBoost comparison changes both the feature set and estimator. It is not a pure attribution of gain to added features. Combined logistic also has higher saved AUC (.6923 versus .6760), but its paired interval is not reported. A matched price-only XGBoost baseline or a paired combined-logistic versus price-logistic comparison would isolate incremental feature value more cleanly.

### Calibration, thresholds and price

Cell 28 fits LogisticRegression on validation **logit(raw PD)**. Positive monotonic calibration preserves ranking/AUC/AP but changes probability levels. Validation calibrated mean matches its 25.03% rate; transferred test mean 24.41% exceeds 21.49%. Saved highest decile predicts .533 versus observed .445. Calibration is not a guarantee for future cohorts.

Cell 30, ID vx-KJEY5bFyL, chooses a validation cutoff to reach ≥70% default recall. Calibrated XGBoost cutoff **.226** yields test **46.4% flagged, precision .306, recall .661**. Recall does not automatically transfer under drift. This is not the app’s .15/.30 policy.

Cell 34, ID qOsJma-tbFyM, measures LGD using training charge-offs: funded principal minus principal recovered and recoveries, clipped nonnegative and summed over funded principal. Gross severity ~67.2%, net **58.98284294%**. These outcome fields measure training loss severity; they are not live PD features. Funding **4%** and margin **2.5%** are explicitly assumed, not dataset values.

Cell 35 varies funding 3–5% and LGD ±10 percentage points; saved median suggested rate spans 16.0–22.3%. The back-test can understate realised loss: top decile predicted loss fraction .314 versus realised .377. Predicted mean PD×fixed LGD and realised total loss/total funded principal also use different weighting.

**Say aloud:** “The price is an illustrative rule, not an optimal price. PD reflects resolved-loan lifetime outcomes; adding lifetime loss to annual funding/margin rates requires stronger cash-flow and default-timing modelling before real pricing.” Scheduled repayments and expected credit loss answer different questions; gross interest does not establish net profit.

## 5. Artifacts, learned parameters and weights

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| xgb_risk_model.joblib | 671,213 | 010b7dfacd50189d28f23fed014a593a9e72c7e6d78a643d9812074f17ddfef8 |
| platt_calibrator.joblib | 879 | 5872828eccbe7c8d1b0037170bf6e641dc3740fd80c441a15aba98dc080de2b2 |
| metadata.json | 4,275 | 3a2fdc018f180b349d37763d296f6906ebce329b5b77a6f6106120ad8f8c9512 |

Export cell 37, ID cZXJv7xybFyM, dumps best_xgb and validation Platt, then writes feature lists/order, training medians/modes, measured LGD and assumed funding/margin. Flask loads all three. Neither logistic baseline nor LC-combined estimator is saved for serving. [P:17–30][P]

Keep these concepts separate:

- **Trees:** feature/threshold tests, child structure, missing-value routing, leaf scores and initial base score; additive leaf contributions produce the logistic margin. No single linear FICO/income coefficient applies everywhere.
- **Preprocessing learned state:** imputation medians, missing-indicator columns, means/scales, modes/categories and rare-category grouping. It must travel with the estimator.
- **Calibrator coefficients:** slope **1.00824084394**, intercept **.44683793467**, giving PD = sigmoid(1.00824×logit(raw PD)+.446838). These calibrate the raw score, not individual applicant features. The intercept multiplies raw odds by ~**1.56336**, with slope also transforming odds.
- **Logistic baseline coefficients:** if available, they would be conditional log-odds effects on transformed inputs. Scaling means a standardised unit, not one raw dollar; one-hot/correlation/regularisation affect interpretation. Those fitted baseline coefficients are not serialized here; do not invent values.
- **Class weights:** training error emphasis, not feature weights. No explicit logistic class weights/XGBoost positive reweighting are set.
- **Importance:** cell 32, ID YyFadYuCbFyM, reports permutation AP drops: term .0460, FICO .0189, LTI .0102, then bureau features. These are saved global diagnostics, not causal effects/local explanations. Correlated variables share importance; shuffling can create unrealistic profiles.
- **Policy/heuristic choices:** .15/.30 cutoffs and handwritten risk-direction signs are not learned parameters.

The loaded artifact has 124 transformed columns and split usage corresponding to 50 of 56 raw fields. Application Type has no usage, despite being encoded; this is stronger than observing one unchanged prediction. Do not claim joint-underwriting capability from that dropdown.

### Dependency and compatibility inventory

Artifacts loaded without captured warnings and reproduced metrics in **Python 3.9.6, NumPy 2.0.2, pandas 2.3.3, sklearn 1.6.1, XGBoost 2.1.4, joblib 1.5.3**. Flask 3.1.3/flask-cors 6.0.5 served test requests. These are verified serving versions; notebook metadata does not preserve a complete original training runtime. Broad requirements are not a lock, and joblib is version-sensitive. Use only trusted artifacts.

| Dependency category | Packages |
|---|---|
| Shared training/inference | numpy, pandas, scikit-learn, xgboost, joblib |
| Research plots/downloads | matplotlib, kagglehub; IPython/notebook runner also required but not explicitly locked |
| Optional notebook UI | gradio, only when cell 38 is enabled |
| Flask serving | Flask, flask-cors and shared inference packages; production WSGI server absent from original requirements |
| Frontend build | React/Radix/Lucide/KaTeX assets; Node/Vite/Tailwind build tooling, not needed on VM after build |
| Infrastructure | Reverse proxy, systemd, Linux-compatible wheels and OS runtime libraries |

Debian Trixie’s default Python differs from tested Python; NumPy 2.0.2 has no normal Python 3.13 wheel. A tested Linux-compatible set is needed. CPU-only XGBoost can avoid unused GPU/NCCL downloads if module/version and fixture outputs are preserved. Thread-count/WSGI changes do not retrain trees, but should be checked against identical fixtures.

### What was run and what was not

Passed: **27 backend unittests; six Node DTI tests; oxlint; Vite build; three synthetic Flask-client scores; structured invalid-input 400; feature names/order/types and category checks; frozen-artifact full-feature metrics; separate 40-default masking diagnostic.**

Not claimed: complete notebook retraining; newly fitted logistic/combined models or bootstrap intervals; independent new-cohort validation; a fairness audit; browser pixel/interaction verification; or a hosted VM test at this stage.

Local Mac ARM64: startup **1.43 seconds**, process peak RSS **145.86 MiB**, scoring p50 **2.25 ms**, p95 **2.73 ms**, 100 synthetic requests. OpenMP/BLAS environment limits were one; artifact n_jobs remains −1. These are process measurements, not Debian VM/WSGI/proxy/OS memory together. Deployment evidence must be recorded separately.

## 6. Defense rehearsal

### Roughly 90-second opening

“My project investigates whether information available when a loan is applied for can help estimate credit risk, and whether it adds information beyond LendingClub’s own pricing assessment. I use historical accepted loans with resolved outcomes, defining charge-off as the positive class. I split records chronologically, compare logistic baselines with tuned XGBoost, and evaluate ranking, calibration and operating points.

The saved application-only XGBoost achieves a test AUC of about .683 and average precision of .360. Its AUC advantage over logistic regression is small and the confidence interval includes zero, so I do not claim demonstrated superiority. Combining application features with incumbent pricing shows incremental ranking information in this dataset. Calibration improves bin-level error, but temporal differences still affect probability accuracy.

The prototype exposes calibrated default probability through React and Flask. It illustrates expected loss, an assumed-cost pricing rule and a fixed-payment schedule. Only PD is directly predicted. The reduced form defaults uncollected features, so full-feature research metrics are not a performance claim for that interface. Selection bias, timing ambiguity and the absence of a fairness audit limit the conclusions. The contribution is a reproducible comparison and a transparent demonstration, not a production underwriting policy.”

### Slide outline

1. Business decision, research question and target definition.
2. Dataset provenance, resolved-loan sample and selection/maturity caveat.
3. Feature policy, engineering, missingness and chronological split.
4. Baselines, search and tuning/calibration/test roles.
5. AUC/AP/lift and the paired comparison interval; avoid outdated .689 headline.
6. Calibration under drift: base rates and reliability deciles.
7. Measured LGD versus assumed costs; price/annualisation limitations.
8. React→Flask→pipeline→calibration architecture, defaults and unused Application Type.
9. Synthetic live demonstration and code-test evidence.
10. Fairness, external validity, missing evidence and next research steps.

### Short synthetic live demo

1. Examples → Successful → Set: explain that DTI recalculates and no request was sent yet. Press Assess Application.
2. Show **5,500 principal; 6.3% predicted risk; 10.22% calculated rate; 178.04 monthly; 6,409.34 scheduled total; 204.68 expected loss**. Open formulas: distinguish prediction from calculation.
3. New Assessment → Risky → Set → Assess: **16.0% PD; Medium Risk/referral; 15.95% rate; 421.59 monthly; 15,177.16 total**. Explain the chosen policy boundary and rounding/median-indicator caveat.
4. New Assessment → Declined → Set → Assess: **74.1% PD; High Risk; 40% capped rate; uncapped 50.22%**. Schedule is hypothetical, not an offer.
5. If time permits, enter an invalid value to demonstrate red validation; explain structured API errors too.

Have recorded responses offline as fallback. Verify backend/options before presenting; training is not part of the live demo. Do not use real applicant data.

### Likely examiner questions and spoken answers

**Research design?** “An observational predictive comparison on one accepted-loan dataset with ordered holdouts and paired model comparisons, not a causal trial or a tested approval policy.”

**Why XGBoost if logistic is nearly as good?** “It is a nonlinear candidate evaluated against a simpler baseline. The interval does not establish improvement; a simpler deployment could be justified.”

**AUC .683 means 68.3% accuracy?** “No: pairwise ranking probability. Financial utility depends on policy, costs and calibration.”

**How was imbalance handled?** “I optimised average precision and reported precision/recall and lift. I did not use SMOTE or explicit class reweighting.”

**Did you avoid leakage?** “Named outcomes and incumbent prices are excluded from the main artifact, and preprocessing is fitted in training. But full-sample EDA saw the holdout and source-field timing still needs confirmation.”

**Why chronological splitting?** “It exposes performance on later loans and drift. Shared month boundaries and possible repeated borrowers should be addressed in a stricter study.”

**How can default be known at application?** “It is an uncertain prediction from associations with later resolved status. A whitelist alone does not prove every input was available at that time.”

**Why calibration?** “Expected loss needs probability levels, not only ranking. Validation calibration changes levels, but temporal drift still makes transferred probabilities imperfect.”

**Were 15%/30% learned?** “No; they are demo policy cutoffs. The notebook’s validation recall threshold is a separate experiment.”

**Does every field matter?** “All map to the intended schema, but Application Type has no tree-split usage. Forty raw inputs default; individual changes can also stay within the same leaves.”

**Does the UI achieve the notebook AUC?** “Not established. The full-feature notebook differs from the reduced form. A separate masking diagnostic measured some degradation, but it is not exact UI-mode validation.”

**What are the weights?** “Trees store splits/leaf scores and preprocessing state. The calibrator has a slope/intercept on the raw logit. Importance, class weights and policy cutoffs are different concepts.”

**Did the model predict costs or LGD?** “No. Training losses/recoveries measure LGD; funding and margin are assumed. Only PD is predicted.”

**Does profit prove economic viability?** “No; it is scheduled interest before costs/losses. Proper valuation needs cash flows, costs, default timing and annualised risk.”

**Is it fair without race/sex inputs?** “That is not guaranteed. Financial/housing variables can be proxies and accepted-loan selection can reflect prior bias. No subgroup calibration/error/disparity analysis was performed.”

**What before real lending?** “Verify definitions/horizons; validate or retrain the actual serving feature set; use disjoint time/entity cohorts and external data; audit subgroup errors/calibration; optimise policy for real costs; monitor drift and add secure human-reviewed deployment.”

**What is reproduced?** “Frozen XGBoost/calibrator metrics, synthetic traces and code tests. Logistic comparison/CI results remain saved notebook evidence.”

**Does a 1 GB VM fit?** “The local process peaked around 146 MiB; that is not a target-system measurement. Compatible Linux wheels and a single-worker/proxy/OS measurement must precede a hosted claim.”

### Confirm before your final defense

Obtain approved question/objectives and grading requirements; dataset license/provenance/data dictionary; field timing/DTI/employment definitions; original training runtime and notebook execution provenance; expected outcome horizon; and whether fairness/economic optimisation were explicit thesis objectives. Repository evidence cannot authoritatively supply these.

## Immutable source references

[NB]: https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/Lending_project_v2%20%281%29.ipynb
[A]: https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/flask_app/app.py#L1-L49
[V]: https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/flask_app/application_schema.py#L5-L108
[P]: https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/flask_app/predictor.py#L12-L243
[RP]: https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/flask_app/repayment.py#L4-L37
[F]: https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/flask_app/frontend/src/components/LoanForm.jsx#L88-L435
[N]: https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/flask_app/frontend/src/components/ui/number-input.jsx#L4-L49
[D]: https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/flask_app/frontend/src/lib/debt-to-income.js#L1-L11
[R]: https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/flask_app/frontend/src/components/ResultView.jsx#L47-L230
[VT]: https://github.com/JamesBenji/LendingCreditPrototype/blob/d8643c8e1f3aa3c34ba95279291706a7ac96d5eb/flask_app/frontend/vite.config.js#L1-L18
