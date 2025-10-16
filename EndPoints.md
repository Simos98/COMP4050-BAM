# BioScope API Endpoints

This document defines all REST API endpoints used by the frontend.

---

## Authentication

| Method | Endpoint | Description | Request Body | Response |
|--------|-----------|--------------|---------------|-----------|
| POST | `/api/auth/login` | Authenticate user and return tokens | `{ "email": "user@school.edu", "password": "string" }` | `{ "user": { "id": "u_1", "name": "User", "email": "user@school.edu", "role": "user" }, "token": { "access": "jwt", "refresh": "jwt" } }` |
| GET | `/api/auth/me` | Get current logged-in user | — | `{ "id": "u_1", "name": "User", "email": "user@school.edu", "role": "user" }` |
| POST | `/api/auth/logout` | Log out current session | — | `{ "ok": true }` |

---

## Devices

| Method | Endpoint | Description | Request Body | Response |
|--------|-----------|--------------|---------------|-----------|
| GET | `/api/devices` | List all devices (optional filters: `q`, `lab`) | — | `[ { "id": "d_1", "deviceId": "B-001", "lab": "Lab 1" } ]` |
| POST | `/api/devices` | Create new device (admin only) | `{ "deviceId": "B-001", "lab": "Lab 1" }` | `{ "id": "d_1", "deviceId": "B-001", "lab": "Lab 1" }` |

---

## Bookings

| Method | Endpoint | Description | Request Body | Response |
|--------|-----------|--------------|---------------|-----------|
| GET | `/api/bookings` | List all bookings (admin = all, user = own) | Query params: `user`, `deviceId`, `status`, `from`, `to` | `[ { "id": "b_1", "user": "student@school.edu", "deviceId": "B-001", "start": "...", "end": "...", "status": "pending" } ]` |
| POST | `/api/bookings` | Create a booking request | `{ "user": "student@school.edu", "deviceId": "B-001", "start": "2025-10-17T09:00Z", "end": "2025-10-17T11:00Z", "notes": "Optional" }` | `{ "id": "b_2", "status": "pending", ... }` |
| PATCH | `/api/bookings/:id/status` | Update booking status (approve, reject, cancel) | `{ "status": "approved" }` | `{ "id": "b_2", "status": "approved" }` |
| DELETE | `/api/bookings/:id` | Delete a booking (admin only) | — | `204 No Content` |
| GET | `/api/bookings/:id` | Get one booking (optional future use) | — | `{ "id": "b_1", "deviceId": "B-001", "user": "student@school.edu", ... }` |
| GET | `/api/devices/:deviceId/bookings` | List bookings for a device (optional future use) | — | `[ { "id": "b_3", "deviceId": "B-001", "status": "approved" } ]` |

---

## Entity Schema

| Entity | Field | Type | Required | Description |
|---------|--------|------|-----------|-------------|
| User | id | string (UUID) | Yes | Unique user ID |
|  | name | string | Yes | Full name |
|  | email | string (email) | Yes | User email (unique) |
|  | role | enum(`admin`, `user`) | Yes | Role-based access |
|  | createdAt | string (ISO datetime) | Yes | Creation timestamp |
|  | updatedAt | string (ISO datetime) | Yes | Last update timestamp |
| Device | id | string (UUID) | Yes | Unique device ID |
|  | deviceId | string | Yes | Human-readable code (e.g. B-001) |
|  | lab | string | Yes | Lab location |
|  | createdAt | string (ISO datetime) | Yes | Created timestamp |
|  | updatedAt | string (ISO datetime) | Yes | Last update timestamp |
| Booking | id | string (UUID) | Yes | Unique booking ID |
|  | user | string (email) | Yes | User email |
|  | deviceId | string | Yes | References Device.deviceId |
|  | start | string (ISO datetime) | Yes | Start time |
|  | end | string (ISO datetime) | Yes | End time |
|  | status | enum(`pending`, `approved`, `rejected`, `cancelled`) | Yes | Booking status |
|  | notes | string (nullable) | No | Optional comment |
|  | createdAt | string (ISO datetime) | Yes | When created |
|  | updatedAt | string (ISO datetime) | Yes | When last modified |

---

