
# ─────────────────────────────────────────────
# agents/schema_agent.py
# ─────────────────────────────────────────────
from agents.base import call_llm

async def run_schema_agent(product: str, category: str, provider: str = "openai") -> dict:
    return await call_llm(
        "You are a schema markup agent. Return ONLY valid JSON, no markdown.",
        f"""Product: {product}, Category: {category}
Return JSON: {{
  "jsonLd": {{
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "...",
    "description": "...",
    "category": "...",
    "offers": {{
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "USD"
    }},
    "aggregateRating": {{
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "128"
    }}
  }},
  "breadcrumb": ["Home", "Category", "Product"]
}}""",
        provider
    )