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
  emoji: string | null
  accent_color: string | null
  created_at: string
  updated_at: string
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

  const handleReorder = async (reorderedItems: Timeline[]) => {
    setTimelines(reorderedItems)
    try {
      await Promise.all(
        reorderedItems.map((item, index) =>
          fetchAuthenticated(`/api/timeline/${item.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ order: index + 1 }),
          })
        )
      )
    } catch (error) {
      console.error('Failed to save order:', error)
      await loadTimelines()
    }
  }

  const handleSubmitForm = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      const url = editingTimeline ? `/api/timeline/${editingTimeline.id}` : '/api/timeline'
      const method = editingTimeline ? 'PATCH' : 'POST'

      const normalizedData = {
        ...data,
        order: Number(data.order) || 0,
        emoji: data.emoji || null,
        accent_color: data.accent_color || null,
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
    { name: 'emoji', label: 'Emoji', type: 'text', required: false, placeholder: 'e.g. 🚀' },
    { name: 'accent_color', label: 'Accent Color', type: 'color', required: false },
  ]

  const columns: GridColumn[] = [
    {
      key: 'emoji',
      label: 'Icon',
      render: (value, row: Timeline) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          {value && <span style={{ fontSize: '1.2rem' }}>{value}</span>}
          {row.accent_color && (
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: row.accent_color,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
          )}
        </span>
      ),
    },
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

  const initialData = editingTimeline
    ? {
        ...editingTimeline,
        emoji: editingTimeline.emoji || '',
        accent_color: editingTimeline.accent_color || '#8b5cf6',
      }
    : { accent_color: '#8b5cf6' }

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
          onReorder={handleReorder}
        />

        <FormModal
          isOpen={isModalOpen}
          title={editingTimeline ? 'Edit Timeline Entry' : 'Add New Timeline Entry'}
          fields={formFields}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitForm}
          isSubmitting={isSubmitting}
          initialData={initialData}
        />
      </div>
    </AdminLayout>
  )
}
