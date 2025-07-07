"""
Platform Enrichment Service
Handles enrichment of leads from various social and business platforms
"""

import asyncio
import random
from typing import Dict, List

import structlog

from scraper.models.models import PlatformType, ScrapingIntensity

logger = structlog.get_logger(__name__)


class PlatformEnrichmentService:
    """
    Service for enriching leads with data from multiple platforms
    """
    
    def __init__(self):
        self.enrichers = {
            PlatformType.LINKEDIN: LinkedInEnricher(),
            PlatformType.FACEBOOK: FacebookEnricher(),
            PlatformType.INSTAGRAM: InstagramEnricher(),
            PlatformType.GOOGLE_SEARCH: GoogleSearchEnricher()
        }
        
        self.intensity_configs = {
            ScrapingIntensity.BASIC: {
                "depth": 1,
                "fields": ["basic_info"],
                "concurrent_requests": 5
            },
            ScrapingIntensity.STANDARD: {
                "depth": 2,
                "fields": ["basic_info", "contact_info", "social_profiles"],
                "concurrent_requests": 3
            },
            ScrapingIntensity.PREMIUM: {
                "depth": 3,
                "fields": ["basic_info", "contact_info", "social_profiles", "content_analysis", "network_data"],
                "concurrent_requests": 2
            }
        }
    
    async def enrich_leads(
        self,
        leads: List[Dict],
        platforms: List[PlatformType],
        intensity: ScrapingIntensity
    ) -> List[Dict]:
        """
        Enrich leads with data from specified platforms
        """
        logger.info(
            "Starting lead enrichment",
            lead_count=len(leads),
            platforms=[p.value for p in platforms],
            intensity=intensity.value
        )
        
        config = self.intensity_configs[intensity]
        enriched_leads = []
        
        # Process leads in batches to respect rate limits
        batch_size = config["concurrent_requests"]
        
        for i in range(0, len(leads), batch_size):
            batch = leads[i:i + batch_size]
            
            # Enrich each lead in the batch
            batch_tasks = []
            for lead in batch:
                task = self._enrich_single_lead(lead, platforms, config)
                batch_tasks.append(task)
            
            # Process batch concurrently
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # Collect successful results
            for result in batch_results:
                if isinstance(result, dict):
                    enriched_leads.append(result)
                else:
                    logger.error("Lead enrichment failed", error=str(result))
            
            # Rate limiting between batches
            await asyncio.sleep(1)
        
        logger.info("Lead enrichment complete", enriched_count=len(enriched_leads))
        return enriched_leads
    
    async def _enrich_single_lead(
        self,
        lead: Dict,
        platforms: List[PlatformType],
        config: Dict
    ) -> Dict:
        """
        Enrich a single lead across multiple platforms
        """
        enriched_lead = lead.copy()
        enrichment_data = enriched_lead.get('enrichment_data', {})
        
        for platform in platforms:
            if platform in self.enrichers:
                try:
                    platform_data = await self.enrichers[platform].enrich(
                        lead, config["fields"], config["depth"]
                    )
                    enrichment_data[platform.value] = platform_data
                except Exception as e:
                    logger.error(
                        "Platform enrichment failed",
                        platform=platform.value,
                        lead_id=lead.get('id'),
                        error=str(e)
                    )
        
        # Update enriched lead
        enriched_lead['enrichment_data'] = enrichment_data
        
        # Recalculate quality scores based on enrichment
        enriched_lead.update(self._calculate_enrichment_scores(enriched_lead))
        
        return enriched_lead
    
    def _calculate_enrichment_scores(self, lead: Dict) -> Dict:
        """
        Calculate quality scores based on enrichment data
        """
        enrichment_data = lead.get('enrichment_data', {})
        
        # Base completeness score
        base_fields = ['name', 'business_name', 'phone', 'email', 'website', 'address']
        filled_base = sum(1 for field in base_fields if lead.get(field))
        base_completeness = filled_base / len(base_fields)
        
        # Enrichment bonus
        enrichment_bonus = len(enrichment_data) * 0.1
        total_completeness = min(1.0, base_completeness + enrichment_bonus)
        
        # Quality score (0-100)
        quality_score = int(total_completeness * 100)
        
        # Confidence based on number of platforms and data quality
        platform_count = len(enrichment_data)
        confidence_score = min(0.95, 0.6 + (platform_count * 0.1))
        
        return {
            "quality_score": quality_score,
            "completeness_score": total_completeness,
            "confidence_score": confidence_score
        }


class LinkedInEnricher:
    """LinkedIn platform enricher"""
    
    async def enrich(self, lead: Dict, fields: List[str], depth: int) -> Dict:
        """Enrich lead with LinkedIn data"""
        # Simulate API call delay
        await asyncio.sleep(random.uniform(1, 3))
        
        enrichment = {
            "profile_url": f"https://linkedin.com/in/{lead.get('name', 'unknown').lower().replace(' ', '')}",
            "company_page": f"https://linkedin.com/company/{lead.get('business_name', 'unknown').lower().replace(' ', '-')}",
            "last_updated": "2024-01-15"
        }
        
        if "basic_info" in fields:
            enrichment.update({
                "headline": f"{lead.get('job_title', 'Professional')} at {lead.get('business_name', 'Company')}",
                "industry": lead.get('industry', 'Unknown'),
                "location": lead.get('address', 'Unknown'),
            })
        
        if "social_profiles" in fields and depth >= 2:
            enrichment.update({
                "connections": random.randint(100, 500),
                "company_size": random.choice(["1-10", "11-50", "51-200", "201-500", "500+"]),
                "company_employees": random.randint(10, 1000)
            })
        
        if "content_analysis" in fields and depth >= 3:
            enrichment.update({
                "recent_posts": random.randint(1, 10),
                "engagement_rate": random.uniform(0.02, 0.15),
                "post_topics": random.sample(["business", "industry", "leadership", "innovation"], 2)
            })
        
        return enrichment


class FacebookEnricher:
    """Facebook platform enricher"""
    
    async def enrich(self, lead: Dict, fields: List[str], depth: int) -> Dict:
        """Enrich lead with Facebook data"""
        await asyncio.sleep(random.uniform(0.5, 2))
        
        enrichment = {
            "page_url": f"https://facebook.com/{lead.get('business_name', 'unknown').lower().replace(' ', '')}",
            "last_updated": "2024-01-15"
        }
        
        if "basic_info" in fields:
            enrichment.update({
                "page_likes": random.randint(50, 5000),
                "page_followers": random.randint(60, 5500),
                "about": f"Professional {lead.get('industry', 'business')} services",
                "page_category": lead.get('industry', 'Business')
            })
        
        if "content_analysis" in fields and depth >= 2:
            enrichment.update({
                "recent_posts": random.randint(1, 20),
                "avg_engagement": random.randint(5, 100),
                "post_frequency": "Weekly"
            })
        
        return enrichment


class InstagramEnricher:
    """Instagram platform enricher"""
    
    async def enrich(self, lead: Dict, fields: List[str], depth: int) -> Dict:
        """Enrich lead with Instagram data"""
        await asyncio.sleep(random.uniform(0.5, 2))
        
        enrichment = {
            "profile_url": f"https://instagram.com/{lead.get('business_name', 'unknown').lower().replace(' ', '')}",
            "last_updated": "2024-01-15"
        }
        
        if "basic_info" in fields:
            enrichment.update({
                "followers": random.randint(100, 10000),
                "following": random.randint(50, 1000),
                "posts": random.randint(10, 500),
                "bio": f"{lead.get('industry', 'Business')} • {lead.get('address', 'Location')}"
            })
        
        if "content_analysis" in fields and depth >= 2:
            enrichment.update({
                "avg_likes": random.randint(10, 200),
                "avg_comments": random.randint(1, 50),
                "hashtags_used": random.sample([
                    "#business", "#local", "#service", "#quality", "#professional"
                ], 3)
            })
        
        return enrichment


class GoogleSearchEnricher:
    """Google Search enricher for additional business information"""
    
    async def enrich(self, lead: Dict, fields: List[str], depth: int) -> Dict:
        """Enrich lead with Google Search data"""
        await asyncio.sleep(random.uniform(1, 2))
        
        enrichment = {
            "search_results": f"Found {random.randint(5, 50)} results",
            "last_updated": "2024-01-15"
        }
        
        if "basic_info" in fields:
            enrichment.update({
                "business_hours": "Mon-Fri 9AM-6PM",
                "google_rating": round(random.uniform(3.5, 5.0), 1),
                "review_count": random.randint(10, 200),
                "website_status": "Active"
            })
        
        if "contact_info" in fields and depth >= 2:
            enrichment.update({
                "additional_phones": [f"+1 (555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"],
                "contact_form": "Available",
                "support_email": f"support@{lead.get('business_name', 'business').lower().replace(' ', '')}.com"
            })
        
        if "content_analysis" in fields and depth >= 3:
            enrichment.update({
                "website_keywords": random.sample([
                    lead.get('industry', 'business'), "professional", "service", "quality", "local"
                ], 3),
                "seo_score": random.randint(60, 95),
                "online_mentions": random.randint(5, 50)
            })
        
        return enrichment