import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './AdminLayout.module.css'

interface AdminLayoutProps {
  children: ReactNode
  pageTitle?: string
  onAddClick?: () => void
  addButtonLabel?: string
}

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', exact: true },
  { label: 'Projects', path: '/admin/projects' },
  { label: 'About Texts', path: '/admin/about-texts' },
  { label: 'Skills', path: '/admin/skills' },
  { label: 'Timeline', path: '/admin/timeline' },
  { label: 'Resources', path: '/admin/resources' },
  { label: 'Testimonials', path: '/admin/testimonials' },
]

export function AdminLayout({ children, pageTitle, onAddClick, addButtonLabel = '+ Add New' }: AdminLayoutProps) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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
          {NAV_ITEMS.map(({ label, path, exact }) => {
            const isActive = exact ? location.pathname === path : location.pathname.startsWith(path)
            return (
              <button
                key={path}
                className={`${styles.menuItem}${isActive ? ` ${styles.menuItemActive}` : ''}`}
                onClick={() => navigate(path)}
              >
                {label}
              </button>
            )
          })}
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
