"""
ml_engine.py — NLP Topic Clustering & Time-Series Forecasting
using Scikit-learn, Pandas, and NumPy.
"""

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from statsmodels.tsa.arima.model import ARIMA
import warnings
from statsmodels.tools.sm_exceptions import ConvergenceWarning

warnings.simplefilter('ignore', ConvergenceWarning)
warnings.filterwarnings("ignore")


# ── NLP Topic Clustering ──────────────────────────────────────────

def cluster_documents(documents: list[dict], n_clusters: int = 5) -> list[dict]:
    """
    Takes raw documents, vectorises their text with TF-IDF,
    then applies K-Means to group them into topic clusters.

    Returns a list of cluster dicts:
      { cluster_id, label, keywords, size }
    """
    if not documents:
        return []

    texts = [doc["text"] for doc in documents]

    # TF-IDF Vectorisation
    vectorizer = TfidfVectorizer(max_features=500, stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(texts)
    feature_names = vectorizer.get_feature_names_out()

    # K-Means Clustering
    n_clusters = min(n_clusters, len(texts))
    km = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    km.fit(tfidf_matrix)

    # Extract top keywords per cluster
    clusters = []
    order_centroids = km.cluster_centers_.argsort()[:, ::-1]
    for i in range(n_clusters):
        top_keywords = [str(feature_names[idx]) for idx in order_centroids[i, :6]]
        # Count docs in this cluster
        member_count = int(np.sum(km.labels_ == i))
        # Build a readable label from the top 2 keywords
        label = " & ".join(top_keywords[:2]).title()
        clusters.append(
            {
                "cluster_id": i,
                "label": label,
                "keywords": top_keywords,
                "size": member_count,
            }
        )

    return clusters


# ── Time-Series Forecasting ──────────────────────────────────────

def _best_arima(y: np.ndarray, forecast_months: int):
    """
    Try a small grid of ARIMA(p,d,q) orders and pick the one with the lowest AIC.
    Candidates: p in [0,1,2], d in [0,1], q in [0,1,2].
    Falls back to a 3-month moving-average flat forecast if all models fail.
    """
    best_aic = float("inf")
    best_result = None

    for p in (2, 1, 0):
        for d in (1, 0):
            for q in (2, 1, 0):
                try:
                    m = ARIMA(y, order=(p, d, q))
                    fit = m.fit()
                    if fit.aic < best_aic:
                        best_aic = fit.aic
                        best_result = fit
                except Exception:
                    continue

    if best_result is not None:
        fc = best_result.get_forecast(steps=forecast_months)
        pred = np.maximum(fc.predicted_mean, 0)
        ci = fc.conf_int(alpha=0.2)
        lo = np.maximum(ci[:, 0], 0)
        hi = np.maximum(ci[:, 1], 0)
        return pred, lo, hi

    # Hard fallback: flat forecast at recent mean
    flat = np.full(forecast_months, max(np.mean(y[-3:]), 0))
    std = np.std(y[-6:]) if len(y) >= 6 else np.std(y)
    return flat, np.maximum(flat - std, 0), flat + std


def forecast_trends(trends_df: pd.DataFrame, forecast_months: int = 6) -> dict:
    """
    For each technology topic in trends_df:
      1. Apply a 3-month rolling average to smooth noise.
      2. Fit ARIMA with automatic order selection (lowest AIC).
      3. Compute a momentum-weighted growth rate from the last 6 months.

    Returns a dict keyed by topic:
      { topic: { historical: [...], forecast: [...], growth_rate } }
    """
    results = {}

    for topic, group in trends_df.groupby("topic"):
        group = group.sort_values("month").reset_index(drop=True)
        raw_y = group["mentions"].values.astype(float)

        # ── 1. Smooth with 3-month centred rolling average ──────────
        series = pd.Series(raw_y)
        smoothed = series.rolling(window=3, min_periods=1, center=True).mean().values

        # ── 2. Fit best ARIMA via AIC grid search ───────────────────
        pred_mean, lower_bound, upper_bound = _best_arima(smoothed, forecast_months)

        # ── 3. Build historical output (raw values, unsmoothed) ─────
        historical = [
            {"month": row["month"], "mentions": int(row["mentions"])}
            for _, row in group.iterrows()
        ]

        # ── 4. Build forecast output ─────────────────────────────────
        last_date = pd.Timestamp(group["month"].iloc[-1] + "-01")
        forecast = []
        for i in range(forecast_months):
            future_date = (last_date + pd.DateOffset(months=i + 1)).strftime("%Y-%m")
            forecast.append({
                "month": future_date,
                "mentions": int(pred_mean[i]),
                "lower_bound": int(lower_bound[i]),
                "upper_bound": int(upper_bound[i]),
            })

        # ── 5. Momentum-weighted growth rate ─────────────────────────
        # Use the smoothed series for more stable growth calculation.
        # Weights: recent months count more (linear ramp over last 6 months).
        n = min(6, len(smoothed))
        recent = smoothed[-n:]
        baseline = np.mean(smoothed[: max(1, len(smoothed) - n)])
        if baseline > 0:
            weights = np.linspace(0.5, 1.0, n)
            weighted_recent = np.average(recent, weights=weights)
            growth_rate = round(((weighted_recent / baseline) - 1) * 100, 1)
        else:
            growth_rate = 0.0

        results[topic] = {
            "historical": historical,
            "forecast": forecast,
            "growth_rate": growth_rate,
        }

    return results


def get_summary(forecast_results: dict) -> dict:
    """
    Build decision-ready summary metrics from the forecast results.
    """
    growth_rates = {t: v["growth_rate"] for t, v in forecast_results.items()}
    sorted_topics = sorted(growth_rates.items(), key=lambda x: x[1], reverse=True)

    top_rising = sorted_topics[:3]
    top_declining = sorted_topics[-3:]

    total_mentions = sum(
        sum(p["mentions"] for p in v["historical"])
        for v in forecast_results.values()
    )

    return {
        "total_topics": len(forecast_results),
        "total_mentions": total_mentions,
        "top_rising": [{"topic": t, "growth_rate": g} for t, g in top_rising],
        "top_declining": [{"topic": t, "growth_rate": g} for t, g in top_declining],
    }
