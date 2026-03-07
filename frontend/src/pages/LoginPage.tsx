import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic client-side validation
    if (!email || !password) {
      setError('Please enter both email and password.')
      setLoading(false)
      return
    }

    try {
      await login(email, password, remember)
      navigate('/admin')
    } catch (err) {
      if (err instanceof Error) {
        // Display the specific error message from the backend
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>Admin Login</h1>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.visuallyHidden}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL"
                className={styles.textField}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.visuallyHidden}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD"
                className={styles.textField}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className={styles.checkbox}
                disabled={loading}
              />
              <label htmlFor="remember" className={styles.checkboxLabel}>
                Remember me
              </label>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
