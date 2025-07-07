"""
Celery Tasks for Scraping Operations
"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

import structlog
from celery import Task
from sqlalchemy import select, update

from scraper.models import JobStatus, ScrapingJob, get_db_session
from scraper.models.models import PlatformType, ScrapingIntensity
from scraper.services.discovery import EntryPointDiscoveryService
from scraper.services.enrichment import PlatformEnrichmentService

from .celery_app import app

logger = structlog.get_logger(__name__)


class CallbackTask(Task):
    """Base task class with callback support"""
    
    def on_success(self, retval, task_id, args, kwargs):
        """Called on task success"""
        logger.info("Task completed successfully", task_id=task_id, result=retval)
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Called on task failure"""
        logger.error("Task failed", task_id=task_id, error=str(exc), traceback=str(einfo))


@app.task(bind=True, base=CallbackTask, autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 60})
def process_job_pipeline(self, job_id: str):
    """
    Main task for processing complete scraping job pipeline
    """
    try:
        logger.info("Starting job pipeline", job_id=job_id)
        
        # Run the async orchestrator process
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            from scraper.services.orchestrator import ScrapingOrchestrator
            orchestrator = ScrapingOrchestrator()
            result = loop.run_until_complete(orchestrator.process_job(UUID(job_id)))
            return {"job_id": job_id, "status": "completed"}
        finally:
            loop.close()
            
    except Exception as e:
        logger.error("Job pipeline failed", job_id=job_id, error=str(e))
        
        # Update job status to failed
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(_update_job_status_failed(job_id, str(e)))
        finally:
            loop.close()
        
        raise self.retry(exc=e)


@app.task(bind=True, base=CallbackTask, autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 30})
def discover_leads(self, search_params: Dict):
    """
    Task for discovering leads from entry point platforms
    """
    try:
        logger.info("Starting lead discovery task", params=search_params)
        
        # Run async discovery
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            discovery_service = EntryPointDiscoveryService()
            leads = loop.run_until_complete(
                discovery_service.discover(
                    industry=search_params['industry'],
                    location=search_params['location'],
                    radius=search_params.get('radius', 25),
                    max_results=search_params.get('max_results', 100),
                    keywords=search_params.get('keywords', []),
                    job_title=search_params.get('job_title')
                )
            )
            
            logger.info("Discovery task completed", lead_count=len(leads))
            return {"leads": leads, "count": len(leads)}
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error("Discovery task failed", error=str(e))
        raise self.retry(exc=e)


@app.task(bind=True, base=CallbackTask, autoretry_for=(Exception,), retry_kwargs={'max_retries': 2, 'countdown': 30})
def enrich_lead(self, lead_data: Dict, platforms: List[str], intensity: str):
    """
    Task for enriching a single lead
    """
    try:
        logger.info("Starting lead enrichment task", lead_id=lead_data.get('id'))
        
        # Run async enrichment
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            enrichment_service = PlatformEnrichmentService()
            
            # Convert string platforms to enum
            platform_enums = [PlatformType(p) for p in platforms]
            intensity_enum = ScrapingIntensity(intensity)
            
            enriched_leads = loop.run_until_complete(
                enrichment_service.enrich_leads(
                    [lead_data],
                    platform_enums,
                    intensity_enum
                )
            )
            
            result = enriched_leads[0] if enriched_leads else lead_data
            logger.info("Enrichment task completed", lead_id=lead_data.get('id'))
            return result
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error("Enrichment task failed", lead_id=lead_data.get('id'), error=str(e))
        raise self.retry(exc=e)


@app.task(bind=True, base=CallbackTask, autoretry_for=(Exception,), retry_kwargs={'max_retries': 2, 'countdown': 60})
def export_results(self, job_id: str, export_format: str, include_enrichment: bool = True):
    """
    Task for exporting job results
    """
    try:
        logger.info("Starting export task", job_id=job_id, format=export_format)
        
        # Run async export
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            from scraper.services.export import ExportService
            export_service = ExportService()
            
            result = loop.run_until_complete(
                export_service.export_job_results(
                    UUID(job_id),
                    export_format,
                    include_enrichment
                )
            )
            
            logger.info("Export task completed", job_id=job_id, file_path=result.get('file_path'))
            return result
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error("Export task failed", job_id=job_id, error=str(e))
        raise self.retry(exc=e)


@app.task(bind=True)
def cleanup_old_jobs(self, days_old: int = 30):
    """
    Cleanup task for removing old completed jobs
    """
    try:
        logger.info("Starting cleanup task", days_old=days_old)
        
        # Run async cleanup
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            from datetime import timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            async def cleanup():
                async with get_db_session() as session:
                    # Delete old completed/failed jobs
                    result = await session.execute(
                        select(ScrapingJob)
                        .where(
                            ScrapingJob.completed_at < cutoff_date,
                            ScrapingJob.status.in_([JobStatus.COMPLETED, JobStatus.FAILED])
                        )
                    )
                    
                    old_jobs = result.scalars().all()
                    
                    for job in old_jobs:
                        await session.delete(job)
                    
                    await session.commit()
                    return len(old_jobs)
            
            deleted_count = loop.run_until_complete(cleanup())
            
            logger.info("Cleanup task completed", deleted_jobs=deleted_count)
            return {"deleted_jobs": deleted_count}
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error("Cleanup task failed", error=str(e))
        return {"error": str(e)}


@app.task(bind=True)
def health_check_task(self):
    """
    Health check task for monitoring system status
    """
    try:
        # Test database connection
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            async def check_db():
                async with get_db_session() as session:
                    await session.execute("SELECT 1")
                    return True
            
            db_healthy = loop.run_until_complete(check_db())
            
            # Test Redis connection
            import redis.asyncio as redis
            async def check_redis():
                redis_client = redis.from_url(app.conf.broker_url)
                await redis_client.ping()
                await redis_client.close()
                return True
            
            redis_healthy = loop.run_until_complete(check_redis())
            
            status = {
                "database": "healthy" if db_healthy else "unhealthy",
                "redis": "healthy" if redis_healthy else "unhealthy",
                "worker": "healthy",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            logger.info("Health check completed", status=status)
            return status
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        return {
            "database": "unhealthy",
            "redis": "unhealthy",
            "worker": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


async def _update_job_status_failed(job_id: str, error_message: str):
    """Helper function to update job status to failed"""
    async with get_db_session() as session:
        await session.execute(
            update(ScrapingJob)
            .where(ScrapingJob.id == UUID(job_id))
            .values(
                status=JobStatus.FAILED,
                error_message=error_message,
                completed_at=datetime.utcnow()
            )
        )
        await session.commit()


# Periodic tasks configuration
from celery.schedules import crontab

app.conf.beat_schedule = {
    # Cleanup old jobs daily at midnight
    'cleanup-old-jobs': {
        'task': 'scraper.tasks.scraping_tasks.cleanup_old_jobs',
        'schedule': crontab(hour=0, minute=0),
        'args': (30,)  # Delete jobs older than 30 days
    },
    
    # Health check every 5 minutes
    'health-check': {
        'task': 'scraper.tasks.scraping_tasks.health_check_task',
        'schedule': crontab(minute='*/5'),
    },
}