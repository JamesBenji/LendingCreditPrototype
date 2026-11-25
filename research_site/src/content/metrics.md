## Why accuracy is inadequate

A majority-class rule can look accurate while finding no charge-offs. Accuracy counts correct labels at a cutoff; it says little about ranking or whether a 20% prediction means one charge-off in five. The final notebook tables instead separate discrimination, calibration and operating points. {{source:notebook|Metric helpers — cell 20; final table — cell 28}}

## Ranking: ROC-AUC and average precision

Receiver operating characteristic area under the curve (ROC-AUC) is the chance a randomly chosen positive ranks above a randomly chosen negative, with half credit for ties:

$$AUC=P(s_+>s_-)+\tfrac12P(s_+=s_-)$$

It summarises discrimination across cutoffs. It is not classification accuracy and does not evaluate probability levels or costs. It is less directly dependent on prevalence than precision, but can hide weak positive-class usefulness under imbalance. The project compares AUC with paired intervals. {{evidence:comparisons}}

Precision–recall area under the curve (PR-AUC) is represented here by average precision (AP), not trapezoidal area:

$$AP=\sum_k (R_k-R_{k-1})P_k$$

$R_k$ is recall at a threshold and $P_k$ is precision. Recall is true positives divided by all actual positives. Precision is true positives divided by all flagged loans. AP weights precision by gains in recall. It directly describes how well defaults rise to the top, but changes with prevalence and does not measure calibration. The code uses average_precision_score for search and evaluation. {{source:notebook|Metrics and search — cells 20 and 24}}

## Probability error: Brier and ECE

$$Brier=\frac1n\sum_i(p_i-y_i)^2$$

Brier score is mean squared probability error. Lower is better. It rewards both probability accuracy and useful separation, but depends on base rate and can hide subgroup errors. Compare it with a constant prevalence predictor, not an arbitrary universal cutoff. {{source:notebook|Constant baseline — cell 22}}

Expected calibration error (ECE) compares average probability with outcome share within bins:

$$ECE=\sum_b\frac{n_b}{n}\left|\bar p_b-\bar y_b\right|$$

The code forms up to ten equal-count probability bins using qcut, dropping duplicate edges. Lower ECE means smaller average bin gaps, not calibrated probabilities for every person. Binning choices can conceal local or subgroup miscalibration. {{source:notebook|calib_table and ece — cell 20}}

Calibration-in-the-large here means comparing mean PD with observed default share:

$$\Delta_{mean}=\frac1n\sum_i p_i-\frac1n\sum_i y_i$$

Positive gap means average overprediction; negative means underprediction. Equal means do not guarantee calibration within risk bands. The notebook reports this mean comparison, not a newly fitted calibration intercept. {{source:notebook|Mean probabilities — cell 28}}

## Review priority and operating points

$$Lift_{10\%}=\frac{\text{default share among highest-scored tenth}}{\text{overall default share}}$$

The code takes floor(0.1n) highest scores. Lift describes concentration of risk for review, not profitable approval. It can vary with cohort and tied-score ordering. {{source:notebook|top_decile_lift — cell 20}}

$$Precision_{\ge70\% recall}=\max_{t:Recall(t)\ge0.70} Precision(t)$$

This helper scans the evaluated set. It is a descriptive comparison, not a deployable cutoff chosen independently of test. The separate operating-point experiment chooses cutoffs on validation and reports achieved test recall. {{source:notebook|precision_at_recall — cell 20; threshold experiment — cell 30}}

## Pricing utility is a separate test

AUC and AP rank risk. Brier, ECE and mean gaps assess probability levels. Precision/recall describe a policy operating point. None alone proves financially valid pricing. Pricing additionally needs correct severity, timing, costs and outcomes. {{evidence:pricing}}

## Read disagreements between metrics

The masking diagnostic loses AUC and AP while its ECE improves. That disagreement is informative: the default-filled scores can become closer to the cohort's average event rate while becoming less useful at ordering individual loans. Ranking and calibration are different properties. Selecting whichever metric improved would conceal the other failure, so the project reports both. {{source:reproduced-metrics|Full-feature and default-filling metrics}} {{evidence:gap}}
