import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './AdminPage.module.css'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectFormModal } from '../components/ProjectFormModal'
import type { Project } from '../types/project'

export function AdminProjectsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreateClick = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (project: Project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
  }

  const handleSaveProject = async () => {
    await fetchProjects()
    handleCloseModal()
  }

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete project')
      }
      await fetchProjects()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  const handleToggleActive = async (project: Project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: !project.active,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to update project')
      }
      await fetchProjects()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update project')
    }
  }

  return (
    <div className={styles.adminPage}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.menuItem} ${styles.menuItemActive}`}
            onClick={() => navigate('/admin/projects')}
          >
            Projects
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h1 className={styles.pageTitle}>Projects Management</h1>
          <button
            onClick={handleCreateClick}
            className={styles.createButton}
          >
            + New Project
          </button>
        </div>

        <div className={styles.contentBody}>
          {error && (
            <div className={styles.errorMessage}>
              Error: {error}
            </div>
          )}

          {loading ? (
            <div className={styles.loadingMessage}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className={styles.emptyMessage}>
              No projects yet. Create your first project!
            </div>
          ) : (
            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteProject}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <ProjectFormModal
          project={editingProject}
          onClose={handleCloseModal}
          onSave={handleSaveProject}
        />
      )}
    </div>
  )
}
