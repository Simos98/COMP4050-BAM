import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

// attach token (if we later store one)
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('user')
  if (raw) {
    const user = JSON.parse(raw)
    // if our backend uses bearer tokens:
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

// Auto-handle 401s
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('user')
      // optional: window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })

export type ApiError = { status: number; message: string; details?: any }

const BASE = '' // relative; adjust if your backend is hosted under a prefix e.g. '/api'

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type') || ''
  let body: any = null
  if (contentType.includes('application/json')) {
    body = await res.json()
  } else {
    body = await res.text()
  }

  if (!res.ok) {
    const message = body && body.error ? body.error : body?.message ?? String(body)
    const err: ApiError = { status: res.status, message, details: body }
    throw err
  }
  return body
}

export async function apiGet(path: string, params?: Record<string, any>) {
  const url = new URL((BASE + path), window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)))
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  })
  return handleResponse(res)
}

export async function apiPost(path: string, body?: any) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse(res)
}

export async function apiPatch(path: string, body?: any) {
  const res = await fetch(BASE + path, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse(res)
}

export async function apiDelete(path: string) {
  const res = await fetch(BASE + path, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  })
  return handleResponse(res)
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  // use relative API paths: '/api/...'
  const url = path.startsWith('http') ? path : path;
  const init: RequestInit = {
    credentials: 'include', // critical to send the cookie
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  const res = await fetch(url, init);
  const text = await res.text().catch(() => '');
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;

  if (!res.ok) {
    const err: any = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return res.status === 204 ? null : body;
}