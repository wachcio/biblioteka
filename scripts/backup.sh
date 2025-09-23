#!/bin/bash

# Library Management System - Database Backup Script
set -e

echo "💾 Library Management System - Database Backup"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="library_backup_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Check if database container is running
if ! docker-compose ps db | grep -q "Up"; then
    echo -e "${RED}❌ Database container is not running${NC}"
    echo "Please start the system first: ./scripts/start.sh"
    exit 1
fi

echo -e "${BLUE}Creating database backup...${NC}"

# Create backup
docker-compose exec -T db mysqldump \
    -u library \
    -pchange_me_in_production \
    library > "${BACKUP_DIR}/${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created successfully: ${BACKUP_DIR}/${BACKUP_FILE}${NC}"

    # Show backup size
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    echo -e "${BLUE}Backup size: ${BACKUP_SIZE}${NC}"

    # List recent backups
    echo -e "${BLUE}Recent backups:${NC}"
    ls -lht $BACKUP_DIR | head -6
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi

# Cleanup old backups (keep only last 10)
echo -e "${BLUE}Cleaning up old backups (keeping last 10)...${NC}"
cd $BACKUP_DIR && ls -t library_backup_*.sql | tail -n +11 | xargs -r rm
cd ..

echo -e "${GREEN}🎉 Backup process completed${NC}"