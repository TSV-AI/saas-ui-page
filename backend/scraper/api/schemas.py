"""
Pydantic schemas for API request/response models
"""

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

from scraper.models.models import JobStatus, PlatformType, ScrapingIntensity


class ScrapingRequest(BaseModel):
    """Request model for creating scraping jobs"""
    industry: str = Field(..., min_length=1, max_length=100, description="Target industry")
    location: str = Field(..., min_length=1, max_length=200, description="Search location")
    radius: int = Field(default=25, ge=1, le=100, description="Search radius in miles")
    max_results: int = Field(default=100, ge=1, le=1000, description="Maximum results to return")
    keywords: List[str] = Field(default=[], max_items=5, description="Search keywords")
    job_title: Optional[str] = Field(None, max_length=200, description="Target job title")
    platforms: List[PlatformType] = Field(
        default=[PlatformType.GOOGLE_MAPS],
        description="Platforms to search and enrich from"
    )
    intensity: ScrapingIntensity = Field(
        default=ScrapingIntensity.STANDARD,
        description="Scraping intensity level"
    )
    webhook_url: Optional[str] = Field(None, description="Webhook URL for completion notification")
    
    @validator('keywords')
    def validate_keywords(cls, v):
        """Validate keywords list"""
        if len(v) > 5:
            raise ValueError("Maximum 5 keywords allowed")
        return [keyword.strip() for keyword in v if keyword.strip()]
    
    @validator('platforms')
    def validate_platforms(cls, v):
        """Validate platforms list"""
        if not v:
            raise ValueError("At least one platform must be specified")
        return v


class ScrapingResponse(BaseModel):
    """Response model for scraping job creation"""
    job_id: UUID
    status: JobStatus
    estimated_duration: int = Field(description="Estimated duration in seconds")
    message: str = Field(description="Response message")
    created_at: datetime


class JobStatusResponse(BaseModel):
    """Response model for job status queries"""
    job_id: UUID
    status: JobStatus
    progress: int = Field(ge=0, le=100, description="Progress percentage")
    results_count: int = Field(ge=0, description="Number of results found")
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_remaining: Optional[int] = Field(None, description="Estimated remaining seconds")


class LeadSchema(BaseModel):
    """Schema for lead data"""
    id: UUID
    name: Optional[str] = None
    business_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    job_title: Optional[str] = None
    source_platform: PlatformType
    source_url: Optional[str] = None
    enrichment_data: Optional[Dict] = None
    quality_score: Optional[int] = Field(None, ge=0, le=100)
    completeness_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    created_at: datetime
    
    class Config:
        from_attributes = True


class JobResultsResponse(BaseModel):
    """Response model for job results"""
    job_id: UUID
    status: JobStatus
    total_results: int
    leads: List[LeadSchema]
    metadata: Dict = Field(default_factory=dict, description="Additional metadata")
    export_urls: Optional[Dict[str, str]] = Field(None, description="Export download URLs")


class ExportRequest(BaseModel):
    """Request model for exporting results"""
    job_id: UUID
    format: str = Field(default="csv", pattern="^(csv|json|xlsx)$", description="Export format")
    include_enrichment: bool = Field(default=True, description="Include enrichment data")
    fields: Optional[List[str]] = Field(None, description="Specific fields to export")


class ExportResponse(BaseModel):
    """Response model for export requests"""
    export_id: UUID
    download_url: str
    format: str
    file_size: int = Field(description="File size in bytes")
    record_count: int = Field(description="Number of records in export")
    expires_at: datetime = Field(description="When the download link expires")


class PlatformStatsSchema(BaseModel):
    """Schema for platform statistics"""
    platform: PlatformType
    total_leads: int
    success_rate: float = Field(ge=0.0, le=1.0)
    avg_quality_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    avg_response_time: Optional[float] = Field(None, description="Average response time in seconds")


class SystemStatsResponse(BaseModel):
    """Response model for system statistics"""
    total_jobs: int
    active_jobs: int
    completed_jobs: int
    failed_jobs: int
    total_leads: int
    platform_stats: List[PlatformStatsSchema]
    avg_job_duration: Optional[float] = Field(None, description="Average job duration in seconds")
    success_rate: float = Field(ge=0.0, le=1.0, description="Overall success rate")


class ErrorResponse(BaseModel):
    """Standard error response model"""
    error: str
    message: str
    details: Optional[Dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthCheckResponse(BaseModel):
    """Health check response model"""
    status: str
    database: str
    redis: str
    timestamp: float
    version: str = "1.0.0"


# Webhook notification schemas
class WebhookJobComplete(BaseModel):
    """Webhook payload for job completion"""
    job_id: UUID
    status: JobStatus
    results_count: int
    completed_at: datetime
    download_urls: Optional[Dict[str, str]] = None


class WebhookJobFailed(BaseModel):
    """Webhook payload for job failure"""
    job_id: UUID
    status: JobStatus
    error_message: str
    failed_at: datetime
    retry_count: int