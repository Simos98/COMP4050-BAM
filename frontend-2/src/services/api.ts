export async function apiFetch(path: string, options: RequestInit = {}) {
  const base = import.meta.env.VITE_API_URL ?? '';
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const init: RequestInit = {
    credentials: 'include',
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