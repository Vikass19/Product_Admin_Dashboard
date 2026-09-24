import { useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateLogin } from '../utils/validation'

export default function Login() {
  const { login, isAuthenticated, initializing } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/products'

  const [form, setForm] = useState({ username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  if (initializing) return <p className="p-6">Loading...</p>
  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    setApiError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submittingRef.current) return // block duplicate submits

    const errors = validateLogin(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    submittingRef.current = true
    setSubmitting(true)
    setApiError('')

    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setApiError(err.message || 'Login failed')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm bg-white rounded-lg shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-red-700 text-center">Admin Login</h1>

        {apiError && (
          <div role="alert" className="bg-red-50 text-red-700 text-sm p-3 rounded">
            {apiError}
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {fieldErrors.username && (
            <p className="text-red-600 text-sm mt-1">{fieldErrors.username}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {fieldErrors.password && (
            <p className="text-red-600 text-sm mt-1">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Signing in...' : 'Login'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Demo: emilys / emilyspass
        </p>
      </form>
    </div>
  )
}