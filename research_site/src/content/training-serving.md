## The input gap is material

The research pipeline expects 56 conceptual fields. The browser supplies 15 raw model fields, including calculated DTI. Backend loan-to-income adds one. Forty other fields use training medians or modes. Credit-history years, detailed bureau counts and balances are among the defaults. {{source:overview|Training-versus-serving warning}} {{evidence:artifact}} {{source:predictor|Row preparation|83-94}}

A valid 56-column invocation is not proof of validated reduced-input performance. Changing utilisation while balances stay typical can create inconsistent profiles. Default values also appear observed rather than missing. The fitted missingness indicators do not fully express noncollection. {{evidence:gap}}

## Diagnostic evidence

The recorded post-hoc test substitutes only the 40 uncollected features. AUC falls to approximately 0.6697 and AP to approximately 0.3379. This isolates part of the default-filling effect. It retains dataset values and missingness for collected inputs and does not simulate browser rounding, API eligibility or calculated DTI. It is not an exact product validation. {{evidence:gap}}

ECE improves in that diagnostic while ranking worsens. Probability-level fit and discrimination can move differently; better ECE does not remove the serving limitation. {{source:reproduced-metrics|Default-filling diagnostic}}

## Application type does not affect saved trees

The API validates and the preprocessor encodes application_type, but the artifact inspection finds no saved-tree split on it. This is stronger evidence than one unchanged score. The dropdown does not establish joint-underwriting capability. {{evidence:artifact}} {{source:schema|Category choices|56-63}}

## Required next validation

Evaluate the exact browser/API mapping, rounding, eligibility, defaults and DTI definition on a suitable mature cohort. Consider retraining a genuinely reduced-feature model. Compare full, masked and exact-form variants with paired uncertainty and subgroup calibration. Until then, report full-feature metrics only for the research model. {{evidence:future}}

## A more typical score can still be less useful

After default filling, mean calibrated PD moves to about 22.44%, closer to the 21.49% test event share than the full-feature mean of 24.41%. Ranking nevertheless worsens. Filling fields with typical values can improve agreement with an average without restoring the missing applicant information. That explains why lower ECE cannot rescue the reduced-form performance claim. {{source:reproduced-metrics|Mean probabilities and diagnostic ranking}} {{evidence:gap}}
