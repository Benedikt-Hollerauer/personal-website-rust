import styles from './ProjectCard.module.css'
import type { Project } from '../types/project'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: number) => void
  onToggleActive: (project: Project) => void
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onToggleActive,
}: ProjectCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className={`${styles.card} ${!project.active ? styles.inactive : ''}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{project.title || 'Untitled Project'}</h3>
        <span className={`${styles.badge} ${project.active ? styles.activeBadge : styles.inactiveBadge}`}>
          {project.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className={styles.cardContent}>
        {project.description && (
          <p className={styles.description}>{project.description.substring(0, 150)}...</p>
        )}

        <div className={styles.metadata}>
          {project.location && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Location:</span>
              <span className={styles.metaValue}>{project.location}</span>
            </div>
          )}
          {project.start_date && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Start:</span>
              <span className={styles.metaValue}>{formatDate(project.start_date)}</span>
            </div>
          )}
          {project.end_date && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>End:</span>
              <span className={styles.metaValue}>{formatDate(project.end_date)}</span>
            </div>
          )}
          {project.link && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Link:</span>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {project.link}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardActions}>
        <button
          className={`${styles.actionBtn} ${styles.editBtn}`}
          onClick={() => onEdit(project)}
          title="Edit project"
        >
          Edit
        </button>
        <button
          className={`${styles.actionBtn} ${styles.toggleBtn}`}
          onClick={() => onToggleActive(project)}
          title={project.active ? 'Deactivate project' : 'Activate project'}
        >
          {project.active ? 'Deactivate' : 'Activate'}
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={() => onDelete(project.id)}
          title="Delete project"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
