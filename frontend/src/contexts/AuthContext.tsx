import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'

interface LoginResponse {
  token: string
  pid: string
  name: string
  is_verified: boolean
}

interface User {
  pid: string
  name: string
  email: string
  is_verified: boolean
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string, remember: boolean) => Promise<void>
  logout: () => void
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user has a saved token
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    if (token) {
      // Set authenticated immediately (optimistic)
      setIsAuthenticated(true)
      
      // Try to fetch current user data in background
      fetch('/api/auth/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json()
          } else if (res.status === 401 || res.status === 403) {
            // Only clear token if explicitly unauthorized
            throw new Error('Unauthorized')
          }
          // For other errors (404, 500, etc), keep the token
          return null
        })
        .then((data) => {
          if (data) {
            setUser(data)
          }
        })
        .catch((err) => {
          // Only clear auth if explicitly unauthorized
          if (err.message === 'Unauthorized') {
            localStorage.removeItem('auth_token')
            sessionStorage.removeItem('auth_token')
            setIsAuthenticated(false)
            setUser(null)
          }
        })
    }
  }, [])

  const login = async (
    email: string,
    password: string,
    remember: boolean,
  ) => {
    // Loco.rs login endpoint: POST /api/auth/login
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const data: LoginResponse = await response.json()
      
      // Store token based on remember preference
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('auth_token', data.token)

      // Set user data
      setUser({
        pid: data.pid,
        name: data.name,
        email: email,
        is_verified: data.is_verified,
      })
      setIsAuthenticated(true)
    } else {
      // Generic error message for all authentication failures
      throw new Error('Invalid input. Please check your email and password.')
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const getToken = () => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
