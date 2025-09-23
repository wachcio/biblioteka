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
if docker compose build api; then
    echo -e "${GREEN}✅ API build successful${NC}"
else
    echo -e "${RED}❌ API build failed${NC}"
    exit 1
fi

echo -e "${BLUE}Testing Web build...${NC}"
if docker compose build web; then
    echo -e "${GREEN}✅ Web build successful${NC}"
else
    echo -e "${RED}❌ Web build failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 All builds successful!${NC}"
echo "Ready to run: ./scripts/start.sh"