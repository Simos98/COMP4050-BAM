// NOTE: this file previously contained mock auth; it's now the auth client that uses session cookies.
// Keep filename for imports in other parts of app.
import { apiGet, apiPost } from './api'

export type AuthUser = {
  id: string
  name?: string
  email: string
  role: 'admin' | 'teacher' | 'student'
}

// POST /auth/login
export async function login(email: string, password: string): Promise<AuthUser> {
  const body = await apiPost('/auth/login', { email, password })
  // backend may return { user } or { user, token } — we expect user object; session cookie set by server
  const user: AuthUser = body.user ?? body
  return user
}

// POST /auth/logout
export async function logout() {
  // server should clear session cookie
  await apiPost('/auth/logout')
}

// GET /auth/me
export async function me(): Promise<AuthUser | null> {
  try {
    const body = await apiGet('/auth/me')
    return body.user ?? body
  } catch (err: any) {
    if (err?.status === 401) return null
    throw err
  }
}

// Helpers to query users (admin endpoints)
export async function listUsers(): Promise<AuthUser[]> {
  const body = await apiGet('/api/users')
  return body.items ?? body
}

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  if (!email) return null
  try {
    const body = await apiGet(`/api/users`, { q: email })
    // backend should support search; fallback to scanning items
    const items = body.items ?? body
    const found = Array.isArray(items) ? items.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) : null
    return found ?? null
  } catch {
    return null
  }
}

export async function listStudents(): Promise<AuthUser[]> {
  // admin-only endpoint; backend may expose /api/users?role=student
  const body = await apiGet('/api/users', { role: 'student' })
  return body.items ?? body
}