#!/bin/bash

# Library Management System Deployment Script
set -e

echo "🚀 Starting Library Management System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."

    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please review and update .env file with your configuration"
    else
        print_success ".env file exists"
    fi
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."

    # Stop existing containers
    docker-compose down --remove-orphans

    # Build images
    print_status "Building Docker images..."
    docker-compose build --no-cache

    # Start services
    print_status "Starting services..."
    docker-compose up -d

    print_success "Services started successfully"
}

# Wait for services
wait_for_services() {
    print_status "Waiting for services to be ready..."

    # Wait for database
    print_status "Waiting for database..."
    until docker-compose exec -T db mysqladmin ping -h localhost --silent; do
        echo -n "."
        sleep 2
    done
    print_success "Database is ready"

    # Wait for API
    print_status "Waiting for API..."
    until curl -f http://localhost:3000/api/health &> /dev/null; do
        echo -n "."
        sleep 2
    done
    print_success "API is ready"

    # Wait for Web
    print_status "Waiting for web frontend..."
    until curl -f http://localhost:8080 &> /dev/null; do
        echo -n "."
        sleep 2
    done
    print_success "Web frontend is ready"
}

# Run health checks
health_checks() {
    print_status "Running health checks..."

    # Check API health
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        print_success "API health check passed"
    else
        print_error "API health check failed"
        return 1
    fi

    # Check frontend
    if curl -f http://localhost:8080 &> /dev/null; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        return 1
    fi

    # Check database
    if docker-compose exec -T db mysqladmin ping -h localhost --silent; then
        print_success "Database health check passed"
    else
        print_error "Database health check failed"
        return 1
    fi
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps

    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📱 Access your application:"
    echo "   Frontend: http://localhost:8080"
    echo "   API: http://localhost:3000"
    echo "   API Docs: http://localhost:3000/api/docs"
    echo "   phpMyAdmin: http://localhost:8081 (if enabled)"
    echo ""
    echo "👤 Default credentials:"
    echo "   Admin: admin@library.com / password123"
    echo "   User: john.doe@example.com / password123"
    echo ""
    echo "🐳 Docker commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
}

# Main deployment process
main() {
    echo "📚 Library Management System Deployment"
    echo "======================================"

    check_prerequisites
    setup_environment
    deploy_services
    wait_for_services

    if health_checks; then
        show_status
    else
        print_error "Health checks failed. Please check the logs:"
        echo "docker-compose logs"
        exit 1
    fi
}

# Run main function
main "$@"