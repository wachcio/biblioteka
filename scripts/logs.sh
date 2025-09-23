#!/bin/bash

# Library Management System - Logs Viewer
set -e

echo "📋 Library Management System - Logs Viewer"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to show menu
show_menu() {
    echo ""
    echo -e "${BLUE}Select which logs to view:${NC}"
    echo "1) All services"
    echo "2) API only"
    echo "3) Database only"
    echo "4) Web frontend only"
    echo "5) Live logs (all services)"
    echo "6) Exit"
    echo ""
}

# Function to view logs
view_logs() {
    case $1 in
        1)
            echo -e "${GREEN}Showing all service logs...${NC}"
            docker-compose logs
            ;;
        2)
            echo -e "${GREEN}Showing API logs...${NC}"
            docker-compose logs api
            ;;
        3)
            echo -e "${GREEN}Showing database logs...${NC}"
            docker-compose logs db
            ;;
        4)
            echo -e "${GREEN}Showing web frontend logs...${NC}"
            docker-compose logs web
            ;;
        5)
            echo -e "${GREEN}Showing live logs (Press Ctrl+C to exit)...${NC}"
            docker-compose logs -f
            ;;
        6)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-6): " choice
    view_logs $choice

    if [ "$choice" != "5" ] && [ "$choice" != "6" ]; then
        echo ""
        read -p "Press Enter to continue..."
    fi
done