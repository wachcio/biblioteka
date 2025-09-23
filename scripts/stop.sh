#!/bin/bash

# Library Management System - Stop Script
set -e

echo "🛑 Stopping Library Management System..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Stop services
echo -e "${BLUE}Stopping Docker services...${NC}"
docker-compose down

echo -e "${GREEN}✅ All services stopped${NC}"

# Ask if user wants to remove volumes
read -p "Do you want to remove database volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Removing volumes...${NC}"
    docker-compose down -v
    echo -e "${RED}⚠️  All data has been removed${NC}"
else
    echo -e "${GREEN}Data volumes preserved${NC}"
fi