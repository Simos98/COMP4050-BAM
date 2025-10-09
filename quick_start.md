# Quick Start Guide

## Prerequisites
- Docker Desktop
- Node.js 18+

## Development Setup

### Windows Users
```batch
git clone <your-repo-url>
cd COMP4050-BAM
dev.bat
```

### Linux/Mac Users
```bash
git clone <your-repo-url>
cd COMP4050-BAM
chmod +x dev.sh
./dev.sh
```

### Production Deployment (Linux)
```bash
git clone <your-repo-url>
cd COMP4050-BAM
chmod +x deploy.sh
./deploy.sh
```

## What Each Script Does

### Development Scripts (`dev.sh` / `dev.bat`)
1. ✅ Checks prerequisites (Docker, Node.js)
2. ✅ Installs dependencies (first run only)
3. ✅ Starts PostgreSQL database
4. ✅ Sets up database schema
5. ✅ Starts backend development server

### Production Script (`deploy.sh`)
1. ✅ Installs system dependencies (Docker, Node.js)
2. ✅ Installs application dependencies
3. ✅ Sets up database
4. ✅ Builds application for production
5. ✅ Starts production services

## After Running
- **Backend**: http://localhost:3001
- **Database Studio**: `npm run db:studio`
- **Stop Services**: Ctrl+C