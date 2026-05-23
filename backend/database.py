import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

# Create async MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)

# Database
db = client["seo_engine"]

# Collections
pipeline_collection = db["pipeline_results"]


async def save_pipeline_result(product: str, category: str, provider: str, result: dict) -> str:
    """Save a pipeline run result to MongoDB"""
    from datetime import datetime
    doc = {
        "product": product,
        "category": category,
        "provider": provider,
        "result": result,
        "createdAt": datetime.utcnow()
    }
    res = await pipeline_collection.insert_one(doc)
    return str(res.inserted_id)


async def get_cached_trends(keyword: str) -> dict | None:
    """Return cached trend data if it exists and is less than 24 hours old"""
    from datetime import datetime, timedelta
    cutoff = datetime.utcnow() - timedelta(hours=24)
    doc = await db["trends_cache"].find_one({
        "keyword": keyword.lower(),
        "cachedAt": {"$gte": cutoff}
    })
    if doc:
        print(f"✅ Trends cache hit for: {keyword}")
        return {"score": doc["score"], "rising": doc["rising"]}
    return None


async def save_trends_cache(keyword: str, score: float, rising: list) -> None:
    """Save trend data to cache with current timestamp"""
    from datetime import datetime
    await db["trends_cache"].update_one(
        {"keyword": keyword.lower()},
        {"$set": {"score": score, "rising": rising, "cachedAt": datetime.utcnow()}},
        upsert=True
    )


async def get_pipeline_history(limit: int = 20) -> list:
    """Get last N pipeline runs"""
    cursor = pipeline_collection.find().sort("createdAt", -1).limit(limit)
    history = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # convert ObjectId to string
        history.append(doc)
    return history


async def delete_pipeline_result(result_id: str) -> bool:
    """Delete a pipeline result by ID"""
    from bson import ObjectId
    res = await pipeline_collection.delete_one({"_id": ObjectId(result_id)})
    return res.deleted_count > 0