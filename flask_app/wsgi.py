"""Production entry point: one inference thread, no development server."""
import os

from app import app
import predictor

threads = int(os.environ.get("MODEL_THREADS", "1"))
if not 1 <= threads <= 2:
    raise ValueError("MODEL_THREADS must be 1 or 2 for this small-VM demo.")
# Runtime parallelism only: no fit and no change to serialized trees/weights.
predictor._xgb.named_steps["model"].set_params(n_jobs=threads)
