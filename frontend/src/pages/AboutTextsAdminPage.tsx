import { useState, useEffect } from 'react'
import { fetchAuthenticated } from '../utils/api'
import { FormModal, type FormField } from '../components/FormModal'
import { AdminGrid, type GridColumn, type GridAction } from '../components/AdminGrid'
import { AdminLayout } from '../components/AdminLayout'
import styles from './AboutTextsAdminPage.module.css'

interface AboutText {
  id: number
  content: string
  active: boolean
  created_at: string
  updated_at: string
}

export function AboutTextsAdminPage() {
  const [aboutTexts, setAboutTexts] = useState<AboutText[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingText, setEditingText] = useState<AboutText | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadAboutTexts()
  }, [])

  const loadAboutTexts = async () => {
    try {
      setIsLoading(true)
      const response = await fetchAuthenticated('/api/about-texts')
      if (!response.ok) throw new Error('Failed to load about texts')
      const data = await response.json()
      setAboutTexts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load about texts:', error)
      alert('Failed to load about texts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddText = () => {
    setEditingText(null)
    setIsModalOpen(true)
  }

  const handleEditText = (text: AboutText) => {
    setEditingText(text)
    setIsModalOpen(true)
  }

  const handleDeleteText = async (text: AboutText) => {
    if (confirm('Are you sure you want to delete this about text?')) {
      try {
        const response = await fetchAuthenticated(`/api/about-texts/${text.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete text')
        await loadAboutTexts()
      } catch (error) {
        console.error('Failed to delete text:', error)
        alert('Failed to delete text')
      }
    }
  }

  const handleToggleActive = async (text: AboutText) => {
    try {
      const response = await fetchAuthenticated(`/api/about-texts/${text.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !text.active }),
      })
      if (!response.ok) throw new Error('Failed to update text')
      await loadAboutTexts()
    } catch (error) {
      console.error('Failed to toggle text:', error)
      alert('Failed to toggle text')
    }
  }

  const handleSubmitForm = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      const url = editingText ? `/api/about-texts/${editingText.id}` : '/api/about-texts'
      const method = editingText ? 'PATCH' : 'POST'

      const response = await fetchAuthenticated(url, {
        method,
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error(`Failed to ${editingText ? 'update' : 'create'} text`)
      await loadAboutTexts()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Form submission error:', error)
      alert(`Failed to ${editingText ? 'update' : 'create'} text`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formFields: FormField[] = [
    { name: 'content', label: 'Content', type: 'textarea', required: true },
    { name: 'active', label: 'Active', type: 'checkbox' },
  ]

  const columns: GridColumn[] = [
    { key: 'content', label: 'Content', render: (value) => value.substring(0, 100) + (value.length > 100 ? '...' : '') },
    {
      key: 'active',
      label: 'Status',
      render: (value) => (
        <span style={{ color: value ? '#51cf66' : '#999' }}>
          {value ? '✓ Active' : '○ Inactive'}
        </span>
      ),
    },
  ]

  const actions: GridAction[] = [
    { label: 'Edit', variant: 'edit', onClick: handleEditText },
    { label: 'Toggle', variant: 'toggle', onClick: handleToggleActive },
    { label: 'Delete', variant: 'delete', onClick: handleDeleteText },
  ]

  return (
    <AdminLayout pageTitle="About Texts" onAddClick={handleAddText} addButtonLabel="+ Add Text">
      <div className={styles.page}>
        <AdminGrid
          title="About Texts"
          columns={columns}
          data={aboutTexts}
          actions={actions}
          onAdd={handleAddText}
          isLoading={isLoading}
          emptyMessage="No about texts yet. Create your first one!"
        />

        <FormModal
          isOpen={isModalOpen}
          title={editingText ? 'Edit About Text' : 'Add New About Text'}
          fields={formFields}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={editingText || {}}
          isSubmitting={isSubmitting}
          submitLabel={editingText ? 'Update' : 'Create'}
        />
      </div>
    </AdminLayout>
  )
}
