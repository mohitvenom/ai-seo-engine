# ─────────────────────────────────────────────
# agents/description_agent.py
# ─────────────────────────────────────────────
from agents.base import call_llm

async def run_description_agent(product: str, category: str, provider: str = "openai") -> dict:
    return await call_llm(
        "You are a product description agent for e-commerce. Return ONLY valid JSON, no markdown.",
        f"""Product: {product}, Category: {category}
Return JSON: {{
  "headline": "string",
  "shortDescription": "2-3 sentence string",
  "longDescription": "4-5 sentence SEO-rich string",
  "bulletPoints": [5 feature/benefit strings],
  "cta": "string"
}}""",
        provider
    )

