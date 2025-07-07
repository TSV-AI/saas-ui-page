#!/bin/bash

# Lead Scraper Startup Script
# This script starts the complete lead scraper system

set -e

echo "🚀 Starting Lead Scraper System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Use docker compose if available, fallback to docker-compose
if docker compose version > /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p exports
mkdir -p docker/ssl

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before continuing."
    read -p "Press Enter to continue after editing .env file..."
fi

# Build and start services
print_status "Building Docker images..."
$COMPOSE_CMD build --no-cache

print_status "Starting services..."
$COMPOSE_CMD up -d

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check database
if $COMPOSE_CMD exec -T db pg_isready -U scraper_user -d lead_scraper > /dev/null 2>&1; then
    print_success "Database is healthy"
else
    print_error "Database is not healthy"
    $COMPOSE_CMD logs db
    exit 1
fi

# Check Redis
if $COMPOSE_CMD exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is healthy"
else
    print_error "Redis is not healthy"
    $COMPOSE_CMD logs redis
    exit 1
fi

# Check API
sleep 5
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_success "API is healthy"
else
    print_error "API is not healthy"
    $COMPOSE_CMD logs api
    exit 1
fi

# Check workers
if $COMPOSE_CMD exec -T worker-jobs celery -A scraper.tasks.celery_app inspect ping > /dev/null 2>&1; then
    print_success "Workers are healthy"
else
    print_warning "Workers may still be starting up..."
fi

print_success "🎉 Lead Scraper System is running!"

echo ""
echo "📋 Service Status:"
$COMPOSE_CMD ps

echo ""
echo "🌐 Access Points:"
echo "  • API Documentation: http://localhost:8000/docs"
echo "  • API Health Check:  http://localhost:8000/health"
echo "  • Flower Monitoring: http://localhost:5555"
echo "  • System Stats:      http://localhost:8000/api/v1/stats"

echo ""
echo "📊 Useful Commands:"
echo "  • View logs:         $COMPOSE_CMD logs -f [service]"
echo "  • Stop system:       $COMPOSE_CMD down"
echo "  • Restart service:   $COMPOSE_CMD restart [service]"
echo "  • Scale workers:     $COMPOSE_CMD up -d --scale worker-jobs=3"

echo ""
echo "🧪 Test the API:"
echo "curl -X POST \"http://localhost:8000/api/v1/jobs\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"industry\": \"restaurants\","
echo "    \"location\": \"San Francisco, CA\","
echo "    \"radius\": 10,"
echo "    \"max_results\": 50,"
echo "    \"keywords\": [\"pizza\", \"italian\"],"
echo "    \"intensity\": \"standard\","
echo "    \"platforms\": [\"google_maps\", \"facebook\"]"
echo "  }'"

echo ""
print_success "System startup complete! 🚀"