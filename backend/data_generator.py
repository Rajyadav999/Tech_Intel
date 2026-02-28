from datetime import datetime
import random
import pandas as pd

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

def generate_trend_data(months: int = 24) -> pd.DataFrame:
    rows = []
    months_idx = pd.date_range(end=datetime.now(), periods=months, freq="MS")
    for tech in TECHNOLOGIES:
        base = random.randint(30, 90)
        slope = random.uniform(-0.5, 2.0)
        for i, dt in enumerate(months_idx):
            mentions = max(5, int(base + slope * i + random.randint(-8, 8)))
            rows.append({"topic": tech, "month": dt.strftime("%Y-%m"), "mentions": mentions})
    return pd.DataFrame(rows, columns=["topic", "month", "mentions"])

def generate_raw_documents(count_per_tech: int = 3) -> list[dict]:
    today = datetime.now().strftime("%Y-%m-%d")
    docs = []
    for tech in TECHNOLOGIES:
        for i in range(count_per_tech):
            docs.append({
                "id": f"synthetic_{tech.lower().replace(' ', '_')}_{i}",
                "title": f"{tech} update #{i+1}",
                "source": "Synthetic",
                "date": today,
                "text": f"Synthetic fallback document for {tech}.",
                "technology": tech,
            })
    return docs