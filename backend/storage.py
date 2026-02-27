"""
storage.py — Structured (SQLite) & Unstructured (JSON) data stores
for the Tech Intelligence Platform.
"""

import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "tech_intel.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "raw_documents.json")


# ── Structured Store (SQLite) ──────────────────────────────────────

def init_db():
    """Create the SQLite tables if they don't already exist."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS topic_trends (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            topic     TEXT    NOT NULL,
            month     TEXT    NOT NULL,
            mentions  INTEGER NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS topic_clusters (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            cluster_id INTEGER NOT NULL,
            label      TEXT    NOT NULL,
            keywords   TEXT    NOT NULL,
            size       INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def save_trends(trends_df):
    """Persist a Pandas DataFrame of trends into SQLite."""
    conn = sqlite3.connect(DB_PATH)
    trends_df.to_sql("topic_trends", conn, if_exists="replace", index=False)
    conn.commit()
    conn.close()


def save_clusters(clusters):
    """Persist a list of cluster dicts into SQLite."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DELETE FROM topic_clusters")
    for c in clusters:
        cur.execute(
            "INSERT INTO topic_clusters (cluster_id, label, keywords, size) VALUES (?,?,?,?)",
            (c["cluster_id"], c["label"], json.dumps(c["keywords"]), c["size"]),
        )
    conn.commit()
    conn.close()


def load_trends():
    """Read all trend rows back as a list of dicts."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT topic, month, mentions FROM topic_trends ORDER BY month")
    rows = cur.fetchall()
    conn.close()
    return [{"topic": r[0], "month": r[1], "mentions": r[2]} for r in rows]


def load_clusters():
    """Read all cluster rows back as a list of dicts."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT cluster_id, label, keywords, size FROM topic_clusters")
    rows = cur.fetchall()
    conn.close()
    return [
        {"cluster_id": r[0], "label": r[1], "keywords": json.loads(r[2]), "size": r[3]}
        for r in rows
    ]


# ── Unstructured Store (JSON) ─────────────────────────────────────

def save_raw_documents(documents: list[dict]):
    """Save raw text documents to a JSON file."""
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(documents, f, indent=2)


def load_raw_documents() -> list[dict]:
    """Load raw text documents from the JSON file."""
    if not os.path.exists(JSON_PATH):
        return []
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)
