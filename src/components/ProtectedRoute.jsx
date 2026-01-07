import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Blocks unauthenticated users and users without the required role
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallbackPath =
      role === 'participant' ? '/participant' : role === 'admin' ? '/admin' : '/login'
    return <Navigate to={fallbackPath} replace />
  }

  return children
}