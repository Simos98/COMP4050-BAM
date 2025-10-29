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
    return await apiFetch('/api/auth/me');
  } catch {
    return null;
  }
}