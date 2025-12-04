"""
MongoDB Configuration for CodeSenseX

This module handles MongoDB connection setup and provides
a database client for the application.
"""

import os
from typing import Optional

# MongoDB Configuration
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGODB_DB_NAME", "codesensex")

# Optional: Connection pooling settings
MONGO_MAX_POOL_SIZE = int(os.getenv("MONGO_MAX_POOL_SIZE", "10"))
MONGO_MIN_POOL_SIZE = int(os.getenv("MONGO_MIN_POOL_SIZE", "1"))

# Global database client (initialized lazily)
_client: Optional["AsyncIOMotorClient"] = None
_db: Optional["AsyncIOMotorDatabase"] = None


async def get_database():
    """
    Get the MongoDB database instance.
    
    Returns:
        AsyncIOMotorDatabase: The MongoDB database instance.
        
    Usage:
        db = await get_database()
        collection = db["projects"]
        await collection.insert_one({"name": "example"})
    """
    global _client, _db
    
    if _db is None:
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            
            _client = AsyncIOMotorClient(
                MONGO_URI,
                maxPoolSize=MONGO_MAX_POOL_SIZE,
                minPoolSize=MONGO_MIN_POOL_SIZE
            )
            _db = _client[MONGO_DB_NAME]
            
            # Verify connection
            await _client.admin.command('ping')
            print(f"✅ Connected to MongoDB: {MONGO_DB_NAME}")
            
        except ImportError:
            print("⚠️  motor package not installed. Using in-memory database.")
            print("   Install with: pip install motor")
            return None
        except Exception as e:
            print(f"⚠️  MongoDB connection failed: {e}")
            print("   Using in-memory database as fallback.")
            return None
    
    return _db


async def close_database():
    """Close the MongoDB connection."""
    global _client, _db
    
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        print("🔌 MongoDB connection closed.")


# Collection names (for consistency)
class Collections:
    PROJECTS = "projects"
    FILE_METRICS = "file_metrics"
    RISKS = "risks"
    SMELLS = "smells"
    SCAN_JOBS = "scan_jobs"
    SUGGESTIONS = "suggestions"


# Index definitions for optimal query performance
INDEXES = {
    Collections.PROJECTS: [
        {"keys": [("name", 1)], "unique": True},
        {"keys": [("created_at", -1)]},
    ],
    Collections.FILE_METRICS: [
        {"keys": [("project_id", 1), ("path", 1)], "unique": True},
        {"keys": [("project_id", 1), ("cyclomatic_max", -1)]},
    ],
    Collections.RISKS: [
        {"keys": [("project_id", 1), ("path", 1)], "unique": True},
        {"keys": [("project_id", 1), ("risk_score", -1)]},
    ],
    Collections.SMELLS: [
        {"keys": [("project_id", 1), ("file_path", 1)]},
        {"keys": [("project_id", 1), ("type", 1)]},
    ],
}


async def ensure_indexes():
    """Create indexes for optimal query performance."""
    db = await get_database()
    if db is None:
        return
    
    for collection_name, indexes in INDEXES.items():
        collection = db[collection_name]
        for index_spec in indexes:
            try:
                await collection.create_index(**index_spec)
            except Exception as e:
                print(f"Warning: Could not create index on {collection_name}: {e}")
    
    print("✅ Database indexes ensured.")
