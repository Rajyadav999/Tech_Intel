"""
main.py — FastAPI server for the Tech Intelligence Platform.
Serves trend, cluster, and summary data to the frontend dashboard.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data_generator import generate_trend_data, generate_raw_documents
from ml_engine import cluster_documents, forecast_trends, get_summary
from storage import (
    init_db,
    save_trends,
    save_clusters,
    save_raw_documents,
    load_trends,
    load_clusters,
)

# ── Initialise app ────────────────────────────────────────────────

app = FastAPI(title="Tech Intelligence Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup: generate data, run ML, persist ──────────────────────

@app.on_event("startup")
def startup_pipeline():
    """Run the full data-pipeline once when the server starts."""
    # 1. Initialise storage
    init_db()

    # 2. Generate synthetic data
    trends_df = generate_trend_data(months=24)
    raw_docs = generate_raw_documents(count_per_tech=3)

    # 3. Persist raw data
    save_trends(trends_df)
    save_raw_documents(raw_docs)

    # 4. Run ML pipeline
    clusters = cluster_documents(raw_docs, n_clusters=5)
    save_clusters(clusters)

    print("✅ Pipeline complete — data generated, ML models run, results stored.")


# ── API Endpoints ─────────────────────────────────────────────────

# Cache forecast results at module level after first request
_forecast_cache: dict | None = None


def _get_forecasts():
    global _forecast_cache
    if _forecast_cache is None:
        import pandas as pd
        trends = load_trends()
        df = pd.DataFrame(trends)
        _forecast_cache = forecast_trends(df, forecast_months=6)
    return _forecast_cache


@app.get("/api/trends")
def get_trends():
    """
    Return historical + forecasted trend data for every technology.
    """
    forecasts = _get_forecasts()
    return {"trends": forecasts}


@app.get("/api/clusters")
def get_clusters():
    """
    Return NLP topic clusters with keywords and sizes.
    """
    clusters = load_clusters()
    return {"clusters": clusters}


@app.get("/api/summary")
def get_summary_endpoint():
    """
    Return decision-ready summary metrics.
    """
    forecasts = _get_forecasts()
    summary = get_summary(forecasts)
    return {"summary": summary}


@app.get("/api/documents")
def get_documents():
    """
    Return the raw text documents from unstructured storage.
    """
    from storage import load_raw_documents
    docs = load_raw_documents()
    return {"documents": docs}


# ── Health check ──────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}
