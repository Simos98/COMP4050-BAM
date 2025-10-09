#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================"
echo -e " COMP4050 BAM Development Environment"
echo -e "========================================${NC}"
echo

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ] || [ ! -d "backend" ]; then
    handle_error "This script must be run from the project root directory (where package.json, docker-compose.yml, and backend/ are located)"
fi

echo -e "${YELLOW}📍 Running development setup from: $(pwd)${NC}"
echo

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    handle_error "Docker is not installed. Please install Docker Desktop first."
fi

if ! command -v node &> /dev/null; then
    handle_error "Node.js is not installed. Please install Node.js 18+ first."
fi

if ! command -v npm &> /dev/null; then
    handle_error "npm is not available. Please install Node.js with npm included."
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo

# Check if this is first run
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 First run detected - installing dependencies...${NC}"
    echo
    
    echo -e "${YELLOW}🔧 Installing root dependencies...${NC}"
    npm install || handle_error "Failed to install root dependencies"
    
    echo -e "${YELLOW}🔧 Installing backend dependencies...${NC}"
    cd backend
    npm install || handle_error "Failed to install backend dependencies"
    cd ..
    
    echo -e "${YELLOW}🔧 Installing frontend dependencies...${NC}"
    cd frontend
    npm install || handle_error "Failed to install frontend dependencies"
    cd ..
    
    echo -e "${GREEN}✅ Dependencies installed!${NC}"
    echo
fi

echo -e "${YELLOW}🚀 Starting PostgreSQL database...${NC}"
docker-compose up -d postgres || handle_error "Failed to start database"

echo
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"

# Wait for database
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose exec -T postgres pg_isready -U comp4050_user -d comp4050_db >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready!${NC}"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        handle_error "Database failed to start after $max_attempts attempts"
    fi
    
    echo -e "⏳ Waiting... ($attempt/$max_attempts)"
    sleep 2
    ((attempt++))
done

echo
echo -e "${YELLOW}🗄️ Setting up database schema...${NC}"
cd backend
npm run db:generate >/dev/null 2>&1 || handle_error "Failed to generate Prisma client"
npm run db:push >/dev/null 2>&1 || handle_error "Failed to push database schema"
cd ..

echo -e "${GREEN}✅ Database setup complete${NC}"
echo

echo -e "${YELLOW}🔧 Starting backend server...${NC}"
echo -e "${BLUE}📊 Backend: http://localhost:3001${NC}"
echo -e "${BLUE}🗄️ Database Studio: npm run db:studio${NC}"
echo
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo

cd backend
npm run dev
