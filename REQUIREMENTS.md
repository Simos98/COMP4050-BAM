# BioScope Requirements Document

## 1. Project Overview
BioScope is a laboratory equipment management system enabling users to book and manage lab devices while providing administrators with oversight capabilities.

## 2. User Stories

### As a Student/Regular User
- I want to view available lab equipment so I can plan my experiments
- I want to book equipment for specific time slots so I can conduct my research
- I want to see my booking history so I can track my lab usage
- I want to cancel my bookings when my plans change
- I want to receive confirmation of my bookings so I'm assured they're registered
- I want to filter devices by lab location so I can find convenient equipment
- I want to view device details so I can ensure it meets my needs
- I want to add notes to my bookings so I can record specific requirements
- I want to see if a device is available before booking so I don't waste time
- I want to modify my profile information to keep it current

### As a Lab Administrator
- I want to approve/reject booking requests to manage lab resources
- I want to view all bookings to monitor lab usage
- I want to add new devices when equipment is purchased
- I want to mark devices as unavailable during maintenance
- I want to generate usage reports to track lab utilization
- I want to manage user accounts to ensure proper access
- I want to see booking conflicts to prevent scheduling issues
- I want to categorize devices by lab for better organization
- I want to set booking rules to ensure fair resource allocation
- I want to view user booking history to track equipment usage

### As a System Administrator
- I want to manage admin accounts to control system access
- I want to configure system settings to maintain optimal operation
- I want to monitor system performance to ensure reliability
- I want to backup system data to prevent information loss
- I want to manage authentication to ensure security
- I want to view system logs to troubleshoot issues
- I want to update system parameters without downtime
- I want to manage API access to control integrations
- I want to monitor error rates to maintain system health
- I want to implement security policies to protect the system

## 3. System Architecture
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT-based

## 4. Core Features

### 4.1 Authentication & Authorization
- [x] User registration and login
- [x] Role-based access (Admin/User)
- [x] Protected routes
- [x] Session management
- [x] JWT token handling

### 4.2 Device Management
- [x] View available devices
- [x] Search and filter functionality
- [x] Device details display
- [x] Admin CRUD operations
- [x] Lab categorization
- [x] Availability tracking

### 4.3 Booking System
- [x] Create booking requests
- [x] View booking details
- [x] Cancel bookings
- [x] Admin approval workflow
- [x] Conflict prevention
- [x] Booking history
- [x] Status updates

## 5. Technical Requirements

### 5.1 Frontend
```typescript
- React 18+
- TypeScript
- Vite build tool
- Ant Design components
- React Router v6
- Context API
- Axios HTTP client
- Jest/Vitest testing
```

### 5.2 Backend
```typescript
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Jest testing
```

## 6. Database Schema

### 6.1 Core Models
```prisma
model User {
    id        String    @id @default(uuid())
    email     String    @unique
    name      String
    role      Role      @default(USER)
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
}

model Device {
    id        String    @id @default(uuid())
    deviceId  String    @unique
    lab       String
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
}

model Booking {
    id        String    @id @default(uuid())
    userId    String
    deviceId  String
    startTime DateTime
    endTime   DateTime
    status    Status    @default(PENDING)
    notes     String?
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
}
```

## 7. API Endpoints

### 7.1 Authentication
- POST `/api/auth/login`
- POST `/api/auth/signup`
- GET `/api/auth/me`
- POST `/api/auth/logout`

### 7.2 Devices
- GET `/api/devices`
- POST `/api/devices`
- GET `/api/devices/:id`
- PUT `/api/devices/:id`
- DELETE `/api/devices/:id`
- GET `/api/devices/check-availability`

### 7.3 Bookings
- GET `/api/bookings`
- POST `/api/bookings`
- GET `/api/bookings/:id`
- PATCH `/api/bookings/:id/status`
- DELETE `/api/bookings/:id`

## 8. Security Requirements
- HTTPS encryption
- Password hashing
- JWT token security
- XSS protection
- CSRF protection
- Input validation
- Rate limiting

## 9. Performance Requirements
- Page load time < 2s
- API response time < 500ms
- Support 100+ concurrent users
- Handle 1000+ bookings
- Efficient database queries
- Response caching

## 10. Testing Requirements
- Unit tests for components
- API endpoint testing
- Integration tests
- E2E testing
- Cross-browser testing
- Security testing

## 11. Development Workflow
1. Feature branching
2. Code review process
3. CI/CD pipeline
4. Testing requirements
5. Documentation updates

## 12. Project Structure
```
backend/
├── prisma/               # Database schema and migrations
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
└── tests/               # Test files

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/        # React context providers
│   ├── pages/          # Page components
│   ├── routes/         # Routing logic
│   ├── services/       # API clients
│   └── types.ts        # TypeScript types
└── tests/              # Test files
```

## 13. Future Enhancements
- Mobile application
- Email notifications
- Equipment maintenance tracking
- Advanced analytics
- Calendar integration
- Multi-language support
- Dark mode
- Accessibility improvements

## 14. Documentation
- API documentation
- User manual
- Admin guide
- Development setup guide
- Deployment guide
- Security protocols

## 15. Maintenance
- Regular security updates
- Performance monitoring
- Bug fixes
- Feature updates
- User feedback implementation

---

*Last Updated: October 31, 2023*  
*Version: 1.0.0*