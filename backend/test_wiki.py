from real_ingester import _resolve_wiki_article

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

tests = ["webAssembly", "Rust programming", "Docker containers", "React framework", "Kubernetes"]
for t in tests:
    result = _resolve_wiki_article(t, wiki_map)
    print(f"  '{t}' -> '{result}'")
