import { apiFetch } from './api';
import type { User } from '../types';

export async function login(username: string, password: string) {
  // backend expected: { username, password }
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
}

export async function me(): Promise<User | null> {
  try {
    return await apiFetch('/auth/me');
  } catch {
    return null;
  }
}