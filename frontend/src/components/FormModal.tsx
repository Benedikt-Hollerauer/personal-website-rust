import React, { useState } from 'react'
import styles from './FormModal.module.css'

export type FormFieldType = 'text' | 'textarea' | 'checkbox' | 'select' | 'date' | 'url' | 'email' | 'file' | 'number'

export interface FormField {
  name: string
  label: string
  type: FormFieldType
  required?: boolean
  options?: { label: string; value: string | number }[] // for select fields
  placeholder?: string
}

export interface FormModalProps {
  isOpen: boolean
  title: string
  fields: FormField[]
  onClose: () => void
  onSubmit: (data: Record<string, any>) => Promise<void>
  submitLabel?: string
  initialData?: Record<string, any>
  isSubmitting?: boolean
  /**
   * Optional additional content to render above the form fields (e.g. previews)
   */
  children?: React.ReactNode
}

export function FormModal({
  isOpen,
  title,
  fields,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  initialData = {},
  isSubmitting = false,
  children,
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const getAutoCompleteValue = (field: FormField): string => {
    switch (field.type) {
      case 'email':
        return 'off'
      case 'url':
        return 'off'
      case 'date':
        return 'off'
      case 'file':
        return 'off'
      default:
        return 'off'
    }
  }

  // Update form data when initialData changes
  React.useEffect(() => {
    setFormData(initialData)
    setErrors({})
  }, [initialData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'file') {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        setFormData(prev => ({ ...prev, [name]: files[0] }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onSubmit(formData)
      setFormData({})
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
      // Error handling can be enhanced here
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={() => !isSubmitting && onClose()}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            {'\u2715'}
          </button>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" data-bwignore="true" data-lpignore="true">
          <div className={styles.body}>
            {children}
            {fields.map(field => (
              <div key={field.name} className={styles.formGroup}>
                <label htmlFor={field.name} className={styles.label}>
                  {field.label}
                  {field.required && <span className={styles.required}> *</span>}
                </label>

                {field.type === 'textarea' ? (
                  <>
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      autoComplete={getAutoCompleteValue(field)}
                      data-bwignore="true"
                      data-lpignore="true"
                      spellCheck={false}
                      placeholder={field.placeholder}
                      className={styles.textarea}
                      disabled={isSubmitting}
                    />
                    {errors[field.name] && (
                      <div className={styles.error}>{errors[field.name]}</div>
                    )}
                  </>
                ) : field.type === 'checkbox' ? (
                  <div className={styles.checkboxContainer}>
                    <input
                      id={field.name}
                      type="checkbox"
                      name={field.name}
                      checked={formData[field.name] || false}
                      onChange={handleChange}
                      autoComplete="off"
                      data-bwignore="true"
                      data-lpignore="true"
                      className={styles.checkbox}
                      disabled={isSubmitting}
                    />
                    <label htmlFor={field.name} style={{ margin: 0 }}>
                      {field.label}
                    </label>
                  </div>
                ) : field.type === 'select' ? (
                  <>
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      autoComplete={getAutoCompleteValue(field)}
                      data-bwignore="true"
                      data-lpignore="true"
                      className={styles.select}
                      disabled={isSubmitting}
                    >
                      <option value="">Select an option</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors[field.name] && (
                      <div className={styles.error}>{errors[field.name]}</div>
                    )}
                  </>
                ) : field.type === 'date' ? (
                  <>
                    <input
                      id={field.name}
                      type="date"
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      autoComplete={getAutoCompleteValue(field)}
                      data-bwignore="true"
                      data-lpignore="true"
                      className={styles.dateInput}
                      disabled={isSubmitting}
                    />
                    {errors[field.name] && (
                      <div className={styles.error}>{errors[field.name]}</div>
                    )}
                  </>
                ) : field.type === 'file' ? (
                  <>
                    <input
                      id={field.name}
                      type="file"
                      name={field.name}
                      onChange={handleChange}
                      autoComplete={getAutoCompleteValue(field)}
                      data-bwignore="true"
                      data-lpignore="true"
                      className={styles.input}
                      disabled={isSubmitting}
                    />
                    {formData[field.name] instanceof File && (
                      <div className={styles.fileInfo}>
                        Selected file: {(formData[field.name] as File).name}
                      </div>
                    )}
                    {errors[field.name] && (
                      <div className={styles.error}>{errors[field.name]}</div>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      id={field.name}
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      autoComplete={getAutoCompleteValue(field)}
                      data-bwignore="true"
                      data-lpignore="true"
                      spellCheck={false}
                      placeholder={field.placeholder}
                      className={styles.input}
                      disabled={isSubmitting}
                    />
                    {errors[field.name] && (
                      <div className={styles.error}>{errors[field.name]}</div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.buttonPrimary}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
