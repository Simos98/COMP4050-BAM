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
