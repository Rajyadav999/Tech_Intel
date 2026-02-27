"""
ai_summarizer.py — Generates executive briefs using the Groq API (Llama 3).
"""
import os
from groq import Groq

def generate_brief(technology: str, documents: list[dict]) -> str:
    """
    Given a technology topic and a list of related documents,
    use the Groq API to write a 1-paragraph executive brief.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return f"**API Key Required:** To generate an AI summary for {technology}, please set the `GROQ_API_KEY` environment variable."

    try:
        client = Groq(api_key=api_key)
        
        # Filter documents for this technology
        tech_docs = [d for d in documents if d.get("technology") == technology]
        
        if not tech_docs:
            return f"Not enough recent data available to generate a confident executive brief for {technology} at this time."

        # Compile document text for context (limit to recent/top 5 to save tokens)
        context_text = ""
        for i, doc in enumerate(tech_docs[:5]):
            context_text += f"\n--- Source {i+1}: {doc.get('source')} ---\nTitle: {doc.get('title')}\nSummary: {doc.get('text')}\n"

        system_prompt = "You are an expert Chief Technology Officer writing an executive brief for your board of directors. Write a single, highly professional, analytical paragraph summarizing the current landscape based on the provided context. Rules: 1. Write ONLY one paragraph (4-6 sentences max). 2. Do not use bullet points. 3. Be analytical and authoritative."
        
        user_prompt = f"Technology: {technology}\n\nContext:\n{context_text}"

        # Call the blazing fast Llama 3.1 8B model via Groq
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=256,
        )
        
        return chat_completion.choices[0].message.content.strip()
        
    except Exception as e:
        return f"**Generation Failed:** Could not generate executive brief. Error: {str(e)}"

# Quick manual test
if __name__ == "__main__":
    from storage import load_raw_documents
    docs = load_raw_documents()
    print("Testing Artificial Intelligence summarizer with Groq...")
    print(generate_brief("Artificial Intelligence", docs))
