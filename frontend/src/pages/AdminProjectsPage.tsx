import React, { useEffect, useRef, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import styles from './AdminPage.module.css'
import projectGridStyles from './AdminProjectsPage.module.css'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectFormModal } from '../components/ProjectFormModal'
import type { Project } from '../types/project'

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const savingOrderRef = useRef(false)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to fetch projects')
      const data = await response.json()
      setProjects(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : data)
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
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete project')
      await fetchProjects()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  const handleToggleActive = async (project: Project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !project.active }),
      })
      if (!response.ok) throw new Error('Failed to update project')
      await fetchProjects()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update project')
    }
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragOverIndex !== index) setDragOverIndex(index)
  }

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }

    const newProjects = [...projects]
    const [removed] = newProjects.splice(dragIndex, 1)
    newProjects.splice(index, 0, removed)
    setProjects(newProjects)
    setDragIndex(null)
    setDragOverIndex(null)

    if (savingOrderRef.current) return
    savingOrderRef.current = true
    try {
      await Promise.all(
        newProjects.map((p, i) =>
          fetch(`/api/projects/${p.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: i + 1 }),
          })
        )
      )
    } catch {
      await fetchProjects()
    } finally {
      savingOrderRef.current = false
    }
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <AdminLayout pageTitle="Projects Management" onAddClick={handleCreateClick} addButtonLabel="+ New Project">
      <div className={styles.adminPageContent}>
        {error && <div className={styles.errorMessage}>Error: {error}</div>}

        {loading ? (
          <div className={styles.loadingMessage}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className={styles.emptyMessage}>No projects yet. Create your first project!</div>
        ) : (
          <div className={styles.projectsGrid}>
            {projects.map((project, index) => (
              <div
                key={project.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={[
                  projectGridStyles.draggableWrapper,
                  dragIndex === index ? projectGridStyles.dragging : '',
                  dragOverIndex === index && dragIndex !== index ? projectGridStyles.dragOver : '',
                ].filter(Boolean).join(' ')}
              >
                <div className={projectGridStyles.dragHandle}>⋮⋮</div>
                <ProjectCard
                  project={project}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteProject}
                  onToggleActive={handleToggleActive}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProjectFormModal
          project={editingProject}
          onClose={handleCloseModal}
          onSave={handleSaveProject}
        />
      )}
    </AdminLayout>
  )
}
