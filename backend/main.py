"""
main.py — FastAPI server for the Tech Intelligence Platform.
Serves trend, cluster, and summary data to the frontend dashboard.
"""
import json
import logging
import asyncio
from dotenv import load_dotenv

# Load environment variables (e.g., GEMINI_API_KEY)
load_dotenv()

from fastapi import FastAPI, BackgroundTasks
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
    load_raw_documents,
)
from real_ingester import ingest_all, fetch_wikipedia_trends
from ai_summarizer import generate_brief

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

    # 2. Fetch or generate raw documents
    try:
        raw_docs = ingest_all()
        if not raw_docs:
            raise ValueError("No documents returned from APIs.")
        print(f"✅ Successfully ingested {len(raw_docs)} real documents from public APIs.")
    except Exception as e:
        print(f"⚠ Real API ingestion failed ({e}). Falling back to synthetic data generator...")
        raw_docs = generate_raw_documents(count_per_tech=3)

    # Note: Trend data remains synthetic as live historical multi-year scraping requires complex APIs
    try:
        trends_df = fetch_wikipedia_trends(months=24)
        print(f"✅ Successfully fetched historical Wikipedia pageviews for {len(trends_df['topic'].unique())} topics.")
    except Exception as e:
        print(f"⚠ Wikipedia trend fetch failed ({e}). Falling back to synthetic trend generator...")
        trends_df = generate_trend_data(months=24)

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
def get_documents_api(limit: int = 100):
    """
    Return the raw text documents from unstructured storage, with an optional limit.
    """
    docs = load_raw_documents()
    return {"documents": docs[:limit]}


@app.get("/api/brief/{technology}")
def get_brief_api(technology: str):
    """
    Generate an AI executive brief for a specific technology on demand.
    """
    docs = load_raw_documents()
    # Filter documents relevant to the requested technology
    tech_docs = [d for d in docs if d.get("technology") == technology]
    
    brief = generate_brief(technology, tech_docs)
    return {"technology": technology, "brief": brief}


# ── Health check ──────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}
