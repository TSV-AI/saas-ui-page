"""
SQLAlchemy Database Models
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import JSON, CheckConstraint, DateTime, Float, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class JobStatus(str, Enum):
    """Job status enumeration"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScrapingIntensity(str, Enum):
    """Scraping intensity levels"""
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"


class PlatformType(str, Enum):
    """Supported platforms for scraping"""
    GOOGLE_MAPS = "google_maps"
    GOOGLE_BUSINESS = "google_business"
    LINKEDIN = "linkedin"
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    GOOGLE_SEARCH = "google_search"


class ScrapingJob(Base):
    """Scraping job model for tracking operations"""
    __tablename__ = "scraping_jobs"
    
    id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    user_id: Mapped[Optional[UUID]] = mapped_column(
        PostgresUUID(as_uuid=True),
        nullable=True  # For now, make this optional
    )
    
    # Request parameters stored as JSON
    request_params: Mapped[dict] = mapped_column(JSON, nullable=False)
    
    # Job status and progress
    status: Mapped[JobStatus] = mapped_column(
        String(20),
        nullable=False,
        default=JobStatus.QUEUED
    )
    progress: Mapped[int] = mapped_column(Integer, default=0)
    results_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Error handling
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    # Relationships
    leads: Mapped[list["Lead"]] = relationship(
        "Lead",
        back_populates="job",
        cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        CheckConstraint("progress >= 0 AND progress <= 100", name="valid_progress"),
        CheckConstraint("results_count >= 0", name="non_negative_results"),
        CheckConstraint("retry_count >= 0", name="non_negative_retries"),
    )


class Lead(Base):
    """Lead model for storing discovered and enriched contacts"""
    __tablename__ = "leads"
    
    id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    job_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        nullable=False
    )
    
    # Basic contact information
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    business_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Business information
    industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    job_title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    
    # Source information
    source_platform: Mapped[PlatformType] = mapped_column(
        String(50),
        nullable=False
    )
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Enrichment data stored as JSON
    enrichment_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Quality metrics
    quality_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    completeness_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    
    # Relationships
    job: Mapped["ScrapingJob"] = relationship(
        "ScrapingJob",
        back_populates="leads"
    )
    enrichment_records: Mapped[list["EnrichmentData"]] = relationship(
        "EnrichmentData",
        back_populates="lead",
        cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        CheckConstraint(
            "quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100)",
            name="valid_quality_score"
        ),
        CheckConstraint(
            "completeness_score IS NULL OR (completeness_score >= 0.0 AND completeness_score <= 1.0)",
            name="valid_completeness_score"
        ),
        CheckConstraint(
            "confidence_score IS NULL OR (confidence_score >= 0.0 AND confidence_score <= 1.0)",
            name="valid_confidence_score"
        ),
    )


class EnrichmentData(Base):
    """Platform-specific enrichment data for leads"""
    __tablename__ = "enrichment_data"
    
    id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    lead_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        nullable=False
    )
    
    # Platform and data type
    platform: Mapped[PlatformType] = mapped_column(String(50), nullable=False)
    data_type: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Raw and processed data
    raw_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    processed_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Quality metrics
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    extraction_method: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Timestamps
    scraped_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    processed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    # Relationships
    lead: Mapped["Lead"] = relationship(
        "Lead",
        back_populates="enrichment_records"
    )
    
    __table_args__ = (
        CheckConstraint(
            "confidence_score IS NULL OR (confidence_score >= 0.0 AND confidence_score <= 1.0)",
            name="valid_enrichment_confidence"
        ),
    )


class ProxyPool(Base):
    """Proxy pool for anti-detection"""
    __tablename__ = "proxy_pool"
    
    id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    
    # Proxy details
    proxy_url: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    proxy_type: Mapped[str] = mapped_column(String(20), nullable=False)  # http, https, socks5
    country: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)  # ISO country code
    
    # Status and metrics
    is_active: Mapped[bool] = mapped_column(default=True)
    success_rate: Mapped[float] = mapped_column(Float, default=1.0)
    avg_response_time: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    last_used: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    # Usage tracking
    total_requests: Mapped[int] = mapped_column(Integer, default=0)
    successful_requests: Mapped[int] = mapped_column(Integer, default=0)
    failed_requests: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    
    __table_args__ = (
        CheckConstraint("success_rate >= 0.0 AND success_rate <= 1.0", name="valid_success_rate"),
        CheckConstraint("total_requests >= 0", name="non_negative_total_requests"),
        CheckConstraint("successful_requests >= 0", name="non_negative_successful_requests"),
        CheckConstraint("failed_requests >= 0", name="non_negative_failed_requests"),
        CheckConstraint(
            "successful_requests + failed_requests <= total_requests",
            name="valid_request_counts"
        ),
    )