## Validation-fitted Platt scaling

Raw XGBoost probabilities underpredict validation prevalence. The notebook clips raw probabilities to [0.000001, 0.999999], converts them to log-odds and fits logistic regression on validation labels. Test probabilities use this fitted calibrator without refitting. {{source:notebook|Calibration — cell 28, Mqca_6m_bFyL}}

$$z=\log\frac{p_{raw}}{1-p_{raw}},\qquad p_{cal}=\sigma(az+b)$$

The recorded artifact slope is 1.0082408439407422 and intercept 0.4468379346696358. These apply to the raw score, not individual borrower fields. The positive slope preserves ranking except possible clipping/tie effects. {{evidence:artifact}}

## Reproduced result

The recorded frozen full-feature test AUC is about 0.6828, AP 0.3601 and top-decile lift 2.0732. Test ECE improves from 0.03627689777711006 to 0.03179226320135342. Brier improves only slightly, from 0.1582757158575552 to 0.1582712675778958; rounding to four decimals hides the change. {{evidence:frozen}}

Mean calibrated PD is 24.412539420159954%, above observed 21.487859266600595%. Raw mean PD is 17.86016970872879%. Calibration moves the probability level but does not solve later-cohort drift. {{source:reproduced-metrics|Test mean PD and observed rate}}

## Reliability by decile

The saved highest decile predicts 53.3% against 44.5% observed. Lower bins also show local gaps. Deciles reveal where the average misses, but are coarse and can hide subgroup differences. The original decile table is below. {{source:notebook|Reliability — cell 28}} {{evidence:test-table}}

## Deployment implication

A validation period with a 25.03% base rate differs from test at 21.49%. Recalibration needs mature outcomes from the deployed population, a separate evaluation window and monitoring. No automatic deployment recalibration is implemented. Fitting to the live applicant stream without outcomes would not validate probabilities. {{evidence:future}}
