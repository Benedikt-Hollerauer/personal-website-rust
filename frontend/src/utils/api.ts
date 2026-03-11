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

  // do not override Content-Type when sending FormData so the browser
  // can set the correct boundary
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

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

/**
 * Upload a file to the backend storage service. The `category` is used to
 * partition files on disk (e.g. "skills" or "resources"). The returned
 * object contains a `url` which can be stored in the database and later used
 * by clients to fetch the file.
 */
export async function uploadFile(
  category: string,
  file: File
): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetchAuthenticated(`/api/upload?category=${encodeURIComponent(
    category
  )}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('File upload failed')
  }

  return response.json()
}

/**
 * Delete a previously uploaded file. The `category` and `filename` correspond
 * to the path returned by `uploadFile` (i.e. the parts after `/api/files/`).
 */
export async function deleteFile(
  category: string,
  filename: string
): Promise<void> {
  const response = await fetchAuthenticated(`/api/files/${encodeURIComponent(
    category
  )}/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete file')
  }
}
