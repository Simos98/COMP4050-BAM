import { apiFetch } from './api';
import type { User } from '../types';

export async function signup(email: string, password: string) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
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