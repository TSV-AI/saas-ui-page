"""
FastAPI Routes for Lead Scraper API
"""

import asyncio
from datetime import datetime
from typing import List, Optional
from uuid import UUID

import structlog
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from scraper.models import JobStatus, Lead, ScrapingJob, get_db
from scraper.services.orchestrator import ScrapingOrchestrator

from .schemas import (
    ErrorResponse,
    ExportRequest,
    ExportResponse,
    JobResultsResponse,
    JobStatusResponse,
    ScrapingRequest,
    ScrapingResponse,
    SystemStatsResponse,
)

logger = structlog.get_logger(__name__)

# Create API router
router = APIRouter()

# Initialize orchestrator (will be properly injected later)
orchestrator = ScrapingOrchestrator()


@router.post("/jobs", response_model=ScrapingResponse)
async def create_scraping_job(
    request: ScrapingRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
) -> ScrapingResponse:
    """
    Create a new scraping job
    
    This endpoint accepts scraping parameters and queues a job for processing.
    The job will run asynchronously and can be monitored via the status endpoint.
    """
    try:
        logger.info("Creating scraping job", request_params=request.dict())
        
        # Create job record in database
        job = ScrapingJob(
            request_params=request.dict(),
            status=JobStatus.QUEUED
        )
        
        db.add(job)
        await db.commit()
        await db.refresh(job)
        
        # Queue job for processing
        background_tasks.add_task(orchestrator.process_job, job.id)
        
        # Estimate duration based on parameters
        estimated_duration = _estimate_job_duration(request)
        
        logger.info("Scraping job created", job_id=str(job.id))
        
        return ScrapingResponse(
            job_id=job.id,
            status=job.status,
            estimated_duration=estimated_duration,
            message="Job queued successfully",
            created_at=job.created_at
        )
        
    except Exception as e:
        logger.error("Failed to create scraping job", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create job: {str(e)}"
        )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> JobStatusResponse:
    """
    Get the status of a specific scraping job
    
    Returns current status, progress, and results count for the specified job.
    """
    try:
        # Query job from database
        result = await db.execute(
            select(ScrapingJob).where(ScrapingJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            raise HTTPException(
                status_code=404,
                detail=f"Job {job_id} not found"
            )
        
        # Calculate estimated remaining time
        estimated_remaining = None
        if job.status == JobStatus.PROCESSING and job.started_at:
            elapsed = (datetime.utcnow() - job.started_at).total_seconds()
            if job.progress > 0:
                total_estimated = elapsed * (100 / job.progress)
                estimated_remaining = max(0, int(total_estimated - elapsed))
        
        return JobStatusResponse(
            job_id=job.id,
            status=job.status,
            progress=job.progress,
            results_count=job.results_count,
            error_message=job.error_message,
            created_at=job.created_at,
            started_at=job.started_at,
            completed_at=job.completed_at,
            estimated_remaining=estimated_remaining
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get job status", job_id=str(job_id), error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get job status: {str(e)}"
        )


@router.get("/jobs/{job_id}/results", response_model=JobResultsResponse)
async def get_job_results(
    job_id: UUID,
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=1000, description="Limit for pagination"),
    db: AsyncSession = Depends(get_db)
) -> JobResultsResponse:
    """
    Get results for a completed scraping job
    
    Returns the leads found by the scraping job with pagination support.
    """
    try:
        # Query job with leads
        result = await db.execute(
            select(ScrapingJob)
            .options(selectinload(ScrapingJob.leads))
            .where(ScrapingJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            raise HTTPException(
                status_code=404,
                detail=f"Job {job_id} not found"
            )
        
        # Query leads with pagination
        leads_result = await db.execute(
            select(Lead)
            .where(Lead.job_id == job_id)
            .offset(offset)
            .limit(limit)
            .order_by(Lead.created_at.desc())
        )
        leads = leads_result.scalars().all()
        
        # Convert to schema
        from .schemas import LeadSchema
        lead_schemas = [LeadSchema.from_orm(lead) for lead in leads]
        
        return JobResultsResponse(
            job_id=job.id,
            status=job.status,
            total_results=job.results_count,
            leads=lead_schemas,
            metadata={
                "offset": offset,
                "limit": limit,
                "has_more": offset + limit < job.results_count
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get job results", job_id=str(job_id), error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get job results: {str(e)}"
        )


@router.post("/jobs/{job_id}/export", response_model=ExportResponse)
async def export_job_results(
    job_id: UUID,
    export_request: ExportRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
) -> ExportResponse:
    """
    Export job results to specified format
    
    Creates an export file (CSV, JSON, or XLSX) with the job results.
    """
    try:
        # Verify job exists
        result = await db.execute(
            select(ScrapingJob).where(ScrapingJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            raise HTTPException(
                status_code=404,
                detail=f"Job {job_id} not found"
            )
        
        if job.status not in [JobStatus.COMPLETED, JobStatus.PROCESSING]:
            raise HTTPException(
                status_code=400,
                detail="Job must be completed or in progress to export"
            )
        
        # TODO: Implement actual export service
        from uuid import uuid4
        export_id = uuid4()
        
        # Queue export task
        background_tasks.add_task(
            _process_export,
            export_id,
            job_id,
            export_request.format,
            export_request.include_enrichment,
            export_request.fields
        )
        
        return ExportResponse(
            export_id=export_id,
            download_url=f"/api/v1/exports/{export_id}/download",
            format=export_request.format,
            file_size=0,  # Will be updated when export completes
            record_count=job.results_count,
            expires_at=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create export", job_id=str(job_id), error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create export: {str(e)}"
        )


@router.delete("/jobs/{job_id}")
async def cancel_job(
    job_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Cancel a running or queued scraping job
    """
    try:
        # Query job
        result = await db.execute(
            select(ScrapingJob).where(ScrapingJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            raise HTTPException(
                status_code=404,
                detail=f"Job {job_id} not found"
            )
        
        if job.status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel job with status: {job.status}"
            )
        
        # Update job status
        job.status = JobStatus.CANCELLED
        job.completed_at = datetime.utcnow()
        
        await db.commit()
        
        logger.info("Job cancelled", job_id=str(job_id))
        
        return {"message": f"Job {job_id} cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to cancel job", job_id=str(job_id), error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel job: {str(e)}"
        )


@router.get("/jobs", response_model=List[JobStatusResponse])
async def list_jobs(
    status: Optional[JobStatus] = Query(None, description="Filter by job status"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Limit for pagination"),
    db: AsyncSession = Depends(get_db)
) -> List[JobStatusResponse]:
    """
    List scraping jobs with optional filtering
    """
    try:
        query = select(ScrapingJob).order_by(ScrapingJob.created_at.desc())
        
        if status:
            query = query.where(ScrapingJob.status == status)
        
        query = query.offset(offset).limit(limit)
        
        result = await db.execute(query)
        jobs = result.scalars().all()
        
        return [
            JobStatusResponse(
                job_id=job.id,
                status=job.status,
                progress=job.progress,
                results_count=job.results_count,
                error_message=job.error_message,
                created_at=job.created_at,
                started_at=job.started_at,
                completed_at=job.completed_at
            )
            for job in jobs
        ]
        
    except Exception as e:
        logger.error("Failed to list jobs", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list jobs: {str(e)}"
        )


@router.get("/stats", response_model=SystemStatsResponse)
async def get_system_stats(
    db: AsyncSession = Depends(get_db)
) -> SystemStatsResponse:
    """
    Get system statistics and performance metrics
    """
    try:
        # Get job counts by status
        jobs_stats = await db.execute(
            select(
                ScrapingJob.status,
                func.count(ScrapingJob.id).label('count')
            ).group_by(ScrapingJob.status)
        )
        
        status_counts = {status.value: 0 for status in JobStatus}
        for row in jobs_stats:
            status_counts[row.status] = row.count
        
        # Get total leads count
        total_leads_result = await db.execute(
            select(func.count(Lead.id))
        )
        total_leads = total_leads_result.scalar() or 0
        
        # Calculate success rate
        total_jobs = sum(status_counts.values())
        success_rate = (
            status_counts[JobStatus.COMPLETED.value] / total_jobs
            if total_jobs > 0 else 0.0
        )
        
        return SystemStatsResponse(
            total_jobs=total_jobs,
            active_jobs=status_counts[JobStatus.PROCESSING.value] + status_counts[JobStatus.QUEUED.value],
            completed_jobs=status_counts[JobStatus.COMPLETED.value],
            failed_jobs=status_counts[JobStatus.FAILED.value],
            total_leads=total_leads,
            platform_stats=[],  # TODO: Implement platform-specific stats
            success_rate=success_rate
        )
        
    except Exception as e:
        logger.error("Failed to get system stats", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get system stats: {str(e)}"
        )


def _estimate_job_duration(request: ScrapingRequest) -> int:
    """Estimate job duration based on request parameters"""
    base_time = 60  # Base 1 minute
    
    # Factor in max results
    results_factor = min(request.max_results / 100, 5)  # Cap at 5x
    
    # Factor in intensity
    intensity_multiplier = {
        ScrapingIntensity.BASIC: 1.0,
        ScrapingIntensity.STANDARD: 2.0,
        ScrapingIntensity.PREMIUM: 4.0
    }
    
    # Factor in platforms
    platform_factor = len(request.platforms) * 0.5
    
    total_time = base_time * results_factor * intensity_multiplier[request.intensity] * (1 + platform_factor)
    
    return int(total_time)


async def _process_export(
    export_id: UUID,
    job_id: UUID,
    format: str,
    include_enrichment: bool,
    fields: Optional[List[str]]
) -> None:
    """Process export task (placeholder implementation)"""
    # TODO: Implement actual export processing
    await asyncio.sleep(2)  # Simulate processing
    logger.info("Export processed", export_id=str(export_id), job_id=str(job_id))