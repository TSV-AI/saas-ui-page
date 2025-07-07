"""
Database configuration and session management
"""

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from scraper.config.settings import settings


class Base(DeclarativeBase):
    """Base class for all database models"""
    metadata = MetaData()


# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.API_DEBUG,
    future=True,
)

# Create session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db() -> None:
    """Initialize database tables"""
    async with engine.begin() as conn:
        # Import all models to ensure they're registered
        from . import models  # noqa
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session context manager"""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for database session"""
    async with get_db_session() as session:
        yield session