import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import styles from './AdminPage.module.css'

export function AdminPage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.adminPage}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        </div>

        <nav className={styles.sidebarNav}>
          {/* Menu items will be added here later */}
          <div className={styles.menuPlaceholder}>
            Menu items coming soon...
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.welcomeCard}>
            <h2 className={styles.welcomeTitle}>
              Welcome, {user?.name || 'Admin'}!
            </h2>
            <p className={styles.welcomeText}>
              This is your admin dashboard. Menu items and functionality will be
              added here.
            </p>
            {user && !user.is_verified && (
              <div className={styles.verificationNotice}>
                ⚠️ Your email address is not verified yet. Please check your inbox.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
