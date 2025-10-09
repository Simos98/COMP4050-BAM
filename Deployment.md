# Production Deployment Guide

## Prerequisites
- Ubuntu/Debian Linux server
- sudo access
- Internet connection

## Deployment Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/COMP4050-BAM.git
cd COMP4050-BAM
```

### 2. Make Deployment Script Executable
```bash
chmod +x deploy.sh
```

### 3. Run Deployment Script
```bash
./deploy.sh
```

That's it! The script will:
- ✅ Install Docker, Docker Compose, and Node.js (if needed)
- ✅ Install all application dependencies
- ✅ Set up the database
- ✅ Build the application for production
- ✅ Start all services

## After Deployment

### Check Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update Application
```bash
git pull
./deploy.sh
```

## Troubleshooting

### If Docker permission errors occur:
```bash
sudo usermod -aG docker $USER
# Log out and back in, then try again
```

### If port 3001 is in use:
```bash
sudo lsof -i :3001
# Kill the process or change the port in docker-compose.prod.yml
```
```