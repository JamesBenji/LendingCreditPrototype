## Numerical pipeline

Median imputation adds missingness indicators, then standardisation puts numeric inputs on training-fitted scales:

$$x_{scaled}=\frac{x-\mu_{train}}{s_{train}}$$

The mean and standard deviation are learned from the training data. This gives regularised logistic inputs more comparable penalties across units. Indicators preserve missingness seen during fit. {{source:notebook|make_preprocess — cell 20, izmmPQzWbFyL}} {{evidence:pipeline}}

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

## Default filling bypasses the meaning of missingness

The research pipeline can distinguish a genuinely missing value from an observed value because the imputer adds indicators. The API instead fills uncollected fields with training defaults before the pipeline sees them. A default-filled balance then looks observed, even though no applicant supplied it. This can erase information about noncollection while creating a financially inconsistent profile. Correct preprocessing dimensions do not resolve that problem. {{source:predictor|Defaults merged before prediction|83-94}} {{evidence:gap}}
