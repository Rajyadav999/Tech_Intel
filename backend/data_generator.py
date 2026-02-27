"""
data_generator.py — Generates synthetic technology mention data
using Pandas and NumPy to simulate real-world ingestion.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Technologies we track
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

# Sample document snippets per technology (unstructured data)
SNIPPETS = {
    "Artificial Intelligence": [
        "New breakthroughs in deep learning architectures are reshaping enterprise AI.",
        "AI adoption in healthcare diagnostics has doubled year-over-year.",
        "Governments release new regulatory frameworks for responsible AI deployment.",
    ],
    "Blockchain": [
        "Decentralised finance protocols see unprecedented institutional investment.",
        "Supply-chain blockchain pilots move to production across manufacturing.",
        "New zero-knowledge proof standards aim to improve on-chain privacy.",
    ],
    "Quantum Computing": [
        "IBM unveils 1000-qubit processor, pushing error-correction milestones.",
        "Quantum-resistant cryptography standards move closer to NIST approval.",
        "Startups explore quantum machine-learning for drug discovery.",
    ],
    "Edge Computing": [
        "Edge AI chips bring real-time inference to IoT devices.",
        "Telecom operators deploy micro data-centres at 5G cell-tower sites.",
        "Autonomous vehicles leverage multi-access edge computing for safety.",
    ],
    "Cybersecurity": [
        "Zero-trust architectures now mandated by federal agencies.",
        "Ransomware attacks target critical infrastructure across Europe.",
        "AI-driven threat detection reduces mean-time-to-response by 60 %.",
    ],
    "5G Networks": [
        "Private 5G networks transform smart-factory automation.",
        "5G-Advanced standard promises sub-millisecond latencies.",
        "Global 5G subscriptions surpass 2 billion milestone.",
    ],
    "Augmented Reality": [
        "AR headsets gain traction in surgical training programs.",
        "Retail brands deploy AR try-on features to boost conversion.",
        "Apple Vision Pro sparks new wave of spatial computing startups.",
    ],
    "Digital Twins": [
        "Digital twin platforms reduce factory downtime by 30 %.",
        "City-scale digital twins help urban planners model traffic flow.",
        "Energy sector uses digital twins for predictive maintenance of turbines.",
    ],
    "Green Tech": [
        "Solid-state battery breakthroughs promise faster EV charging.",
        "Carbon-capture startups secure record venture-capital funding.",
        "Perovskite solar cells achieve new lab-efficiency records.",
    ],
    "Large Language Models": [
        "GPT-5 class models demonstrate advanced reasoning capabilities.",
        "Open-source LLMs close the gap with proprietary foundation models.",
        "Enterprises fine-tune LLMs on domain-specific corpora for productivity.",
    ],
}


def generate_trend_data(months: int = 24) -> pd.DataFrame:
    """
    Create a DataFrame of monthly mention counts per technology.
    Each tech follows a unique growth curve with realistic noise.
    """
    np.random.seed(42)
    base_date = datetime(2024, 1, 1)
    records = []

    for tech in TECHNOLOGIES:
        base = np.random.randint(50, 200)
        growth = np.random.uniform(0.02, 0.12)  # monthly growth rate
        for m in range(months):
            month_str = (base_date + timedelta(days=30 * m)).strftime("%Y-%m")
            trend_value = base * (1 + growth) ** m
            noise = np.random.normal(0, base * 0.10)
            mentions = max(int(trend_value + noise), 5)
            records.append({"topic": tech, "month": month_str, "mentions": mentions})

    return pd.DataFrame(records)


def generate_raw_documents(count_per_tech: int = 3) -> list[dict]:
    """
    Produce a list of mock raw-text documents to act as
    unstructured data (articles / papers / repo descriptions).
    """
    np.random.seed(42)
    documents = []
    for tech, snippets in SNIPPETS.items():
        for i in range(min(count_per_tech, len(snippets))):
            documents.append(
                {
                    "id": f"{tech.lower().replace(' ', '_')}_{i}",
                    "title": f"{tech} Update #{i+1}",
                    "source": np.random.choice(
                        ["TechCrunch", "ArXiv", "IEEE Spectrum", "Wired", "GitHub Trending"]
                    ),
                    "date": (
                        datetime(2025, 1, 1) + timedelta(days=int(np.random.uniform(0, 365)))
                    ).strftime("%Y-%m-%d"),
                    "text": snippets[i],
                    "technology": tech,
                }
            )
    return documents


if __name__ == "__main__":
    df = generate_trend_data()
    print(df.head(10))
    print(f"\nTotal trend records: {len(df)}")

    docs = generate_raw_documents()
    print(f"Total raw documents: {len(docs)}")
