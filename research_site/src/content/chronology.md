## An ordered record, not invented dates

The notebook gives an order of work, not dates for each intermediate experiment. The ledger uses stages. Deployment dates come only from {{source:deployment-log|Deployment record}}. Undocumented trial runs and rejected parameter settings cannot be reconstructed. {{evidence:comparisons}}

## How evidence changed decisions

The first question was whether application information could rank risk. Leakage groups separated that information from LC pricing and later outcomes. EDA exposed drift and missingness. The response was elapsed-history and burden features, an ordered split, baselines, tuned XGBoost, paired comparisons, calibration, operating points and pricing back-tests. {{source:notebook|Notebook — cells 0–35}}

Final choices were not inevitable. Logistic remained close to XGBoost. Calibration corrected validation underprediction but overpredicted on test. Combined features had stronger ranking evidence, yet those models were not exported. {{evidence:test-table}}

## Audits and corrections

The defense audit separated frozen reproduction from saved comparisons, identified default-filled serving inputs, clarified gross interest and separated recall-selected cutoffs from application policy. Backend loan-to-income is recomputed after merging current inputs. The optional notebook demo does not do this and is not the current serving path. {{source:defense|Leakage and training-serving audit}} {{source:predictor|Feature preparation|83-94}}

The mobile candidate did not activate because VM memory failed preflight. Recovery instructions were supplied; recovery success is unconfirmed. This is an operational uncertainty, not failed training. {{evidence:vm}}
