import os, asyncio, requests
from bs4 import BeautifulSoup
from pytrends.request import TrendReq
from dotenv import load_dotenv

load_dotenv()

SERP_KEY    = os.getenv("SERPAPI_KEY")
SCRAPER_KEY = os.getenv("SCRAPERAPI_KEY")

def fetch_serp_data(query: str) -> dict:
    try:
        res = requests.get("https://serpapi.com/search", params={
            "q": query, "api_key": SERP_KEY,
            "engine": "google", "num": 5, "hl": "en", "gl": "us"
        }, timeout=10)
        data = res.json()
        related = [r.get("query", "") for r in data.get("related_searches", [])][:8]
        paa     = [q.get("question", "") for q in data.get("related_questions", [])][:5]
        organic = [
            {"title": r.get("title", ""), "description": r.get("snippet", ""), "url": r.get("link", "")}
            for r in data.get("organic_results", [])[:5]
        ]
        return {"related": related, "paa": paa, "organic": organic}
    except Exception as e:
        print(f"SerpAPI error: {e}")
        return {"related": [], "paa": [], "organic": []}

def fetch_autocomplete(query: str) -> list:
    try:
        res = requests.get("https://suggestqueries.google.com/complete/search",
            params={"client": "firefox", "q": query}, timeout=5)
        return res.json()[1][:10]
    except Exception as e:
        print(f"Autocomplete error: {e}")
        return []

def fetch_trends(query: str) -> dict:
    try:
        import time
        time.sleep(2)  # avoid rate limiting
        pt = TrendReq(hl="en-US", tz=360, timeout=(10, 25), retries=2, backoff_factor=0.5)
        pt.build_payload([query], timeframe="today 3-m")
        interest = pt.interest_over_time()
        score = round(float(interest[query].mean()), 1) if not interest.empty else 0.0
        related = pt.related_queries()
        rising = []
        if query in related and related[query]["rising"] is not None:
            rising = related[query]["rising"]["query"].tolist()[:5]
        return {"score": score, "rising": rising}
    except Exception as e:
        print(f"pytrends error: {e}")
        return {"score": 0.0, "rising": []}

def fetch_competitor_meta(urls: list) -> dict:
    titles, descs = [], []
    for url in urls[:3]:
        try:
            scraped = requests.get("http://api.scraperapi.com", params={
                "api_key": SCRAPER_KEY, "url": url
            }, timeout=15)
            soup = BeautifulSoup(scraped.text, "html.parser")
            t = soup.find("meta", attrs={"name": "title"}) or soup.find("title")
            d = soup.find("meta", attrs={"name": "description"})
            if t: titles.append(t.get("content", "") or t.get_text())
            if d: descs.append(d.get("content", ""))
        except Exception as e:
            print(f"ScraperAPI error for {url}: {e}")
    return {"titles": titles, "descriptions": descs}

async def gather_keyword_data(product: str) -> dict:
    from database import get_cached_trends, save_trends_cache

    loop = asyncio.get_event_loop()

    # Check MongoDB cache first before calling pytrends
    cached = await get_cached_trends(product)
    if cached:
        trends = cached
        serp, autocomplete = await asyncio.gather(
            loop.run_in_executor(None, fetch_serp_data, product),
            loop.run_in_executor(None, fetch_autocomplete, product),
        )
    else:
        serp, autocomplete, trends = await asyncio.gather(
            loop.run_in_executor(None, fetch_serp_data, product),
            loop.run_in_executor(None, fetch_autocomplete, product),
            loop.run_in_executor(None, fetch_trends, product),
        )
        # Save to cache only if we got real data
        if trends["score"] > 0 or trends["rising"]:
            await save_trends_cache(product, trends["score"], trends["rising"])

    return {"serp": serp, "autocomplete": autocomplete, "trends": trends}

async def gather_meta_data(product: str, urls: list) -> dict:
    loop = asyncio.get_event_loop()
    competitor_meta = await loop.run_in_executor(None, fetch_competitor_meta, urls)
    return {"competitor_meta": competitor_meta}
    