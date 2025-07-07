"""
Celery Application Configuration
"""

from celery import Celery
from kombu import Queue

from scraper.config.settings import settings

# Create Celery app
app = Celery('lead_scraper')

# Configure Celery
app.conf.update(
    # Broker and Result Backend
    broker_url=settings.CELERY_BROKER_URL,
    result_backend=settings.CELERY_RESULT_BACKEND,
    
    # Task Routing
    task_routes={
        'scraper.tasks.scraping_tasks.discover_leads': {'queue': 'discovery'},
        'scraper.tasks.scraping_tasks.enrich_lead': {'queue': 'enrichment'},
        'scraper.tasks.scraping_tasks.export_results': {'queue': 'export'},
        'scraper.tasks.scraping_tasks.process_job_pipeline': {'queue': 'jobs'},
    },
    
    # Default Queue Configuration
    task_default_queue='default',
    task_queues=[
        Queue('default', routing_key='default'),
        Queue('discovery', routing_key='discovery'),
        Queue('enrichment', routing_key='enrichment'),
        Queue('export', routing_key='export'),
        Queue('jobs', routing_key='jobs'),
    ],
    
    # Worker Configuration
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=1000,
    
    # Task Configuration
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Retry Configuration
    task_reject_on_worker_lost=True,
    task_default_retry_delay=60,
    task_max_retries=3,
    
    # Result Configuration
    result_expires=3600,  # 1 hour
    result_persistent=True,
    
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
    
    # Rate Limiting
    task_annotations={
        'scraper.tasks.scraping_tasks.discover_leads': {
            'rate_limit': '10/m'  # 10 per minute
        },
        'scraper.tasks.scraping_tasks.enrich_lead': {
            'rate_limit': '20/m'  # 20 per minute
        },
    }
)

# Auto-discover tasks
app.autodiscover_tasks(['scraper.tasks'])

if __name__ == '__main__':
    app.start()