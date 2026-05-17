# ─────────────────────────────────────────────
# agents/meta_agent.py
# ─────────────────────────────────────────────
from agents.base import call_llm
from agents.fetchers import gather_meta_data

async def run_meta_agent(product: str, category: str, provider: str = "openai") -> dict:
    serp_urls_res = __import__("agents.fetchers", fromlist=["fetch_serp_data"]).fetch_serp_data(product)
    urls = [r["url"] for r in serp_urls_res.get("organic", []) if r.get("url")]
    ext = await gather_meta_data(product, urls)
    comp = ext["competitor_meta"]

    context = f"""
Competitor Meta Data for "{product}":
- Competitor Titles: {comp['titles']}
- Competitor Descriptions: {comp['descriptions']}
"""
    result = await call_llm(
        "You are a meta content SEO agent. Analyze competitor meta tags and generate superior, differentiated meta content. Return ONLY valid JSON, no markdown.",
        f"""Product: {product}, Category: {category}

{context}

Generate meta content that outperforms competitors. Return JSON:
{{
  "metaTitle": "string (max 60 chars, compelling, keyword-rich)",
  "metaDescription": "string (max 155 chars, includes CTA)",
  "slug": "url-friendly-slug",
  "ogTitle": "string",
  "ogDescription": "string"
}}""",
        provider
    )
    result["competitorTitles"] = comp["titles"]
    result["competitorDescriptions"] = comp["descriptions"]
    return result


