"""
Application Settings and Configuration
"""

from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql://user:password@localhost:5432/lead_scraper",
        description="PostgreSQL database URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=5, description="Database connection pool size")
    DATABASE_MAX_OVERFLOW: int = Field(default=10, description="Database max overflow connections")
    
    # Redis Configuration
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis URL for caching and task queue"
    )
    REDIS_MAX_CONNECTIONS: int = Field(default=10, description="Redis max connections")
    
    # Celery Configuration
    CELERY_BROKER_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Celery broker URL"
    )
    CELERY_RESULT_BACKEND: str = Field(
        default="redis://localhost:6379/0",
        description="Celery result backend URL"
    )
    
    # API Configuration
    API_HOST: str = Field(default="0.0.0.0", description="API host address")
    API_PORT: int = Field(default=8000, description="API port")
    API_DEBUG: bool = Field(default=False, description="Enable debug mode")
    API_SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        description="Secret key for JWT tokens"
    )
    
    # Scraping Configuration
    MAX_CONCURRENT_JOBS: int = Field(default=5, description="Maximum concurrent scraping jobs")
    DEFAULT_REQUEST_TIMEOUT: int = Field(default=30, description="Default HTTP request timeout")
    SCRAPING_RATE_LIMIT: int = Field(default=10, description="Requests per second rate limit")
    PROXY_ENABLED: bool = Field(default=False, description="Enable proxy rotation")
    PROXY_LIST: str = Field(default="", description="Comma-separated list of proxy URLs")
    
    # Platform API Keys (Optional)
    GOOGLE_MAPS_API_KEY: Optional[str] = Field(default=None, description="Google Maps API key")
    LINKEDIN_API_KEY: Optional[str] = Field(default=None, description="LinkedIn API key")
    FACEBOOK_API_KEY: Optional[str] = Field(default=None, description="Facebook API key")
    
    # Monitoring Configuration
    PROMETHEUS_PORT: int = Field(default=8001, description="Prometheus metrics port")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    SENTRY_DSN: Optional[str] = Field(default=None, description="Sentry DSN for error tracking")
    
    # Anti-Detection Configuration
    USER_AGENT_ROTATION: bool = Field(default=True, description="Enable user agent rotation")
    PROXY_ROTATION: bool = Field(default=True, description="Enable proxy rotation")
    HUMAN_LIKE_DELAYS: bool = Field(default=True, description="Enable human-like delays")
    MAX_RETRIES: int = Field(default=3, description="Maximum retry attempts")
    RETRY_DELAY: int = Field(default=5, description="Delay between retries in seconds")
    
    # Export Configuration
    EXPORT_DIRECTORY: str = Field(default="./exports", description="Directory for exported files")
    MAX_EXPORT_SIZE: int = Field(default=10000, description="Maximum records per export")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()