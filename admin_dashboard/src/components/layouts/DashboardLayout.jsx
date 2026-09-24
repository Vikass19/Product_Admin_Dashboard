import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/products" className="text-lg font-bold">
            Product Admin
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden sm:block text-sm text-gray-600">
                {user.firstName || user.username}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm border rounded px-3 py-1.5 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}