#!/bin/bash

# Library Management System - Clean Script
set -e

echo "🧹 Cleaning Library Management System..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Stop all services
echo -e "${BLUE}Stopping all services...${NC}"
docker compose down --remove-orphans || true

# Clean Docker cache and images
echo -e "${BLUE}Cleaning Docker images and cache...${NC}"
docker system prune -f
docker builder prune -f

# Remove project-specific volumes (optional)
read -p "Remove project volumes and data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Removing project volumes...${NC}"
    docker compose down -v
    docker volume prune -f
    echo -e "${RED}⚠️  All project data has been removed${NC}"
fi

# Clean node_modules (optional)
read -p "Remove node_modules folders? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Removing node_modules...${NC}"
    rm -rf api/node_modules
    rm -rf web/node_modules
    echo -e "${GREEN}✅ node_modules removed${NC}"
fi

echo -e "${GREEN}🎉 Cleanup completed!${NC}"
echo ""
echo "To rebuild everything fresh:"
echo "1. ./scripts/start.sh (quick start)"
echo "2. ./scripts/deploy.sh (full deployment)"