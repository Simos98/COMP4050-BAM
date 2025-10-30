import { apiFetch } from './api';
import type { User } from '../types';

export async function signup(payload: {
  studentId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(username: string, password: string) {
  // backend expects { email, password } at /api/auth/login
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: username, password }),
  });
}

export async function logout() {
  return apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
}

export async function me(): Promise<User | null> {
  try {
    const body = await apiFetch('/api/auth/me');
    // backend responses are wrapped as { success, message, data }
    // `data` may contain { user: {...} } (login) or be the user object directly (me)
    if (!body) return null;
    return (body.data?.user ?? body.data ?? body) as User | null;
  } catch {
    return null;
  }
}