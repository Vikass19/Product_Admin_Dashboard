import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return <p className="p-6">Checking session...</p>
  }

  if (!isAuthenticated) {
    // remember where the user wanted to go, Login redirects back after success
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}