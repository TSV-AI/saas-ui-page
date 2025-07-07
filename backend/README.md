# Lead Scraper Backend

A comprehensive multi-stage lead enrichment scraper system built with FastAPI, Celery, and PostgreSQL.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Authentication │  Rate Limiting │  Request Routing        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Orchestration Service                       │
├─────────────────────────────────────────────────────────────┤
│  Job Management │  Pipeline Control │  Status Tracking     │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Entry Point    │ │  Enrichment     │ │  Export &       │
│  Discovery      │ │  Services       │ │  Storage        │
│  Service        │ │                 │ │  Services       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🚀 Features

### Core Functionality
- **Multi-Platform Discovery**: Google Maps, Google Business, LinkedIn integration
- **Intelligent Enrichment**: Facebook, Instagram, Google Search data augmentation
- **Scalable Processing**: Celery-based distributed task queue
- **Anti-Detection**: User agent rotation, proxy support, human-like behavior
- **Real-time Monitoring**: Prometheus metrics, structured logging
- **Export Capabilities**: CSV, JSON, XLSX format support

### Scraping Intensity Levels
- **Basic**: Entry point discovery only
- **Standard**: Single-level enrichment
- **Premium**: Deep enrichment with content analysis

### Supported Platforms
- ✅ Google Maps (Primary discovery)
- ✅ Google Business Listings
- ✅ LinkedIn (Companies & Profiles)
- ✅ Facebook (Business Pages)
- ✅ Instagram (Business Profiles)
- ✅ Google Search (Additional info)

## 🛠️ Technology Stack

- **API Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 15+ with SQLAlchemy 2.0
- **Task Queue**: Celery 5.3+ with Redis
- **Web Scraping**: Playwright, BeautifulSoup, Selenium
- **Monitoring**: Prometheus, Structlog, Flower
- **Containerization**: Docker & Docker Compose
- **Anti-Detection**: Fake UserAgent, Proxy rotation

## 📦 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for local development)
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start with Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f api
```

### 3. Access Services
- **API Documentation**: http://localhost:8000/docs
- **Flower Monitoring**: http://localhost:5555
- **API Health Check**: http://localhost:8000/health

### 4. Run Your First Scraping Job

```bash
curl -X POST "http://localhost:8000/api/v1/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "restaurants",
    "location": "San Francisco, CA",
    "radius": 10,
    "max_results": 50,
    "keywords": ["pizza", "italian"],
    "intensity": "standard",
    "platforms": ["google_maps", "facebook"]
  }'
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://user:pass@localhost:5432/lead_scraper` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `API_DEBUG` | Enable debug mode | `false` |
| `MAX_CONCURRENT_JOBS` | Maximum concurrent jobs | `5` |
| `SCRAPING_RATE_LIMIT` | Requests per second | `10` |
| `PROXY_ENABLED` | Enable proxy rotation | `false` |
| `HUMAN_LIKE_DELAYS` | Enable human-like delays | `true` |

### Scraping Configuration

```python
# Example scraping request
{
    "industry": "tech startups",
    "location": "Austin, TX", 
    "radius": 25,
    "max_results": 100,
    "keywords": ["saas", "software", "ai"],
    "job_title": "founder",
    "platforms": ["google_maps", "linkedin", "facebook"],
    "intensity": "premium"
}
```

## 📊 API Endpoints

### Job Management
- `POST /api/v1/jobs` - Create scraping job
- `GET /api/v1/jobs/{job_id}` - Get job status
- `GET /api/v1/jobs/{job_id}/results` - Get job results
- `DELETE /api/v1/jobs/{job_id}` - Cancel job
- `GET /api/v1/jobs` - List jobs

### Exports
- `POST /api/v1/jobs/{job_id}/export` - Export results
- `GET /api/v1/exports/{export_id}/download` - Download export

### System
- `GET /health` - Health check
- `GET /api/v1/stats` - System statistics
- `GET /metrics` - Prometheus metrics

## 🔍 Monitoring & Observability

### Prometheus Metrics
- `scraping_requests_total` - Total scraping requests
- `scraping_duration_seconds` - Operation duration
- `active_scraping_jobs` - Currently active jobs
- `leads_found_total` - Total leads discovered
- `scraping_errors_total` - Error counts

### Structured Logging
```json
{
  "timestamp": "2024-01-15T10:30:45Z",
  "level": "INFO",
  "event": "job_completed",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "leads_found": 42,
  "duration": 120.5,
  "platform": "google_maps"
}
```

### Health Checks
```bash
# API Health
curl http://localhost:8000/health

# Database Health
docker-compose exec db pg_isready

# Redis Health  
docker-compose exec redis redis-cli ping

# Worker Health
docker-compose exec worker-jobs celery -A scraper.tasks.celery_app inspect active
```

## 🧪 Development

### Local Development Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Run database migrations
alembic upgrade head

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Running Tests
```bash
# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# All tests with coverage
pytest --cov=scraper tests/
```

### Code Quality
```bash
# Format code
black scraper/
isort scraper/

# Type checking
mypy scraper/

# Linting
flake8 scraper/
```

## 🔒 Security Considerations

### Anti-Detection Features
- User agent rotation (50+ agents)
- Proxy rotation and health checking
- Human-like delays and typing patterns
- Canvas fingerprint randomization
- WebDriver property masking

### Rate Limiting
- Global API rate limits
- Platform-specific rate limits
- Exponential backoff on failures
- Circuit breaker pattern

### Data Protection
- No storing of personal data beyond business info
- Automatic data expiration (30 days)
- Secure database connections
- Input validation and sanitization

## 📈 Performance

### Benchmarks
- **Discovery Rate**: ~100 leads/minute (Google Maps)
- **Enrichment Rate**: ~50 leads/minute (multi-platform)
- **Memory Usage**: ~200MB base + 50MB per worker
- **Database Performance**: 1000+ operations/second

### Scaling
- Horizontal worker scaling
- Database connection pooling
- Redis cluster support
- Load balancer configuration

## 🚨 Troubleshooting

### Common Issues

**Job Stuck in Queue**
```bash
# Check worker status
docker-compose logs worker-jobs

# Restart workers
docker-compose restart worker-jobs worker-discovery worker-enrichment
```

**Browser/Playwright Issues**
```bash
# Reinstall browsers
docker-compose exec api playwright install chromium

# Check browser process
docker-compose exec api ps aux | grep chrome
```

**Database Connection Issues**
```bash
# Check database
docker-compose logs db

# Test connection
docker-compose exec api python -c "from scraper.models import init_db; import asyncio; asyncio.run(init_db())"
```

### Performance Tuning

**High Memory Usage**
- Reduce worker concurrency
- Enable browser resource blocking
- Implement connection pooling

**Slow Response Times**
- Add database indexes
- Optimize query patterns
- Enable Redis caching

## 📚 API Documentation

Full API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` endpoint
- **Issues**: Create GitHub issue
- **Email**: support@leadscraper.com

---

**Built with ❤️ for lead generation professionals**