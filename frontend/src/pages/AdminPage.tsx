import { useAuth } from '../contexts/AuthContext'
import { AdminLayout } from '../components/AdminLayout'
import styles from './AdminPage.module.css'

export function AdminPage() {
  const { user } = useAuth()

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className={styles.welcomeCard}>
        <h2 className={styles.welcomeTitle}>
          Welcome, {user?.name || 'Admin'}!
        </h2>
        <p className={styles.welcomeText}>
          This is your admin dashboard. Select a menu item to get started.
        </p>
        {user && !user.is_verified && (
          <div className={styles.verificationNotice}>
            ⚠️ Your email address is not verified yet. Please check your inbox.
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
