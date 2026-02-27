"""
real_ingester.py — Fetches REAL technology data from free public APIs.
Sources: arXiv (research papers), GitHub (repos), HackerNews (tech news).
No API keys required.
"""

import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import time
import re

from data_generator import TECHNOLOGIES

# ── arXiv API ─────────────────────────────────────────────────

ARXIV_URL = "http://export.arxiv.org/api/query"

def fetch_arxiv_papers(technologies: list[str] = None, max_per_tech: int = 3) -> list[dict]:
    """
    Search arXiv for recent papers related to each technology.
    Returns documents in our standard schema.
    """
    technologies = technologies or TECHNOLOGIES
    documents = []

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
                title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
                summary = entry.find("atom:summary", ns).text.strip().replace("\n", " ")[:300]
                published = entry.find("atom:published", ns).text[:10]  # YYYY-MM-DD

                documents.append({
                    "id": f"arxiv_{tech.lower().replace(' ', '_')}_{i}",
                    "title": title,
                    "source": "arXiv",
                    "date": published,
                    "text": summary,
                    "technology": tech,
                })

            # Be polite to arXiv — 0.5s between requests
            time.sleep(0.5)

        except Exception as e:
            print(f"  ⚠ arXiv fetch failed for '{tech}': {e}")

    return documents


# ── GitHub API ────────────────────────────────────────────────

GITHUB_URL = "https://api.github.com/search/repositories"

def fetch_github_repos(technologies: list[str] = None, max_per_tech: int = 3) -> list[dict]:
    """
    Search GitHub for trending repositories related to each technology.
    Returns documents in our standard schema.
    """
    technologies = technologies or TECHNOLOGIES
    documents = []

    # GitHub search queries — map our tech names to good search terms
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
            # Only repos updated in the last 6 months
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

            items = resp.json().get("items", [])
            for i, repo in enumerate(items):
                desc = (repo.get("description") or "No description available.")[:300]
                updated = repo.get("pushed_at", "")[:10]

                documents.append({
                    "id": f"github_{tech.lower().replace(' ', '_')}_{i}",
                    "title": f"Repo: {repo['full_name']} (⭐{repo.get('stargazers_count', 0):,})",
                    "source": "GitHub Trending",
                    "date": updated,
                    "text": desc,
                    "technology": tech,
                })

            # Respect GitHub rate limiting (only 10 reqs per minute for search unauthenticated)
            time.sleep(6)

        except Exception as e:
            print(f"  ⚠ GitHub fetch failed for '{tech}': {e}")

    return documents


# ── HackerNews (Algolia) API ──────────────────────────────────

HN_URL = "https://hn.algolia.com/api/v1/search"

def fetch_hackernews_articles(technologies: list[str] = None, max_per_tech: int = 3) -> list[dict]:
    """
    Search HackerNews via the Algolia API for recent tech stories.
    Returns documents in our standard schema.
    """
    technologies = technologies or TECHNOLOGIES
    documents = []

    for tech in technologies:
        try:
            # Search stories from the last 6 months
            since_ts = int((datetime.now() - timedelta(days=180)).timestamp())
            params = {
                "query": tech,
                "tags": "story",
                "numericFilters": f"created_at_i>{since_ts}",
                "hitsPerPage": max_per_tech,
            }
            resp = requests.get(HN_URL, params=params, timeout=10)
            resp.raise_for_status()

            hits = resp.json().get("hits", [])
            for i, hit in enumerate(hits):
                title = hit.get("title", "Untitled")
                # HN stories don't always have body text; use title + URL context
                story_text = hit.get("story_text") or hit.get("comment_text") or ""
                text = (story_text[:300] if story_text
                        else f"HackerNews discussion: {title}")
                # Clean HTML tags
                text = re.sub(r'<[^>]+>', '', text)

                date_str = hit.get("created_at", "")[:10]

                documents.append({
                    "id": f"hn_{tech.lower().replace(' ', '_')}_{i}",
                    "title": title,
                    "source": "HackerNews",
                    "date": date_str,
                    "text": text,
                    "technology": tech,
                })

            time.sleep(0.3)

        except Exception as e:
            print(f"  ⚠ HackerNews fetch failed for '{tech}': {e}")

    return documents


# ── Wikipedia API (Trends) ────────────────────────────────────

WIKI_URL = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/{}/monthly/{}/{}"

def fetch_wikipedia_trends(technologies: list[str] = None, months: int = 24) -> 'pd.DataFrame':
    """
    Fetch historical Wikipedia pageviews for each technology over the last N months.
    Returns a pandas DataFrame matching the schema of our synthetic trends.
    """
    import pandas as pd
    technologies = technologies or TECHNOLOGIES
    records = []
    
    # Calculate date range
    end_date = datetime.now()
    # Approx 30.5 days per month
    start_date = end_date - timedelta(days=30 * months)
    
    start_str = start_date.strftime("%Y%m%d00")
    end_str = end_date.strftime("%Y%m%d00")

    # Map tech names to Wikipedia article titles
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

    print("📈 Fetching historical trend data from Wikipedia...")

    for tech in technologies:
        article = wiki_map.get(tech, tech.replace(' ', '_'))
        url = WIKI_URL.format(article, start_str, end_str)
        headers = {"User-Agent": "TechIntel/1.0 (https://github.com/example/techintel)"}
        
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                items = resp.json().get("items", [])
                for item in items:
                    # timestamp comes back as YYYYMMDD00 (e.g. 2024010100)
                    ts = item["timestamp"]
                    month_str = f"{ts[:4]}-{ts[4:6]}"
                    records.append({
                        "topic": tech, 
                        "month": month_str, 
                        "mentions": item["views"] // 100  # Scale down for chart readability
                    })
            else:
                print(f"  ⚠ Wikipedia fetch failed for '{tech}': HTTP {resp.status_code}")
                
            time.sleep(0.1)  # polite rate limit
        except Exception as e:
            print(f"  ⚠ Wikipedia fetch failed for '{tech}': {e}")
            
    return pd.DataFrame(records)


# ── Combined Ingester ─────────────────────────────────────────

def ingest_all(technologies: list[str] = None) -> list[dict]:
    """
    Fetch data from ALL real sources. Returns combined document list.
    Logs per-source counts. If a source fails, it is skipped gracefully.
    """
    technologies = technologies or TECHNOLOGIES
    all_docs = []

    print("📡 Fetching real data from public APIs...")

    # 1. arXiv
    print("  ↳ arXiv (research papers)...", end=" ", flush=True)
    arxiv_docs = fetch_arxiv_papers(technologies)
    print(f"✓ {len(arxiv_docs)} papers")
    all_docs.extend(arxiv_docs)

    # 2. GitHub
    print("  ↳ GitHub (trending repos)...", end=" ", flush=True)
    github_docs = fetch_github_repos(technologies)
    print(f"✓ {len(github_docs)} repos")
    all_docs.extend(github_docs)

    # 3. HackerNews
    print("  ↳ HackerNews (tech news)...", end=" ", flush=True)
    hn_docs = fetch_hackernews_articles(technologies)
    print(f"✓ {len(hn_docs)} articles")
    all_docs.extend(hn_docs)

    print(f"📊 Total real documents ingested: {len(all_docs)}")
    return all_docs


# ── CLI test ──────────────────────────────────────────────────

if __name__ == "__main__":
    docs = ingest_all()
    print(f"\nTotal documents: {len(docs)}")
    for d in docs[:5]:
        print(f"  [{d['source']}] {d['title'][:60]}... ({d['technology']})")
