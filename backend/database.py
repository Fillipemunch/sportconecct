from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel
import os
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

# Database instance
db_instance = Database()

async def get_database():
    return db_instance.database

async def connect_to_mongo():
    """Create database connection"""
    db_instance.client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db_instance.database = db_instance.client[os.environ['DB_NAME']]
    
    # Create indexes for better performance
    await create_indexes()
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close database connection"""
    if db_instance.client:
        db_instance.client.close()
        print("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    db = db_instance.database
    
    # Users collection indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("sports")
    await db.users.create_index("location")
    
    # Events collection indexes
    await db.events.create_index("organizer_id")
    await db.events.create_index("sport")
    await db.events.create_index("date")
    await db.events.create_index("location")
    await db.events.create_index("skill_level")
    await db.events.create_index("status")
    await db.events.create_index([("date", 1), ("time", 1)])
    
    # Messages collection indexes
    await db.messages.create_index("event_id")
    await db.messages.create_index([("event_id", 1), ("created_at", -1)])
    
    # Friendships collection indexes
    await db.friendships.create_index([("user_id", 1), ("friend_id", 1)], unique=True)
    await db.friendships.create_index("user_id")
    await db.friendships.create_index("friend_id")
    await db.friendships.create_index("status")

# Database utility functions
async def get_collection(collection_name: str):
    """Get a collection from the database"""
    db = await get_database()
    return db[collection_name]

async def create_document(collection_name: str, document: dict):
    """Create a document in a collection"""
    collection = await get_collection(collection_name)
    result = await collection.insert_one(document)
    return str(result.inserted_id)

async def get_document(collection_name: str, query: dict):
    """Get a single document from a collection"""
    collection = await get_collection(collection_name)
    
    # If querying by id, convert to MongoDB ObjectId if needed
    if 'id' in query:
        try:
            from bson import ObjectId
            # Try to convert to ObjectId first
            query['_id'] = ObjectId(query['id'])
            del query['id']
        except:
            # If conversion fails, also try the original id field
            pass
    
    document = await collection.find_one(query)
    if document:
        document['id'] = str(document['_id'])
        del document['_id']
    return document

async def get_documents(collection_name: str, query: dict = None, limit: int = None, skip: int = None, sort: list = None):
    """Get multiple documents from a collection"""
    collection = await get_collection(collection_name)
    cursor = collection.find(query or {})
    
    if sort:
        cursor = cursor.sort(sort)
    if skip:
        cursor = cursor.skip(skip)
    if limit:
        cursor = cursor.limit(limit)
    
    documents = await cursor.to_list(length=limit)
    for doc in documents:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    
    return documents

async def update_document(collection_name: str, query: dict, update: dict):
    """Update a document in a collection"""
    collection = await get_collection(collection_name)
    
    # If querying by id, convert to MongoDB ObjectId if needed
    if 'id' in query:
        try:
            from bson import ObjectId
            # Try to convert to ObjectId first
            query['_id'] = ObjectId(query['id'])
            del query['id']
        except:
            # If conversion fails, also try the original id field
            pass
    
    result = await collection.update_one(query, {"$set": update})
    return result.modified_count > 0

async def delete_document(collection_name: str, query: dict):
    """Delete a document from a collection"""
    collection = await get_collection(collection_name)
    
    # If querying by id, convert to MongoDB ObjectId if needed
    if 'id' in query:
        try:
            from bson import ObjectId
            # Try to convert to ObjectId first
            query['_id'] = ObjectId(query['id'])
            del query['id']
        except:
            # If conversion fails, also try the original id field
            pass
    
    result = await collection.delete_one(query)
    return result.deleted_count > 0

async def count_documents(collection_name: str, query: dict = None):
    """Count documents in a collection"""
    collection = await get_collection(collection_name)
    return await collection.count_documents(query or {})

async def aggregate_documents(collection_name: str, pipeline: list):
    """Perform aggregation on a collection"""
    collection = await get_collection(collection_name)
    cursor = collection.aggregate(pipeline)
    documents = await cursor.to_list(length=None)
    for doc in documents:
        if '_id' in doc:
            doc['id'] = str(doc['_id'])
            del doc['_id']
    return documents