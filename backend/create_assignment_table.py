import asyncio
from app.db.base import Base
from app.db.session import engine

async def run():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables created/updated successfully.")

if __name__ == "__main__":
    asyncio.run(run())
