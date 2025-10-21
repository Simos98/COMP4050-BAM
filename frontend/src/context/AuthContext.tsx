import React, { createContext, useContext, useEffect, useState } from 'react'
import { login as mockLogin, logout as mockLogout, me as mockMe } from '../services/mockAuth'

type User = { id: string; name?: string; email: string; role: string } | null

type AuthContextValue = {
  user: User
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)

  useEffect(() => {
    // restore from token (mock)
    const payload = mockMe()
    if (payload) {
      // mockMe returns minimal info (id,email,role)
      setUser({ id: payload.id, email: payload.email, role: payload.role })
    } else {
      setUser(null)
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await mockLogin(email, password)
    setUser({ id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role })
  }

  function logout() {
    mockLogout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
