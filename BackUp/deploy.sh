#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying COMP4050 BAM to production...${NC}"
echo

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    handle_error "This script must be run from the project root directory (where package.json and docker-compose.yml are located)"
fi

echo -e "${YELLOW}📍 Running deployment from: $(pwd)${NC}"
echo

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update || handle_error "Failed to update packages"

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh || handle_error "Failed to download Docker installer"
    sudo sh get-docker.sh || handle_error "Failed to install Docker"
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker installed. You may need to log out and back in for group changes to take effect.${NC}"
    rm get-docker.sh
else
    echo -e "${GREEN}✅ Docker is already installed${NC}"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose || handle_error "Failed to download Docker Compose"
    sudo chmod +x /usr/local/bin/docker-compose || handle_error "Failed to make Docker Compose executable"
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose is already installed${NC}"
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js 18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - || handle_error "Failed to setup Node.js repository"
    sudo apt-get install -y nodejs || handle_error "Failed to install Node.js"
    echo -e "${GREEN}✅ Node.js installed${NC}"
else
    echo -e "${GREEN}✅ Node.js is already installed ($(node --version))${NC}"
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    handle_error "npm is not available. Please install Node.js with npm included."
fi

echo
echo -e "${YELLOW}🔧 Setting up application dependencies...${NC}"

# Install root dependencies
echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
npm install || handle_error "Failed to install root dependencies"

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
npm install || handle_error "Failed to install backend dependencies"
cd ..

# Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install || handle_error "Failed to install frontend dependencies"
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo

# Setup database and generate Prisma client
echo -e "${YELLOW}🗄️ Setting up database...${NC}"
docker-compose up -d postgres || handle_error "Failed to start database"

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
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

# Generate Prisma client and push schema
echo -e "${YELLOW}🔧 Setting up database schema...${NC}"
cd backend
npm run db:generate || handle_error "Failed to generate Prisma client"
npm run db:push || handle_error "Failed to push database schema"
cd ..

echo -e "${GREEN}✅ Database setup complete${NC}"
echo

# Build application for production
echo -e "${YELLOW}🏗️ Building application for production...${NC}"
cd backend
npm run build || handle_error "Failed to build backend"
cd ..

cd frontend
npm run build || handle_error "Failed to build frontend"
cd ..

echo -e "${GREEN}✅ Application built successfully${NC}"
echo

# Start production services
echo -e "${YELLOW}🚀 Starting production services...${NC}"
docker-compose -f docker-compose.prod.yml up -d || handle_error "Failed to start production services"

echo
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}🌐 Application should be running on port 3001${NC}"
echo -e "${BLUE}📊 Check status: docker-compose -f docker-compose.prod.yml ps${NC}"
echo -e "${BLUE}📋 View logs: docker-compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "${BLUE}🛑 Stop services: docker-compose -f docker-compose.prod.yml down${NC}"
echo
