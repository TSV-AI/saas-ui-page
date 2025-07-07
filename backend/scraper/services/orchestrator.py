"""
Scraping Orchestrator Service
Manages the overall scraping workflow and job processing
"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

import structlog
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from scraper.models import JobStatus, Lead, ScrapingJob, get_db_session
from scraper.models.models import PlatformType, ScrapingIntensity

from .discovery import EntryPointDiscoveryService
from .enrichment import PlatformEnrichmentService

logger = structlog.get_logger(__name__)


class ScrapingOrchestrator:
    """
    Main orchestrator for managing scraping jobs and workflows
    """
    
    def __init__(self):
        self.discovery_service = EntryPointDiscoveryService()
        self.enrichment_service = PlatformEnrichmentService()
        self.active_jobs: Dict[UUID, asyncio.Task] = {}
        self.max_concurrent_jobs = 5
    
    async def process_job(self, job_id: UUID) -> None:
        """
        Process a scraping job through all stages
        """
        logger.info("Starting job processing", job_id=str(job_id))
        
        async with get_db_session() as session:
            try:
                # Get job details
                result = await session.execute(
                    select(ScrapingJob).where(ScrapingJob.id == job_id)
                )
                job = result.scalar_one_or_none()
                
                if not job:
                    logger.error("Job not found", job_id=str(job_id))
                    return
                
                # Update job status to processing
                await self._update_job_status(
                    session, job_id, JobStatus.PROCESSING, 
                    started_at=datetime.utcnow()
                )
                
                # Parse request parameters
                params = job.request_params
                
                # Stage 1: Entry Point Discovery
                logger.info("Starting discovery stage", job_id=str(job_id))
                await self._update_job_progress(session, job_id, 10)
                
                initial_leads = await self.discovery_service.discover(
                    industry=params.get('industry'),
                    location=params.get('location'),
                    radius=params.get('radius', 25),
                    max_results=params.get('max_results', 100),
                    keywords=params.get('keywords', []),
                    job_title=params.get('job_title')
                )
                
                logger.info("Discovery complete", job_id=str(job_id), leads_found=len(initial_leads))
                await self._update_job_progress(session, job_id, 30)
                
                # Save initial leads to database
                await self._save_leads(session, job_id, initial_leads)
                await self._update_job_progress(session, job_id, 40)
                
                # Stage 2: Platform Enrichment (if enabled)
                platforms = params.get('platforms', [PlatformType.GOOGLE_MAPS.value])
                intensity = params.get('intensity', ScrapingIntensity.STANDARD.value)
                
                if len(platforms) > 1 or intensity != ScrapingIntensity.BASIC.value:
                    logger.info("Starting enrichment stage", job_id=str(job_id))
                    
                    enriched_leads = await self.enrichment_service.enrich_leads(
                        initial_leads,
                        platforms=[PlatformType(p) for p in platforms if p != PlatformType.GOOGLE_MAPS.value],
                        intensity=ScrapingIntensity(intensity)
                    )
                    
                    # Update leads with enrichment data
                    await self._update_leads_enrichment(session, enriched_leads)
                    
                    logger.info("Enrichment complete", job_id=str(job_id))
                    await self._update_job_progress(session, job_id, 80)
                
                # Stage 3: Quality Scoring and Final Processing
                logger.info("Starting quality scoring", job_id=str(job_id))
                await self._calculate_quality_scores(session, job_id)
                await self._update_job_progress(session, job_id, 90)
                
                # Stage 4: Job Completion
                await self._finalize_job(session, job_id)
                await self._update_job_progress(session, job_id, 100)
                
                logger.info("Job completed successfully", job_id=str(job_id))
                
            except Exception as e:
                logger.error("Job processing failed", job_id=str(job_id), error=str(e))
                await self._update_job_status(
                    session, job_id, JobStatus.FAILED,
                    error_message=str(e),
                    completed_at=datetime.utcnow()
                )
            finally:
                # Remove from active jobs
                if job_id in self.active_jobs:
                    del self.active_jobs[job_id]
    
    async def _update_job_status(
        self,
        session: AsyncSession,
        job_id: UUID,
        status: JobStatus,
        error_message: Optional[str] = None,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None
    ) -> None:
        """Update job status in database"""
        update_data = {"status": status}
        
        if error_message is not None:
            update_data["error_message"] = error_message
        if started_at is not None:
            update_data["started_at"] = started_at
        if completed_at is not None:
            update_data["completed_at"] = completed_at
        
        await session.execute(
            update(ScrapingJob)
            .where(ScrapingJob.id == job_id)
            .values(**update_data)
        )
        await session.commit()
    
    async def _update_job_progress(
        self,
        session: AsyncSession,
        job_id: UUID,
        progress: int
    ) -> None:
        """Update job progress percentage"""
        await session.execute(
            update(ScrapingJob)
            .where(ScrapingJob.id == job_id)
            .values(progress=progress)
        )
        await session.commit()
    
    async def _save_leads(
        self,
        session: AsyncSession,
        job_id: UUID,
        leads_data: List[Dict]
    ) -> None:
        """Save leads to database"""
        leads = []
        for lead_data in leads_data:
            lead = Lead(
                job_id=job_id,
                name=lead_data.get('name'),
                business_name=lead_data.get('business_name'),
                phone=lead_data.get('phone'),
                email=lead_data.get('email'),
                website=lead_data.get('website'),
                address=lead_data.get('address'),
                industry=lead_data.get('industry'),
                job_title=lead_data.get('job_title'),
                source_platform=PlatformType(lead_data.get('source_platform', PlatformType.GOOGLE_MAPS.value)),
                source_url=lead_data.get('source_url'),
                enrichment_data=lead_data.get('enrichment_data', {}),
                quality_score=lead_data.get('quality_score', 50),
                completeness_score=lead_data.get('completeness_score'),
                confidence_score=lead_data.get('confidence_score')
            )
            leads.append(lead)
        
        session.add_all(leads)
        await session.commit()
        
        # Update job results count
        await session.execute(
            update(ScrapingJob)
            .where(ScrapingJob.id == job_id)
            .values(results_count=len(leads_data))
        )
        await session.commit()
    
    async def _update_leads_enrichment(
        self,
        session: AsyncSession,
        enriched_leads: List[Dict]
    ) -> None:
        """Update leads with enrichment data"""
        for lead_data in enriched_leads:
            if 'id' in lead_data:
                await session.execute(
                    update(Lead)
                    .where(Lead.id == lead_data['id'])
                    .values(
                        enrichment_data=lead_data.get('enrichment_data', {}),
                        quality_score=lead_data.get('quality_score'),
                        completeness_score=lead_data.get('completeness_score'),
                        confidence_score=lead_data.get('confidence_score')
                    )
                )
        
        await session.commit()
    
    async def _calculate_quality_scores(
        self,
        session: AsyncSession,
        job_id: UUID
    ) -> None:
        """Calculate quality scores for all leads in a job"""
        # Get all leads for the job
        result = await session.execute(
            select(Lead).where(Lead.job_id == job_id)
        )
        leads = result.scalars().all()
        
        for lead in leads:
            # Calculate completeness score
            fields = [
                lead.name, lead.business_name, lead.phone, 
                lead.email, lead.website, lead.address
            ]
            filled_fields = sum(1 for field in fields if field and field.strip())
            completeness_score = filled_fields / len(fields)
            
            # Calculate base quality score
            quality_score = int(completeness_score * 100)
            
            # Bonus points for enrichment data
            if lead.enrichment_data:
                enrichment_bonus = min(len(lead.enrichment_data), 20)
                quality_score = min(100, quality_score + enrichment_bonus)
            
            # Update lead
            lead.completeness_score = completeness_score
            lead.quality_score = quality_score
            lead.confidence_score = 0.8 if quality_score > 70 else 0.6
        
        await session.commit()
    
    async def _finalize_job(
        self,
        session: AsyncSession,
        job_id: UUID
    ) -> None:
        """Finalize job processing"""
        await self._update_job_status(
            session, job_id, JobStatus.COMPLETED,
            completed_at=datetime.utcnow()
        )
        
        # TODO: Send webhook notification if configured
        # TODO: Generate export files if requested
    
    async def cancel_job(self, job_id: UUID) -> bool:
        """Cancel a running job"""
        if job_id in self.active_jobs:
            task = self.active_jobs[job_id]
            task.cancel()
            
            async with get_db_session() as session:
                await self._update_job_status(
                    session, job_id, JobStatus.CANCELLED,
                    completed_at=datetime.utcnow()
                )
            
            del self.active_jobs[job_id]
            return True
        
        return False
    
    async def get_active_jobs(self) -> List[UUID]:
        """Get list of currently active job IDs"""
        return list(self.active_jobs.keys())
    
    async def health_check(self) -> Dict[str, any]:
        """Perform health check of orchestrator"""
        return {
            "active_jobs": len(self.active_jobs),
            "max_concurrent_jobs": self.max_concurrent_jobs,
            "status": "healthy"
        }