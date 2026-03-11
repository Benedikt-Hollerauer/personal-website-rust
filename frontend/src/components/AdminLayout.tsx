import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './AdminLayout.module.css'

interface AdminLayoutProps {
  children: ReactNode
  pageTitle?: string
  onAddClick?: () => void
  addButtonLabel?: string
}

export function AdminLayout({ children, pageTitle, onAddClick, addButtonLabel = '+ Add New' }: AdminLayoutProps) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            className={styles.menuItem}
            onClick={() => navigate('/admin')}
          >
            Dashboard
          </button>
          <button
            className={styles.menuItem}
            onClick={() => navigate('/admin/projects')}
          >
            Projects
          </button>
          <button
            className={styles.menuItem}
            onClick={() => navigate('/admin/about-texts')}
          >
            About Texts
          </button>
          <button
            className={styles.menuItem}
            onClick={() => navigate('/admin/skills')}
          >
            Skills
          </button>
          <button
            className={styles.menuItem}
            onClick={() => navigate('/admin/timeline')}
          >
            Timeline
          </button>
          <button
            className={styles.menuItem}
            onClick={() => navigate('/admin/resources')}
          >
            Resources
          </button>
          <button
            className={styles.menuItem}
            onClick={() => navigate('/admin/testimonials')}
          >
            Testimonials
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'Admin'}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h1 className={styles.pageTitle}>{pageTitle || 'Admin Page'}</h1>
          {onAddClick && (
            <button onClick={onAddClick} className={styles.addButton}>
              {addButtonLabel}
            </button>
          )}
        </div>

        <div className={styles.contentBody}>
          {children}
        </div>
      </main>
    </div>
  )
}
