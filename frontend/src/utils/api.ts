/**
 * Utility functions for making authenticated API requests to Loco.rs backend
 */

/**
 * Get the stored auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
}

/**
 * Make an authenticated API request with JWT token
 */
export async function fetchAuthenticated(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken()

  if (!token) {
    throw new Error('No authentication token found')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Register a new user
 * Loco.rs endpoint: POST /api/auth/register
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ token: string; pid: string; name: string; is_verified: boolean }> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Registration failed')
  }

  return response.json()
}

/**
 * Request password reset
 * Loco.rs endpoint: POST /api/auth/forgot
 */
export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch('/api/auth/forgot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to send reset email')
  }
}

/**
 * Reset password with token
 * Loco.rs endpoint: POST /api/auth/reset
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<void> {
  const response = await fetch('/api/auth/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to reset password')
  }
}

/**
 * Verify email with token
 * Loco.rs endpoint: GET /api/auth/verify/:token
 */
export async function verifyEmail(token: string): Promise<void> {
  const response = await fetch(`/api/auth/verify/${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Email verification failed')
  }
}
