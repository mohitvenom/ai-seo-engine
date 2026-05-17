from agents.base import call_llm
from agents.fetchers import gather_keyword_data

async def run_keyword_agent(product: str, category: str, provider: str = "openai") -> dict:
    ext = await gather_keyword_data(product)
    serp, autocomplete, trends = ext["serp"], ext["autocomplete"], ext["trends"]

    context = f"""
Real Google Data for "{product}":
- Related Searches: {serp['related']}
- People Also Ask: {serp['paa']}
- Google Autocomplete Suggestions: {autocomplete}
- Trend Score (0-100): {trends['score']}
- Rising Queries: {trends['rising']}
- Top Organic Titles: {[r['title'] for r in serp['organic']]}
"""
    result = await call_llm(
        "You are a keyword research agent for e-commerce SEO. Use the provided real Google data to generate accurate, grounded keywords. Return ONLY valid JSON, no markdown.",
        f"""Product: {product}, Category: {category}

{context}

Using the real data above, return JSON:
{{
  "primary": [3 high-volume keywords],
  "secondary": [5 supporting keywords],
  "longTail": [5 long-tail phrases grounded in autocomplete/related data],
  "intent": {{
    "informational": [2 keywords],
    "transactional": [3 keywords],
    "navigational": [1 keyword]
  }},
  "voiceSearch": [3 question-format queries from PAA data]
}}""",
        provider
    )
    result["trendScore"]     = trends["score"]
    result["risingQueries"]  = trends["rising"]
    result["autoSuggestions"] = autocomplete[:5]
    result["serpRelated"]    = serp["related"][:5]
    result["paaQuestions"]   = serp["paa"]
    return result