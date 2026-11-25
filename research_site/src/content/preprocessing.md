## Numerical pipeline

Median imputation uses add*indicator=True. Standardisation follows. An observed value becomes $(x-\mu*{train})/s\_{train}$. Scaling gives regularised logistic inputs more comparable penalties across units. Indicators preserve missingness seen during fit. {{source:notebook|make_preprocess — cell 20, izmmPQzWbFyL}} {{evidence:pipeline}}

## Categorical pipeline

Most-frequent imputation precedes one-hot encoding. Unknown categories are ignored, giving no active known-category indicator. min_frequency=20 groups rare categories using training counts. Neither rule guarantees good representation of an unseen borrower. {{source:notebook|Categorical pipeline — cell 20}}

## Fitting boundary

Every CV pipeline learns from its fold’s training block. The final pipeline fits on training and transforms validation/test with that state. Full-data preprocessing would let later distributions influence training. Requests use the saved state; there is no online fit. {{source:predictor|Prediction|199-206}}

```python
# Verified structural summary of notebook cell 20.
num = Pipeline([("imp", SimpleImputer(strategy="median", add_indicator=True)),
                ("sc", StandardScaler())])
cat = Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                ("oh", OneHotEncoder(handle_unknown="ignore", min_frequency=20))])
```

Trees are less scale-sensitive but share this pipeline. Encoding and indicators expand inputs to 124 saved columns. Default-filled serving values appear observed, so missingness indicators do not fully reveal uncollected form fields. {{evidence:artifact}} {{evidence:gap}}
