"""API package for Lead Scraper"""

from .routes import router
from .schemas import ScrapingRequest, ScrapingResponse

__all__ = ["router", "ScrapingRequest", "ScrapingResponse"]