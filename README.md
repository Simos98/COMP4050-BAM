# COMP4050 BAM Project

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+

### Setup (First Time)
```bash
git clone <repo-url>
cd COMP4050-BAM
npm run setup          # Install dependencies + setup database
```

### Development
```bash
# Start backend development (database + backend)
npm run dev

# Start full development (database + backend + frontend)
npm run dev:full       # Available when frontend is ready

# Individual services
npm run db:start       # Database only
npm run backend:dev    # Backend only  
npm run frontend:dev   # Frontend only
```

### Database Management
```bash
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Add sample data
npm run db:reset       # Reset database (⚠️ deletes data)
npm run db:logs        # View database logs
```

### Testing
```bash
npm run backend:test   # Test database connection
```
```