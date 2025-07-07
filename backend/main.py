"""
Lead Scraper FastAPI Application
Multi-stage enrichment scraper for lead generation
"""

import asyncio
import logging
from contextlib import asynccontextmanager

import structlog
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from prometheus_client import make_asgi_app

from scraper.api.routes import router as api_router
from scraper.config.settings import settings
from scraper.models.database import init_db


# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting Lead Scraper API")
    
    # Initialize database
    await init_db()
    logger.info("Database initialized")
    
    # Initialize browser for Playwright
    from playwright.async_api import async_playwright
    app.state.playwright = await async_playwright().start()
    app.state.browser = await app.state.playwright.chromium.launch(
        headless=True,
        args=['--no-sandbox', '--disable-setuid-sandbox']
    )
    logger.info("Browser initialized")
    
    yield
    
    # Cleanup
    if hasattr(app.state, 'browser'):
        await app.state.browser.close()
    if hasattr(app.state, 'playwright'):
        await app.state.playwright.stop()
    logger.info("Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Lead Scraper API",
    description="Multi-stage enrichment scraper for lead generation",
    version="1.0.0",
    docs_url="/docs" if settings.API_DEBUG else None,
    redoc_url="/redoc" if settings.API_DEBUG else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", settings.API_HOST]
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Add Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)


@app.get("/")
async def root():
    """Root endpoint for health check"""
    return {
        "service": "Lead Scraper API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs" if settings.API_DEBUG else "disabled"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        from scraper.models.database import get_db_session
        async with get_db_session() as session:
            await session.execute("SELECT 1")
        
        # Check Redis connection
        import redis.asyncio as redis
        redis_client = redis.from_url(settings.REDIS_URL)
        await redis_client.ping()
        await redis_client.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "redis": "connected",
            "timestamp": asyncio.get_event_loop().time()
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Service unhealthy")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )