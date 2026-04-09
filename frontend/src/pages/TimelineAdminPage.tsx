import { useState, useEffect } from 'react'
import { fetchAuthenticated } from '../utils/api'
import { FormModal, type FormField } from '../components/FormModal'
import { AdminGrid, type GridColumn, type GridAction } from '../components/AdminGrid'
import { AdminLayout } from '../components/AdminLayout'
import styles from './TimelineAdminPage.module.css'

interface Timeline {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string | null
  order: number
  created_at: string
  updated_at: string
}

// Helper functions for localStorage overrides
function getWorkHistoryOverrides() {
  try {
    return JSON.parse(localStorage.getItem('workHistoryOverrides') || '{}');
  } catch {
    return {};
  }
}
function setWorkHistoryOverride(id: string, data: Record<string, unknown>) {
  const overrides = getWorkHistoryOverrides();
  overrides[id] = { ...overrides[id], ...data };
  localStorage.setItem('workHistoryOverrides', JSON.stringify(overrides));
}

export function TimelineAdminPage() {
  const [timelines, setTimelines] = useState<Timeline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTimeline, setEditingTimeline] = useState<Timeline | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadTimelines()
  }, [])

  const loadTimelines = async () => {
    try {
      setIsLoading(true)
      const response = await fetchAuthenticated('/api/timeline')
      if (!response.ok) throw new Error('Failed to load timelines')
      const data = await response.json()
      setTimelines(Array.isArray(data) ? data.sort((a, b) => Number(a.order) - Number(b.order)) : [])
    } catch (error) {
      console.error('Failed to load timelines:', error)
      alert('Failed to load timelines')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTimeline = () => {
    setEditingTimeline(null)
    setIsModalOpen(true)
  }

  const handleEditTimeline = (timeline: Timeline) => {
    setEditingTimeline(timeline)
    setIsModalOpen(true)
  }

  const handleDeleteTimeline = async (timeline: Timeline) => {
    if (confirm('Are you sure you want to delete this timeline entry?')) {
      try {
        const response = await fetchAuthenticated(`/api/timeline/${timeline.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete timeline')
        await loadTimelines()
      } catch (error) {
        console.error('Failed to delete timeline:', error)
        alert('Failed to delete timeline')
      }
    }
  }

  const handleSubmitForm = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      const url = editingTimeline ? `/api/timeline/${editingTimeline.id}` : '/api/timeline'
      const method = editingTimeline ? 'PATCH' : 'POST'

      const normalizedData = {
        ...data,
        order: Number(data.order),
      }

      // Save frontend-only accent color and emoji to localStorage
      if (data.emoji || data.accentColor) {
        // Use the backend id if editing, otherwise use the title as a fallback key
        const overrideId = editingTimeline ? String(editingTimeline.id) : data.title;
        setWorkHistoryOverride(overrideId, {
          emoji: data.emoji,
          accentColor: data.accentColor,
        });
      }

      const response = await fetchAuthenticated(url, {
        method,
        body: JSON.stringify(normalizedData),
      })

      if (!response.ok) throw new Error(`Failed to ${editingTimeline ? 'update' : 'create'} timeline`)
      await loadTimelines()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Form submission error:', error)
      alert(`Failed to ${editingTimeline ? 'update' : 'create'} timeline`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formFields: FormField[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date', required: false },
    { name: 'order', label: 'Order', type: 'number', required: true },
    // New fields for frontend accent color and emoji
    { name: 'emoji', label: 'Emoji', type: 'text', required: false, placeholder: 'e.g. 🚀' },
    { name: 'accentColor', label: 'Accent Color', type: 'text', required: false, placeholder: '#ef4444' },
  ]

  const columns: GridColumn[] = [
    { key: 'title', label: 'Title' },
    {
      key: 'start_date',
      label: 'Period',
      render: (_, row: Timeline) => {
        const endDate = row.end_date ? new Date(row.end_date).toLocaleDateString() : 'Present'
        return `${new Date(row.start_date).toLocaleDateString()} - ${endDate}`
      },
    },
    { key: 'order', label: 'Order' },
  ]

  const actions: GridAction[] = [
    { label: 'Edit', variant: 'edit', onClick: handleEditTimeline },
    { label: 'Delete', variant: 'delete', onClick: handleDeleteTimeline },
  ]

  return (
    <AdminLayout pageTitle="Timeline" onAddClick={handleAddTimeline} addButtonLabel="+ Add Entry">
      <div className={styles.page}>
        <AdminGrid
          title="Timeline"
          columns={columns}
          data={timelines}
          actions={actions}
          onAdd={handleAddTimeline}
          isLoading={isLoading}
          emptyMessage="No timeline entries yet. Create your first one!"
        />

        <FormModal
          isOpen={isModalOpen}
          title={editingTimeline ? 'Edit Timeline Entry' : 'Add New Timeline Entry'}
          fields={formFields}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitForm}
          isSubmitting={isSubmitting}
          initialData={editingTimeline ? {
            ...editingTimeline,
            emoji: getWorkHistoryOverrides()[String(editingTimeline.id)]?.emoji || '',
            accentColor: getWorkHistoryOverrides()[String(editingTimeline.id)]?.accentColor || '',
          } : {}}
        />
      </div>
    </AdminLayout>
  )
}
