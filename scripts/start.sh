#!/bin/bash

# Library Management System - Quick Start Script
set -e

echo "🚀 Starting Library Management System..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${BLUE}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Start services
echo -e "${BLUE}Starting Docker services...${NC}"
echo -e "${BLUE}Note: Any warnings about unknown variables are harmless and come from Docker system${NC}"
docker compose up -d

# Show status
echo -e "${BLUE}Checking service status...${NC}"
docker compose ps

echo ""
echo -e "${GREEN}🎉 System started successfully!${NC}"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost:8080"
echo "   API: http://localhost:3000"
echo "   API Docs: http://localhost:3000/api/docs"
echo ""
echo "👤 Default credentials:"
echo "   Admin: admin@library.com / password123"
echo "   User: john.doe@example.com / password123"