import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { loginRequest, getCurrentUser } from '../services/authService'
import { tokenStorage } from '../services/tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // true only while we verify an existing token on first load
  const [initializing, setInitializing] = useState(() => Boolean(tokenStorage.get()))

  useEffect(() => {
    if (!tokenStorage.get()) return

    const controller = new AbortController()

    async function restoreSession() {
      try {
        const me = await getCurrentUser(controller.signal)
        setUser(me)
        setInitializing(false)
      } catch (err) {
        if (err.name === 'CanceledError') return // StrictMode double-run
        tokenStorage.clear()
        setUser(null)
        setInitializing(false)
      }
    }

    restoreSession()
    return () => controller.abort()
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    tokenStorage.set(data.accessToken)
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: Boolean(user),
    initializing,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}