import { useState, useEffect } from 'react'
import styles from './ProjectFormModal.module.css'
import type { Project } from '../types/project'

interface ProjectFormModalProps {
  project: Project | null
  onClose: () => void
  onSave: () => void
}

interface FormData {
  title: string
  description: string
  link: string
  location: string
  key_points: string[]
  start_date: string
  end_date: string
}

export function ProjectFormModal({
  project,
  onClose,
  onSave,
}: ProjectFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    link: '',
    location: '',
    key_points: [],
    start_date: '',
    end_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (project) {
      // Convert key_points object to array of strings
      let keyPointsArray: string[] = []
      if (project.key_points && typeof project.key_points === 'object') {
        keyPointsArray = Object.values(project.key_points).map((v) =>
          String(v),
        )
      }

      setFormData({
        title: project.title || '',
        description: project.description || '',
        link: project.link || '',
        location: project.location || '',
        key_points: keyPointsArray,
        start_date: project.start_date ? project.start_date.split('T')[0] : '',
        end_date: project.end_date ? project.end_date.split('T')[0] : '',
      })
    }
  }, [project])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleKeyPointChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newKeyPoints = [...prev.key_points]
      newKeyPoints[index] = value
      return {
        ...prev,
        key_points: newKeyPoints,
      }
    })
  }

  const handleAddKeyPoint = () => {
    setFormData((prev) => ({
      ...prev,
      key_points: [...prev.key_points, ''],
    }))
  }

  const handleRemoveKeyPoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      key_points: prev.key_points.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert key_points array to object if there are any points
      let keyPointsValue = undefined
      if (formData.key_points.length > 0) {
        const nonEmptyPoints = formData.key_points.filter((p) => p.trim())
        if (nonEmptyPoints.length > 0) {
          keyPointsValue = Object.fromEntries(
            nonEmptyPoints.map((point, index) => [
              `point_${index + 1}`,
              point,
            ]),
          )
        }
      }

      const payload = {
        title: formData.title || undefined,
        description: formData.description || undefined,
        link: formData.link || undefined,
        location: formData.location || undefined,
        key_points: keyPointsValue,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
      }

      const url = project
        ? `/api/projects/${project.id}`
        : '/api/projects'
      const method = project ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save project')
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!project

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              Error: {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Project title"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Project description"
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.label}>
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Project location"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="link" className={styles.label}>
                Link
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://example.com"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="start_date" className={styles.label}>
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="end_date" className={styles.label}>
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Key Points</label>
            <div className={styles.keyPointsContainer}>
              {formData.key_points.map((point, index) => (
                <div key={index} className={styles.keyPointInput}>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleKeyPointChange(index, e.target.value)}
                    placeholder={`Key point ${index + 1}`}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemoveKeyPoint(index)}
                    title="Remove key point"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddKeyPoint}
            >
              + Add Key Point
            </button>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : isEditing
                  ? 'Update Project'
                  : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
