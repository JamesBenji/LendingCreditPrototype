## The evidence widened the question

The first question was whether application information could rank loan risk. The later experiments exposed separate problems: whether that ranking needed a complex model, whether its probabilities transferred through time, and whether the browser collected enough information to use it reliably. Each question changed what the project could claim. {{source:notebook|Research questions and experiments — cells 0–35}}

The central lesson is that a useful risk ranking is only one step toward a lending decision. Calibration, loss severity and the information collected from an applicant each need their own evidence. Treating them as one model-performance claim would hide where the system can fail. {{evidence:comparisons}} {{evidence:frozen}} {{evidence:gap}}

## Drift changed how the model was tested

Issue-year default rates and blocks of missing bureau information showed that older and newer loans were different. A random split would spread those conditions across both training and test. The notebook instead used an ordered split and missingness indicators. This made temporal transfer visible, while leaving resolved-loan selection and full-sample EDA as weaknesses. {{source:notebook|EDA and ordered split — cells 12–20}} {{evidence:eda}}

## Complexity did not settle the model choice

XGBoost had a slightly higher test AUC than application logistic regression, but the paired interval included zero. The result supports keeping logistic regression as a credible simpler alternative. It does not support a story in which adding trees clearly solved the prediction problem. The combined models showed complementary ranking information, but some comparisons also changed the estimator, so the gain cannot all be assigned to extra fields. {{evidence:comparisons}}

## Calibration moved the problem rather than ending it

Platt scaling corrected validation underprediction. On test, the calibrated mean PD exceeded the observed default rate. The adjustment carried information from one cohort into a later cohort whose base rate differed. Better calibration on validation therefore became a question about transfer, not a guarantee of usable future prices. {{evidence:frozen}}

## Serving changed the information available

The browser supplies only part of the research profile. Filling 40 other fields with training defaults produces a valid input row, but changes what that row represents. The masking diagnostic lost ranking performance. This turns reduced-form validation into a separate experiment; it cannot be settled by quoting the full-feature notebook score. {{source:predictor|Preparing the model row|83-94}} {{evidence:gap}}
