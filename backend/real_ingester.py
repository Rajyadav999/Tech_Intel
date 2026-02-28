
"""
real_ingester.py - Fetches real technology data from free public APIs.
Sources: arXiv (research papers), GitHub (repos), HackerNews (tech news).
No API keys required.
"""

import re
import time
import xml.etree.ElementTree as ET
from collections.abc import Sequence
from datetime import datetime, timedelta
from typing import Any

import pandas as pd
import requests



# -- arXiv API ----------------------------------------------------

ARXIV_URL = "http://export.arxiv.org/api/query"



TECHNOLOGIES = [
    "Artificial Intelligence",
    "Blockchain",
    "Quantum Computing",
    "Edge Computing",
    "Cybersecurity",
    "5G Networks",
    "Augmented Reality",
    "Digital Twins",
    "Green Tech",
    "Large Language Models",
]

def _resolve_technologies(technologies: list[str] | None) -> list[str]:
    if technologies is None:
        return TECHNOLOGIES.copy()
    return [t for t in technologies if isinstance(t, str) and t.strip()]

def _safe_text(value: str | None) -> str:
    if not isinstance(value, str):
        return ""
    return value.strip().replace("\n", " ")


def _safe_element_text(element: ET.Element | None) -> str:
    if element is None:
        return ""
    return _safe_text(element.text)


def _safe_date_prefix(value: str | None, length: int = 10) -> str:
    if not isinstance(value, str):
        return ""
    return value[:length]


def fetch_arxiv_papers(technologies: list[str] | None = None, max_per_tech: int = 3) -> list[dict[str, Any]]:
    """
    Search arXiv for recent papers related to each technology.
    Returns documents in our standard schema.
    """
    technologies = _resolve_technologies(technologies)
    documents: list[dict[str, Any]] = []

    for tech in technologies:
        try:
            params = {
                "search_query": f'all:"{tech}"',
                "start": 0,
                "max_results": max_per_tech,
                "sortBy": "submittedDate",
                "sortOrder": "descending",
            }
            resp = requests.get(ARXIV_URL, params=params, timeout=10)
            resp.raise_for_status()

            root = ET.fromstring(resp.text)
            ns = {"atom": "http://www.w3.org/2005/Atom"}

            for i, entry in enumerate(root.findall("atom:entry", ns)):
                title_el = entry.find("atom:title", ns)
                summary_el = entry.find("atom:summary", ns)
                published_el = entry.find("atom:published", ns)

                title = _safe_element_text(title_el)
                summary = _safe_element_text(summary_el)[:300]
                published = _safe_date_prefix(published_el.text if published_el is not None else None)

                documents.append(
                    {
                        "id": f"arxiv_{tech.lower().replace(' ', '_')}_{i}",
                        "title": title,
                        "source": "arXiv",
                        "date": published,
                        "text": summary,
                        "technology": tech,
                    }
                )

            time.sleep(0.5)

        except Exception as e:
            print(f"  [WARN] arXiv fetch failed for '{tech}': {e}")

    return documents


# -- GitHub API ---------------------------------------------------

GITHUB_URL = "https://api.github.com/search/repositories"


def fetch_github_repos(technologies: list[str] | None = None, max_per_tech: int = 3) -> list[dict[str, Any]]:
    """
    Search GitHub for trending repositories related to each technology.
    Returns documents in our standard schema.
    """
    technologies = _resolve_technologies(technologies)
    documents: list[dict[str, Any]] = []

    query_map = {
        "Artificial Intelligence": "artificial intelligence",
        "Blockchain": "blockchain",
        "Quantum Computing": "quantum computing",
        "Edge Computing": "edge computing",
        "Cybersecurity": "cybersecurity",
        "5G Networks": "5G network",
        "Augmented Reality": "augmented reality",
        "Digital Twins": "digital twin",
        "Green Tech": "green technology OR clean energy",
        "Large Language Models": "large language model OR LLM",
    }

    for tech in technologies:
        try:
            query = query_map.get(tech, tech)
            since_date = (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d")
            params = {
                "q": f"{query} pushed:>{since_date}",
                "sort": "stars",
                "order": "desc",
                "per_page": max_per_tech,
            }
            headers = {"Accept": "application/vnd.github.v3+json"}
            resp = requests.get(GITHUB_URL, params=params, headers=headers, timeout=10)
            resp.raise_for_status()

            payload = resp.json()
            items = payload.get("items", []) if isinstance(payload, dict) else []
            if not isinstance(items, list):
                items = []

            for i, repo in enumerate(items):
                if not isinstance(repo, dict):
                    continue

                full_name = str(repo.get("full_name") or "unknown/unknown")
                description = repo.get("description")
                desc = (description if isinstance(description, str) else "No description available.")[:300]

                pushed_at = repo.get("pushed_at")
                updated = _safe_date_prefix(pushed_at if isinstance(pushed_at, str) else None)

                stars_raw = repo.get("stargazers_count", 0)
                try:
                    stars = int(stars_raw)
                except (TypeError, ValueError):
                    stars = 0

                documents.append(
                    {
                        "id": f"github_{tech.lower().replace(' ', '_')}_{i}",
                        "title": f"Repo: {full_name} (star {stars:,})",
                        "source": "GitHub Trending",
                        "date": updated,
                        "text": desc,
                        "technology": tech,
                    }
                )

            time.sleep(6)

        except Exception as e:
            print(f"  [WARN] GitHub fetch failed for '{tech}': {e}")

    return documents


# -- HackerNews (Algolia) API ------------------------------------

HN_URL = "https://hn.algolia.com/api/v1/search"


def fetch_hackernews_articles(technologies: list[str] | None = None, max_per_tech: int = 3) -> list[dict[str, Any]]:
    """
    Search HackerNews via the Algolia API for recent tech stories.
    Returns documents in our standard schema.
    """
    technologies = _resolve_technologies(technologies)
    documents: list[dict[str, Any]] = []

    for tech in technologies:
        try:
            since_ts = int((datetime.now() - timedelta(days=180)).timestamp())
            params = {
                "query": tech,
                "tags": "story",
                "numericFilters": f"created_at_i>{since_ts}",
                "hitsPerPage": max_per_tech,
            }
            resp = requests.get(HN_URL, params=params, timeout=10)
            resp.raise_for_status()

            payload = resp.json()
            hits = payload.get("hits", []) if isinstance(payload, dict) else []
            if not isinstance(hits, list):
                hits = []

            for i, hit in enumerate(hits):
                if not isinstance(hit, dict):
                    continue

                title_raw = hit.get("title")
                title = title_raw if isinstance(title_raw, str) and title_raw.strip() else "Untitled"

                story_text_raw = hit.get("story_text")
                comment_text_raw = hit.get("comment_text")
                story_text = story_text_raw if isinstance(story_text_raw, str) else (
                    comment_text_raw if isinstance(comment_text_raw, str) else ""
                )

                text = story_text[:300] if story_text else f"HackerNews discussion: {title}"
                text = re.sub(r"<[^>]+>", "", text)

                created_at = hit.get("created_at")
                date_str = _safe_date_prefix(created_at if isinstance(created_at, str) else None)

                documents.append(
                    {
                        "id": f"hn_{tech.lower().replace(' ', '_')}_{i}",
                        "title": title,
                        "source": "HackerNews",
                        "date": date_str,
                        "text": text,
                        "technology": tech,
                    }
                )

            time.sleep(0.3)

        except Exception as e:
            print(f"  [WARN] HackerNews fetch failed for '{tech}': {e}")

    return documents


# -- Wikipedia API (Trends) --------------------------------------

WIKI_URL = (
    "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
    "en.wikipedia/all-access/all-agents/{}/monthly/{}/{}"
)


def fetch_wikipedia_trends(technologies: list[str] | None = None, months: int = 24) -> pd.DataFrame:
    """
    Fetch historical Wikipedia pageviews for each technology over the last N months.
    Returns a pandas DataFrame matching the schema of our synthetic trends.
    """
    technologies = _resolve_technologies(technologies)
    records: list[dict[str, Any]] = []

    end_date = datetime.now()
    start_date = end_date - timedelta(days=30 * months)

    start_str = start_date.strftime("%Y%m%d00")
    end_str = end_date.strftime("%Y%m%d00")

    wiki_map = {
        "Artificial Intelligence": "Artificial_intelligence",
        "Blockchain": "Blockchain",
        "Quantum Computing": "Quantum_computing",
        "Edge Computing": "Edge_computing",
        "Cybersecurity": "Computer_security",
        "5G Networks": "5G",
        "Augmented Reality": "Augmented_reality",
        "Digital Twins": "Digital_twin",
        "Green Tech": "Environmental_technology",
        "Large Language Models": "Large_language_model",
    }

    print("[INFO] Fetching historical trend data from Wikipedia...")

    for tech in technologies:
        article = wiki_map.get(tech, tech.replace(" ", "_"))
        url = WIKI_URL.format(article, start_str, end_str)
        headers = {"User-Agent": "TechIntel/1.0 (https://github.com/example/techintel)"}

        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                payload = resp.json()
                items = payload.get("items", []) if isinstance(payload, dict) else []
                if not isinstance(items, list):
                    items = []

                for item in items:
                    if not isinstance(item, dict):
                        continue

                    ts = item.get("timestamp")
                    if not isinstance(ts, str) or len(ts) < 6:
                        continue

                    views_raw = item.get("views", 0)
                    try:
                        views = int(views_raw)
                    except (TypeError, ValueError):
                        views = 0

                    month_str = f"{ts[:4]}-{ts[4:6]}"
                    records.append(
                        {
                            "topic": tech,
                            "month": month_str,
                            "mentions": views // 100,
                        }
                    )
            else:
                print(f"  [WARN] Wikipedia fetch failed for '{tech}': HTTP {resp.status_code}")

            time.sleep(0.1)
        except Exception as e:
            print(f"  [WARN] Wikipedia fetch failed for '{tech}': {e}")

    return pd.DataFrame(records, columns=["topic", "month", "mentions"])


# -- Single Source Search ----------------------------------------

def search_all_sources(technology: str) -> dict[str, Any]:
    """
    Search all public APIs for a single technology.
    Returns standard documents and a pandas DataFrame for trends.
    """
    tech_list = [technology]
    docs: list[dict[str, Any]] = []

    print(f"[INFO] Searching real data APIs for '{technology}'...")

    try:
        docs.extend(fetch_arxiv_papers(tech_list, max_per_tech=5))
    except Exception as e:
        print(f"  [WARN] arXiv error: {e}")

    try:
        docs.extend(fetch_github_repos(tech_list, max_per_tech=3))
    except Exception as e:
        print(f"  [WARN] GitHub error: {e}")

    try:
        docs.extend(fetch_hackernews_articles(tech_list, max_per_tech=5))
    except Exception as e:
        print(f"  [WARN] HackerNews error: {e}")

    try:
        trends_df = fetch_wikipedia_trends(tech_list, months=24)
    except Exception as e:
        print(f"  [WARN] Wikipedia error: {e}")
        trends_df = pd.DataFrame(columns=["topic", "month", "mentions"])

    return {
        "documents": docs,
        "trends_df": trends_df,
    }


# -- Combined Ingester -------------------------------------------

def ingest_all(technologies: list[str] | None = None) -> list[dict[str, Any]]:
    """
    Fetch data from all real sources. Returns combined document list.
    Logs per-source counts. If a source fails, it is skipped gracefully.
    """
    technologies = _resolve_technologies(technologies)
    all_docs: list[dict[str, Any]] = []

    print("[INFO] Fetching real data from public APIs...")

    print("  -> arXiv (research papers)...", end=" ", flush=True)
    arxiv_docs = fetch_arxiv_papers(technologies)
    print(f"ok ({len(arxiv_docs)} papers)")
    all_docs.extend(arxiv_docs)

    print("  -> GitHub (trending repos)...", end=" ", flush=True)
    github_docs = fetch_github_repos(technologies)
    print(f"ok ({len(github_docs)} repos)")
    all_docs.extend(github_docs)

    print("  -> HackerNews (tech news)...", end=" ", flush=True)
    hn_docs = fetch_hackernews_articles(technologies)
    print(f"ok ({len(hn_docs)} articles)")
    all_docs.extend(hn_docs)

    print(f"[INFO] Total real documents ingested: {len(all_docs)}")
    return all_docs


# -- CLI test -----------------------------------------------------

if __name__ == "__main__":
    docs = ingest_all()
    print(f"\nTotal documents: {len(docs)}")
    for d in docs[:5]:
        print(f"  [{d['source']}] {d['title'][:60]}... ({d['technology']})")
