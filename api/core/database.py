from motor.motor_asyncio import AsyncIOMotorClient
from api.core.config import settings

# These are module-level globals so every route shares one connection pool
client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]

    # Create indexes once on startup
    await db.publications.create_index([("title", "text"), ("author_name", "text")])
    await db.publications.create_index("author_id")
    await db.publications.create_index("year")
    await db.publications.create_index("pub_type")
    await db.publications.create_index([("cited_by", -1)])
    await db.authors.create_index("name")
    print(f"[DB] Connected to MongoDB: {settings.MONGO_DB_NAME}")


async def disconnect_db():
    global client
    if client:
        client.close()
        print("[DB] Disconnected from MongoDB")


def get_db():
    return db
