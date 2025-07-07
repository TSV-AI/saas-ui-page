"""
Monitoring and Metrics Utilities
Provides comprehensive monitoring for the scraping system
"""

import time
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Optional

import structlog
from prometheus_client import Counter, Gauge, Histogram

logger = structlog.get_logger(__name__)

# Prometheus Metrics
scraping_requests_total = Counter(
    'scraping_requests_total',
    'Total number of scraping requests',
    ['platform', 'status', 'intensity']
)

scraping_duration_seconds = Histogram(
    'scraping_duration_seconds',
    'Duration of scraping operations',
    ['platform', 'operation'],
    buckets=[1, 5, 10, 30, 60, 120, 300, 600]
)

active_jobs_gauge = Gauge(
    'active_scraping_jobs',
    'Number of currently active scraping jobs'
)

leads_found_total = Counter(
    'leads_found_total',
    'Total number of leads found',
    ['platform', 'source']
)

error_count_total = Counter(
    'scraping_errors_total',
    'Total number of scraping errors',
    ['platform', 'error_type']
)

proxy_requests_total = Counter(
    'proxy_requests_total',
    'Total proxy requests',
    ['proxy_type', 'status']
)

database_operations_total = Counter(
    'database_operations_total',
    'Total database operations',
    ['operation', 'table', 'status']
)

celery_task_duration = Histogram(
    'celery_task_duration_seconds',
    'Duration of Celery tasks',
    ['task_name', 'status'],
    buckets=[1, 5, 10, 30, 60, 120, 300, 600, 1200]
)


class MonitoringService:
    """
    Central monitoring service for tracking system metrics and events
    """
    
    def __init__(self):
        self.logger = structlog.get_logger(__name__)
        self.start_time = time.time()
    
    @asynccontextmanager
    async def track_operation(self, operation: str, platform: str = "unknown"):
        """
        Context manager for tracking operation duration and status
        """
        start_time = time.time()
        operation_logger = self.logger.bind(operation=operation, platform=platform)
        
        try:
            operation_logger.info("Operation started")
            yield
            
            # Record success
            duration = time.time() - start_time
            scraping_duration_seconds.labels(
                platform=platform,
                operation=operation
            ).observe(duration)
            
            scraping_requests_total.labels(
                platform=platform,
                status="success",
                intensity="unknown"
            ).inc()
            
            operation_logger.info("Operation completed", duration=duration)
            
        except Exception as e:
            # Record failure
            duration = time.time() - start_time
            error_type = type(e).__name__
            
            error_count_total.labels(
                platform=platform,
                error_type=error_type
            ).inc()
            
            scraping_requests_total.labels(
                platform=platform,
                status="error",
                intensity="unknown"
            ).inc()
            
            operation_logger.error(
                "Operation failed",
                duration=duration,
                error=str(e),
                error_type=error_type
            )
            raise
    
    def track_leads_found(self, platform: str, source: str, count: int):
        """Track number of leads found"""
        leads_found_total.labels(
            platform=platform,
            source=source
        ).inc(count)
        
        self.logger.info(
            "Leads found",
            platform=platform,
            source=source,
            count=count
        )
    
    def track_job_status_change(self, job_id: str, old_status: str, new_status: str):
        """Track job status changes"""
        if new_status == "processing":
            active_jobs_gauge.inc()
        elif old_status == "processing" and new_status in ["completed", "failed", "cancelled"]:
            active_jobs_gauge.dec()
        
        self.logger.info(
            "Job status changed",
            job_id=job_id,
            old_status=old_status,
            new_status=new_status
        )
    
    def track_proxy_usage(self, proxy_type: str, success: bool):
        """Track proxy usage and success rate"""
        status = "success" if success else "failure"
        proxy_requests_total.labels(
            proxy_type=proxy_type,
            status=status
        ).inc()
    
    def track_database_operation(self, operation: str, table: str, success: bool):
        """Track database operation metrics"""
        status = "success" if success else "failure"
        database_operations_total.labels(
            operation=operation,
            table=table,
            status=status
        ).inc()
    
    def track_celery_task(self, task_name: str, duration: float, success: bool):
        """Track Celery task performance"""
        status = "success" if success else "failure"
        celery_task_duration.labels(
            task_name=task_name,
            status=status
        ).observe(duration)
    
    def get_system_health(self) -> Dict:
        """Get current system health metrics"""
        uptime = time.time() - self.start_time
        
        return {
            "uptime_seconds": uptime,
            "active_jobs": active_jobs_gauge._value._value,
            "total_requests": sum([
                scraping_requests_total.labels(p, s, i)._value._value
                for p in ["google_maps", "linkedin", "facebook"]
                for s in ["success", "error"]
                for i in ["basic", "standard", "premium"]
            ]),
            "total_errors": sum([
                error_count_total.labels(p, e)._value._value
                for p in ["google_maps", "linkedin", "facebook"]
                for e in ["timeout", "blocked", "parse_error"]
            ]),
            "timestamp": datetime.utcnow().isoformat()
        }


class PerformanceProfiler:
    """
    Performance profiler for detailed operation analysis
    """
    
    def __init__(self):
        self.profiles = {}
    
    @asynccontextmanager
    async def profile(self, operation_id: str, tags: Optional[Dict] = None):
        """Profile an operation with detailed metrics"""
        start_time = time.time()
        start_memory = self._get_memory_usage()
        
        profile_data = {
            "operation_id": operation_id,
            "start_time": start_time,
            "start_memory": start_memory,
            "tags": tags or {},
            "checkpoints": []
        }
        
        try:
            yield ProfilerContext(profile_data)
            
            # Record completion
            end_time = time.time()
            end_memory = self._get_memory_usage()
            
            profile_data.update({
                "end_time": end_time,
                "end_memory": end_memory,
                "duration": end_time - start_time,
                "memory_delta": end_memory - start_memory,
                "status": "success"
            })
            
        except Exception as e:
            end_time = time.time()
            end_memory = self._get_memory_usage()
            
            profile_data.update({
                "end_time": end_time,
                "end_memory": end_memory,
                "duration": end_time - start_time,
                "memory_delta": end_memory - start_memory,
                "status": "error",
                "error": str(e)
            })
            raise
        finally:
            self.profiles[operation_id] = profile_data
            self._log_profile(profile_data)
    
    def _get_memory_usage(self) -> float:
        """Get current memory usage in MB"""
        try:
            import psutil
            import os
            process = psutil.Process(os.getpid())
            return process.memory_info().rss / 1024 / 1024  # MB
        except ImportError:
            return 0.0
    
    def _log_profile(self, profile_data: Dict):
        """Log profile data"""
        logger.info(
            "Operation profile",
            operation_id=profile_data["operation_id"],
            duration=profile_data["duration"],
            memory_delta=profile_data["memory_delta"],
            status=profile_data["status"],
            checkpoints=len(profile_data["checkpoints"])
        )


class ProfilerContext:
    """Context for profiler checkpoints"""
    
    def __init__(self, profile_data: Dict):
        self.profile_data = profile_data
    
    def checkpoint(self, name: str, data: Optional[Dict] = None):
        """Add a checkpoint to the profile"""
        checkpoint = {
            "name": name,
            "timestamp": time.time(),
            "memory": self._get_memory_usage(),
            "data": data or {}
        }
        self.profile_data["checkpoints"].append(checkpoint)
    
    def _get_memory_usage(self) -> float:
        """Get current memory usage in MB"""
        try:
            import psutil
            import os
            process = psutil.Process(os.getpid())
            return process.memory_info().rss / 1024 / 1024  # MB
        except ImportError:
            return 0.0


class AlertManager:
    """
    Manages alerts and notifications for system events
    """
    
    def __init__(self):
        self.alert_thresholds = {
            "error_rate": 0.1,  # 10% error rate
            "response_time": 60,  # 60 seconds
            "memory_usage": 1024,  # 1GB
            "queue_size": 100,  # 100 pending jobs
        }
    
    async def check_system_health(self) -> Dict:
        """Check system health and trigger alerts if needed"""
        alerts = []
        
        # Check error rates
        # Implementation would check actual metrics
        
        # Check response times
        # Implementation would check actual metrics
        
        # Check memory usage
        # Implementation would check actual metrics
        
        # Check queue sizes
        # Implementation would check actual metrics
        
        return {
            "status": "healthy" if not alerts else "warning",
            "alerts": alerts,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def send_alert(self, alert_type: str, message: str, severity: str = "warning"):
        """Send alert notification"""
        alert_data = {
            "type": alert_type,
            "message": message,
            "severity": severity,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.warning("Alert triggered", **alert_data)
        
        # Here you would integrate with actual alerting systems:
        # - Email notifications
        # - Slack webhooks
        # - PagerDuty
        # - etc.


# Global monitoring service instance
monitoring_service = MonitoringService()
performance_profiler = PerformanceProfiler()
alert_manager = AlertManager()