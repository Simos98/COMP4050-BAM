export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'teacher' | 'student'
}

const USERS: Array<AuthUser & { password: string }> = [
  { id: 'u-admin', name: 'Admin User', email: 'admin@school.edu', role: 'admin', password: 'adminpass' },
  { id: 'u-student1', name: 'Student One', email: 'student01@school.edu', role: 'student', password: 'studentpass' },
  { id: 'u-teacher', name: 'Alice Teacher', email: 'alice@school.edu', role: 'teacher', password: 'teacherpass' },
]

const TOKEN_KEY = 'bioscope:auth_token'

// Simple token encoding (NOT secure — mock only)
function encodeToken(payload: object) {
  return btoa(JSON.stringify(payload))
}
function decodeToken(token: string | null) {
  if (!token) return null
  try {
    return JSON.parse(atob(token))
  } catch {
    return null
  }
}

export async function login(email: string, password: string) {
  await new Promise((r) => setTimeout(r, 250))
  const found = USERS.find(u => u.email.toLowerCase() === String(email).toLowerCase())
  if (!found || found.password !== password) {
    const e: any = new Error('Invalid credentials')
    e.status = 401
    throw e
  }
  const tokenPayload = { id: found.id, email: found.email, role: found.role, exp: Date.now() + (1000 * 60 * 60) }
  const token = encodeToken(tokenPayload)
  localStorage.setItem(TOKEN_KEY, token)
  // return user info (without password) and token
  const { password: _, ...user } = found
  return { user, token }
}

export function logout() { localStorage.removeItem(TOKEN_KEY) }

export function me() {
  const token = localStorage.getItem(TOKEN_KEY)
  const payload = decodeToken(token)
  if (!payload) return null
  if (payload.exp && Date.now() > payload.exp) {
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
  return { id: payload.id, email: payload.email, role: payload.role }
}

export function getUserFromToken(): AuthUser | null {
  const payload = me()
  if (!payload) return null
  const found = USERS.find(u => u.email === payload.email)
  if (!found) return null
  const { password: _, ...user } = found
  return user
}

// New helper: lookup user by email (returns null if unknown)
export function getUserByEmail(email: string): AuthUser | null {
  if (!email) return null
  const found = USERS.find(u => u.email.toLowerCase() === String(email).toLowerCase())
  if (!found) return null
  const { password: _, ...user } = found
  return user
}

// New helper: list all users (without passwords)
export function listUsers(): AuthUser[] {
  return USERS.map(({ password, ...u }) => ({ ...u }))
}

// New helper: list only students
export function listStudents(): AuthUser[] {
  return USERS.filter(u => u.role === 'student').map(({ password, ...u }) => ({ ...u }))
}