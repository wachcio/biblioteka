#!/bin/bash

# Debug script to check environment and Docker configuration
echo "🔍 Library Management System - Debug Information"
echo "================================================"

# Check current directory
echo "📁 Current directory:"
pwd
echo ""

# Check .env file
echo "📄 .env file status:"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "File size: $(ls -lh .env | awk '{print $5}')"
    echo "File permissions: $(ls -l .env | awk '{print $1}')"
    echo ""
    echo "📄 .env contents (first 10 lines):"
    head -10 .env
else
    echo "❌ .env file does not exist"
fi
echo ""

# Check Docker version
echo "🐳 Docker information:"
docker --version 2>/dev/null || echo "Docker not installed"
docker compose version 2>/dev/null || echo "Docker Compose not available"
echo ""

# Check for any environment variables with strange names
echo "🔍 Checking for unusual environment variables:"
env | grep -E '^[a-zA-Z0-9_]{6}=' | head -10 || echo "No unusual variables found"
echo ""

# Check Docker Compose config
echo "⚙️  Docker Compose configuration:"
if docker compose config --quiet 2>/dev/null; then
    echo "✅ Docker Compose config is valid"
else
    echo "❌ Docker Compose config has issues:"
    docker compose config 2>&1 | head -10
fi
echo ""

# Check for Docker context or buildx issues
echo "🔧 Docker context and buildx:"
docker context list 2>/dev/null | head -3 || echo "Cannot check Docker context"
docker buildx ls 2>/dev/null | head -3 || echo "Cannot check Docker buildx"
echo ""

# Check project structure
echo "📊 Project structure:"
ls -la | grep -E "(env|docker|scripts)"
echo ""

echo "🎯 Recommendations:"
echo "1. If you see warnings about 'fr8MC9', they likely come from Docker system"
echo "2. Run: ./scripts/clean.sh to clean Docker cache"
echo "3. Then: ./scripts/start.sh for fresh deployment"