import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireRole({
  role,
  children,
}: {
  role: 'admin' | 'user'
  children: ReactNode
}) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace /> // or to "/unauthorized"
  return <>{children}</>
}
