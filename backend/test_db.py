import asyncio
import sys
sys.path.insert(0, '.')
from database import db

async def test():
    collections = await db.list_collection_names()
    print("✅ MongoDB connected!")
    print("Collections:", collections)

asyncio.run(test())