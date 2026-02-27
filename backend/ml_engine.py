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

def forecast_trends(trends_df: pd.DataFrame, forecast_months: int = 6) -> dict:
    """
    For each technology topic in trends_df, fit a simple linear
    regression on monthly mentions and extrapolate forward.

    Returns a dict keyed by topic:
      { topic: { historical: [...], forecast: [...], growth_rate } }
    """
    results = {}

    for topic, group in trends_df.groupby("topic"):
        group = group.sort_values("month").reset_index(drop=True)
        # X = np.arange(len(group)).reshape(-1, 1) # Not needed for ARIMA
        y = group["mentions"].values.astype(float)

        try:
            # ARIMA order (1, 1, 1) is a common default for trended time-series
            model = ARIMA(y, order=(1, 1, 1))
            model_fit = model.fit()
            
            forecast_result = model_fit.get_forecast(steps=forecast_months)
            pred_mean = forecast_result.predicted_mean
            conf_int = forecast_result.conf_int(alpha=0.2)  # 80% confidence interval
            
            lower_bound = np.maximum(conf_int[:, 0], 0)
            upper_bound = np.maximum(conf_int[:, 1], 0)
            pred_mean = np.maximum(pred_mean, 0)
        except Exception:
            # Fallback to simple moving average if ARIMA fails to converge
            pred_mean = np.full(forecast_months, np.mean(y[-3:]))
            std_dev = np.std(y[-6:]) if len(y) >= 6 else np.std(y)
            lower_bound = np.maximum(pred_mean - std_dev, 0)
            upper_bound = pred_mean + std_dev

        # Historical fitted values
        historical = [
            {"month": row["month"], "mentions": int(row["mentions"])}
            for _, row in group.iterrows()
        ]

        # Forecast future months
        last_date = pd.Timestamp(group["month"].iloc[-1] + "-01")
        forecast = []
        for i in range(forecast_months):
            future_date = (last_date + pd.DateOffset(months=i + 1)).strftime("%Y-%m")
            forecast.append({
                "month": future_date, 
                "mentions": int(pred_mean[i]),
                "lower_bound": int(lower_bound[i]),
                "upper_bound": int(upper_bound[i])
            })

        # Annualised growth rate (using trend of last 6 months smoothing vs start of year)
        if len(y) > 12 and y[-13] > 0:
             growth_rate = round(((y[-1] / y[-13]) - 1) * 100, 1)
        elif y[0] > 0:
            growth_rate = round(((y[-1] / y[0]) - 1) * 100, 1)
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
