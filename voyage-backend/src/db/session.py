from motor.motor_asyncio import AsyncIOMotorDatabase
from db.mongodb import get_database
from typing import AsyncGenerator


async def get_db() -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    database = await get_database()
    try:
        yield database
    finally:
        pass