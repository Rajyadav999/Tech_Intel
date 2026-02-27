"""
test_main.py — Automated tests for all backend API endpoints
and core module functions using pytest + FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient

# ── Fixtures ──────────────────────────────────────────────────

@pytest.fixture(scope="module")
def client():
    """Create a TestClient with the startup pipeline already run."""
    import sys, os
    sys.path.insert(0, os.path.dirname(__file__))
    from main import app
    with TestClient(app) as c:
        yield c


# ═══════════════════════════════════════════════════════════════
#  1. API Endpoint Tests
# ═══════════════════════════════════════════════════════════════

class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200

    def test_health_body(self, client):
        res = client.get("/api/health")
        assert res.json() == {"status": "ok"}


class TestTrendsEndpoint:
    def test_trends_returns_200(self, client):
        res = client.get("/api/trends")
        assert res.status_code == 200

    def test_trends_has_key(self, client):
        data = client.get("/api/trends").json()
        assert "trends" in data

    def test_trends_contains_topics(self, client):
        trends = client.get("/api/trends").json()["trends"]
        assert len(trends) > 0, "Should have at least one technology topic"

    def test_trends_topic_structure(self, client):
        trends = client.get("/api/trends").json()["trends"]
        topic = list(trends.values())[0]
        assert "historical" in topic
        assert "forecast" in topic
        assert "growth_rate" in topic
        assert len(topic["historical"]) > 0
        assert len(topic["forecast"]) > 0

    def test_trends_historical_point_shape(self, client):
        trends = client.get("/api/trends").json()["trends"]
        point = list(trends.values())[0]["historical"][0]
        assert "month" in point
        assert "mentions" in point
        assert isinstance(point["mentions"], int)


class TestClustersEndpoint:
    def test_clusters_returns_200(self, client):
        res = client.get("/api/clusters")
        assert res.status_code == 200

    def test_clusters_has_key(self, client):
        data = client.get("/api/clusters").json()
        assert "clusters" in data

    def test_clusters_count(self, client):
        clusters = client.get("/api/clusters").json()["clusters"]
        assert len(clusters) == 5, "Expected 5 K-Means clusters"

    def test_cluster_structure(self, client):
        cluster = client.get("/api/clusters").json()["clusters"][0]
        assert "cluster_id" in cluster
        assert "label" in cluster
        assert "keywords" in cluster
        assert "size" in cluster
        assert isinstance(cluster["keywords"], list)
        assert len(cluster["keywords"]) > 0


class TestSummaryEndpoint:
    def test_summary_returns_200(self, client):
        res = client.get("/api/summary")
        assert res.status_code == 200

    def test_summary_has_key(self, client):
        data = client.get("/api/summary").json()
        assert "summary" in data

    def test_summary_structure(self, client):
        summary = client.get("/api/summary").json()["summary"]
        assert "total_topics" in summary
        assert "total_mentions" in summary
        assert "top_rising" in summary
        assert "top_declining" in summary

    def test_summary_values(self, client):
        summary = client.get("/api/summary").json()["summary"]
        assert summary["total_topics"] == 10
        assert summary["total_mentions"] > 0
        assert len(summary["top_rising"]) == 3
        assert len(summary["top_declining"]) == 3

    def test_rising_topic_structure(self, client):
        rising = client.get("/api/summary").json()["summary"]["top_rising"][0]
        assert "topic" in rising
        assert "growth_rate" in rising


class TestDocumentsEndpoint:
    def test_documents_returns_200(self, client):
        res = client.get("/api/documents")
        assert res.status_code == 200

    def test_documents_has_key(self, client):
        data = client.get("/api/documents").json()
        assert "documents" in data

    def test_documents_count(self, client):
        docs = client.get("/api/documents").json()["documents"]
        assert len(docs) == 30, "Expected 30 documents (3 per technology × 10)"

    def test_document_structure(self, client):
        doc = client.get("/api/documents").json()["documents"][0]
        assert "id" in doc
        assert "title" in doc
        assert "source" in doc
        assert "date" in doc
        assert "text" in doc
        assert "technology" in doc


# ═══════════════════════════════════════════════════════════════
#  2. Data Generator Tests
# ═══════════════════════════════════════════════════════════════

class TestDataGenerator:
    def test_generate_trend_data_shape(self):
        import sys, os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
        from data_generator import generate_trend_data, TECHNOLOGIES
        df = generate_trend_data(months=12)
        assert len(df) == len(TECHNOLOGIES) * 12
        assert set(df.columns) == {"topic", "month", "mentions"}

    def test_generate_trend_data_no_negative(self):
        from data_generator import generate_trend_data
        df = generate_trend_data(months=24)
        assert (df["mentions"] >= 0).all(), "Mentions should never be negative"

    def test_generate_raw_documents_count(self):
        from data_generator import generate_raw_documents
        docs = generate_raw_documents(count_per_tech=3)
        assert len(docs) == 30

    def test_generate_raw_documents_fields(self):
        from data_generator import generate_raw_documents
        doc = generate_raw_documents(count_per_tech=1)[0]
        assert "id" in doc
        assert "title" in doc
        assert "text" in doc
        assert "source" in doc
        assert "technology" in doc


# ═══════════════════════════════════════════════════════════════
#  3. ML Engine Tests
# ═══════════════════════════════════════════════════════════════

class TestMLEngine:
    @pytest.fixture(scope="class")
    def sample_docs(self):
        from data_generator import generate_raw_documents
        return generate_raw_documents(count_per_tech=3)

    @pytest.fixture(scope="class")
    def sample_trends(self):
        import pandas as pd
        from data_generator import generate_trend_data
        return generate_trend_data(months=12)

    def test_cluster_documents_returns_list(self, sample_docs):
        from ml_engine import cluster_documents
        clusters = cluster_documents(sample_docs, n_clusters=5)
        assert isinstance(clusters, list)
        assert len(clusters) == 5

    def test_cluster_has_required_keys(self, sample_docs):
        from ml_engine import cluster_documents
        cluster = cluster_documents(sample_docs, n_clusters=3)[0]
        assert "cluster_id" in cluster
        assert "label" in cluster
        assert "keywords" in cluster
        assert "size" in cluster

    def test_cluster_empty_input(self):
        from ml_engine import cluster_documents
        assert cluster_documents([], n_clusters=3) == []

    def test_forecast_trends_returns_dict(self, sample_trends):
        from ml_engine import forecast_trends
        result = forecast_trends(sample_trends, forecast_months=6)
        assert isinstance(result, dict)
        assert len(result) > 0

    def test_forecast_has_required_keys(self, sample_trends):
        from ml_engine import forecast_trends
        result = forecast_trends(sample_trends, forecast_months=6)
        topic = list(result.values())[0]
        assert "historical" in topic
        assert "forecast" in topic
        assert "growth_rate" in topic

    def test_forecast_length(self, sample_trends):
        from ml_engine import forecast_trends
        result = forecast_trends(sample_trends, forecast_months=6)
        topic = list(result.values())[0]
        assert len(topic["forecast"]) == 6

    def test_forecast_no_negative_mentions(self, sample_trends):
        from ml_engine import forecast_trends
        result = forecast_trends(sample_trends, forecast_months=6)
        for t in result.values():
            for point in t["forecast"]:
                assert point["mentions"] >= 0

    def test_get_summary(self, sample_trends):
        from ml_engine import forecast_trends, get_summary
        forecasts = forecast_trends(sample_trends)
        summary = get_summary(forecasts)
        assert summary["total_topics"] > 0
        assert summary["total_mentions"] > 0
        assert len(summary["top_rising"]) <= 3
        assert len(summary["top_declining"]) <= 3
