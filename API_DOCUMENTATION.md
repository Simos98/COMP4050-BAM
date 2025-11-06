# BioScope API Documentation

This document describes the REST API for the BioScope Lab Equipment Management System. It is intended for frontend developers, integrators, and maintainers.

Base URL
- Local development (frontend uses Vite env): VITE_API_BASE_URL (e.g. http://localhost:3000)
- Example: https://api.my-bioscope.example.com/api

Authentication
- Method: JSON Web Tokens (JWT) or session cookie depending on backend configuration.
- Required header (JWT): Authorization: Bearer <token>
- For cookie/session-based auth the backend uses credentials: include (frontend).
- Login returns user object and tokens.

Common response envelope
- Successful responses usually return JSON objects or arrays.
- Error responses use: { error?: string, message?: string, details?: any } and appropriate HTTP status codes.

Standard error codes
- 200 OK — success
- 201 Created — resource created
- 204 No Content — success with no body
- 400 Bad Request — validation or malformed request
- 401 Unauthorized — missing/invalid auth
- 403 Forbidden — insufficient permissions
- 404 Not Found — resource not found
- 409 Conflict — duplicate or business rule conflict
- 500 Internal Server Error — server-side error

Schemas (representative)

User
- id: string (UUID)
- name: string
- email: string
- role: "admin" | "user"
- createdAt, updatedAt: ISO datetime

Device
- id: string (UUID)
- deviceId: string (human readable code e.g. B-001)
- name?: string
- lab: string
- status?: "available" | "in_use" | "maintenance"
- createdAt, updatedAt: ISO datetime

Booking
- id: string (UUID)
- user (email or user id)
- deviceId (device.deviceId)
- start (ISO datetime)
- end (ISO datetime)
- status: "pending" | "approved" | "rejected" | "cancelled"
- notes?: string
- createdAt, updatedAt: ISO datetime

Authentication Endpoints
- POST /api/auth/login
  - Body: { email: string, password: string }
  - Response: { user: {...}, token?: { access, refresh } } OR session cookie
- GET /api/auth/me
  - Auth required
  - Response: { id, name, email, role, ... }
- POST /api/auth/logout
  - Auth required (invalidates session/token)
  - Response: { ok: true }

User Endpoints
- GET /api/users (admin)
  - Query: ?q=&role=&limit=&offset=
  - Response: [User, ...]
- GET /api/users/:id (admin or owner)
  - Response: User
- POST /api/users (admin)
  - Body: { name, email, password, role }
  - Response: created User
- PATCH /api/users/:id (admin or owner)
  - Body: partial fields
  - Response: updated User

Device Endpoints
- GET /api/devices
  - Query params: q (search string), lab, status, limit, offset
  - Response: [Device,...] (may be paginated)
- GET /api/devices/:id
  - Response: Device
- POST /api/devices (admin)
  - Body: { deviceId, name?, lab, status? }
  - Response: created Device
- PUT /api/devices/:id (admin)
  - Body: full update
  - Response: updated Device
- DELETE /api/devices/:id (admin)
  - Response: 204 No Content
- GET /api/devices/check-availability
  - Query: deviceId=<deviceId>&startTime=<ISO>&endTime=<ISO>
  - Response: { isAvailable: boolean, existingBooking?: Booking }
  - Notes: used by frontend to mark timeslots unavailable

Device bookings for a device
- GET /api/devices/:deviceId/bookings
  - Query: from, to, status
  - Response: [Booking,...]

Booking Endpoints
- GET /api/bookings
  - Query params:
    - user (email or id) — admin may fetch all; users get own by default
    - deviceId
    - status
    - from / to (ISO datetimes)
    - limit / offset / page (pagination)
  - Response: [Booking,...] or { data: [...], meta: { total, limit, offset } }
- GET /api/bookings/my
  - Auth required — returns bookings for logged-in user
- GET /api/bookings/:id
  - Response: Booking
- POST /api/bookings
  - Body:
    {
      user: string,         // email or user id
      deviceId: string,     // device.deviceId
      start: string,        // ISO datetime
      end: string,          // ISO datetime
      notes?: string
    }
  - Validation:
    - start < end
    - no conflicting approved bookings for device (or returns conflict)
  - Response: 201 Created with booking object (status usually "pending")
- PATCH /api/bookings/:id/status
  - Auth: admin (or owner for cancel)
  - Body: { status: "approved" | "rejected" | "cancelled" }
  - Response: updated Booking
- PATCH /api/bookings/:id (optional general updates)
  - Body: partial booking fields (notes, times if allowed)
  - Response: updated Booking
- DELETE /api/bookings/:id
  - Auth: admin or booking owner (depending on rules)
  - Response: 204 No Content
- GET /api/bookings/:id/images
  - Response: [image metadata or URLs]

Motor Control Endpoints
- POST /api/motor/move-x
  - Body: { amount: number } (positive/negative steps or units)
  - Response: { success: true, message: string, data?: {...} }
- Additional motor endpoints (see backend/src/controllers/motorController.ts)
  - Provide proper auth rules (restrict to admins or lab staff)
  - IMPORTANT: Motor controllers may require keys: MOTOR_CONTROLLER_URL, MOTOR_API_KEY

Examples: curl & fetch

- Login (curl)
  curl -X POST "${VITE_API_BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"user@school.edu","password":"pass"}'

- Check device availability (curl)
  curl -G "${VITE_API_BASE_URL}/api/devices/check-availability" \
    --data-urlencode "deviceId=B-001" \
    --data-urlencode "startTime=2025-11-05T09:00:00Z" \
    --data-urlencode "endTime=2025-11-05T09:30:00Z"

- Create booking (fetch)
  fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    credentials: 'include', // or Authorization header
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: 'student@school.edu', deviceId: 'B-001', start: '2025-11-05T09:00:00Z', end: '2025-11-05T09:30:00Z' })
  })

Pagination & filtering
- Endpoints returning lists accept limit / offset or page / perPage parameters. Responses may include meta: { total, limit, offset }.
- Use query parameters to filter by deviceId, user, status, date range (from/to).

Validation & Conflict Handling
- Booking creation checks for overlapping bookings on the same device (status approved/pending depending on rules). If conflict, server returns 409 Conflict with details about existing booking.
- Always validate timestamps are ISO 8601 and in UTC or document chosen timezone.

Environment variables (important for clients & deployment)
- Backend:
  - DATABASE_URL — Postgres connection
  - JWT_SECRET — sign tokens
  - MOTOR_CONTROLLER_URL — motor controller base URL
  - MOTOR_API_KEY — motor controller key (if applicable)
  - SENTRY_DSN — optional
- Frontend (Vite - exposed to client):
  - VITE_API_BASE_URL — base URL used by frontend to call API (no private secrets here)
  - VITE_SENTRY_DSN — optional client DSN

Security best practices
- Keep JWT_SECRET, DATABASE_URL, and motor API keys out of source control.
- Use HTTPS in production.
- Limit motor endpoints to authorized roles only.
- Rate-limit public endpoints to prevent abuse.

Testing & Mocking
- Backend contains mock motor controllers in tests/ for integration tests. See backend/tests and MOTOR_TEST_INSTRUCTIONS.md.
- Frontend tests under frontend/tests use mocked API services. See frontend/src/services/mockAuth.ts and related mocks.