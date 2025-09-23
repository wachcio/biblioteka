#!/bin/bash

# Quick build test script
set -e

echo "🧪 Testing Docker build..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Testing API build...${NC}"
echo "This will:"
echo "- Install all dependencies (including @nestjs/cli)"
echo "- Build NestJS application"
echo "- Create production image"
echo ""
if docker compose build api; then
    echo -e "${GREEN}✅ API build successful${NC}"
else
    echo -e "${RED}❌ API build failed${NC}"
    echo "Common issues:"
    echo "- Missing @nestjs/cli in devDependencies"
    echo "- TypeScript compilation errors"
    echo "- Missing source files"
    exit 1
fi

echo -e "${BLUE}Testing Web build...${NC}"
echo "This will:"
echo "- Install React dependencies"
echo "- Build React application with Vite"
echo "- Create Nginx production image"
echo ""
if docker compose build web; then
    echo -e "${GREEN}✅ Web build successful${NC}"
else
    echo -e "${RED}❌ Web build failed${NC}"
    echo "Common issues:"
    echo "- TypeScript compilation errors"
    echo "- Missing dependencies"
    echo "- Vite configuration problems"
    exit 1
fi

echo -e "${GREEN}🎉 All builds successful!${NC}"
echo "Ready to run: ./scripts/start.sh"