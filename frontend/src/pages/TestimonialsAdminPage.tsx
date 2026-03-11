import { useState, useEffect } from 'react'
import { fetchAuthenticated } from '../utils/api'
import { FormModal, type FormField } from '../components/FormModal'
import { AdminGrid, type GridColumn, type GridAction } from '../components/AdminGrid'
import { AdminLayout } from '../components/AdminLayout'
import styles from './TestimonialsAdminPage.module.css'

interface Testimonial {
  id: number
  name: string
  role: string
  link?: string
  content: string
  active: boolean
  order: number
  created_at: string
  updated_at: string
}

export function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      setIsLoading(true)
      const response = await fetchAuthenticated('/api/testimonials')
      if (!response.ok) throw new Error('Failed to load testimonials')
      const data = await response.json()
      setTestimonials(Array.isArray(data) ? data.sort((a, b) => Number(a.order) - Number(b.order)) : [])
    } catch (error) {
      console.error('Failed to load testimonials:', error)
      alert('Failed to load testimonials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTestimonial = () => {
    setEditingTestimonial(null)
    setIsModalOpen(true)
  }

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setIsModalOpen(true)
  }

  const handleDeleteTestimonial = async (testimonial: Testimonial) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const response = await fetchAuthenticated(`/api/testimonials/${testimonial.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete testimonial')
        await loadTestimonials()
      } catch (error) {
        console.error('Failed to delete testimonial:', error)
        alert('Failed to delete testimonial')
      }
    }
  }

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      const response = await fetchAuthenticated(`/api/testimonials/${testimonial.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !testimonial.active }),
      })
      if (!response.ok) throw new Error('Failed to update testimonial')
      await loadTestimonials()
    } catch (error) {
      console.error('Failed to toggle testimonial:', error)
      alert('Failed to toggle testimonial')
    }
  }

  const handleSubmitForm = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      const url = editingTestimonial ? `/api/testimonials/${editingTestimonial.id}` : '/api/testimonials'
      const method = editingTestimonial ? 'PATCH' : 'POST'
      const normalizedData = {
        ...data,
        order: Number(data.order),
        link: typeof data.link === 'string' && data.link.trim() ? data.link.trim() : undefined,
      }

      const response = await fetchAuthenticated(url, {
        method,
        body: JSON.stringify(normalizedData),
      })

      if (!response.ok) throw new Error(`Failed to ${editingTestimonial ? 'update' : 'create'} testimonial`)
      await loadTestimonials()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Form submission error:', error)
      alert(`Failed to ${editingTestimonial ? 'update' : 'create'} testimonial`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formFields: FormField[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'text', required: true },
    { name: 'link', label: 'Link', type: 'url' },
    { name: 'content', label: 'Testimonial', type: 'textarea', required: true },
    { name: 'order', label: 'Order', type: 'number', required: true },
    { name: 'active', label: 'Active', type: 'checkbox' },
  ]

  const columns: GridColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    {
      key: 'content',
      label: 'Quote',
      render: (value) => value.substring(0, 80) + (value.length > 80 ? '...' : ''),
    },
    { key: 'order', label: 'Order' },
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
    { label: 'Edit', variant: 'edit', onClick: handleEditTestimonial },
    { label: 'Toggle', variant: 'toggle', onClick: handleToggleActive },
    { label: 'Delete', variant: 'delete', onClick: handleDeleteTestimonial },
  ]

  return (
    <AdminLayout pageTitle="Testimonials" onAddClick={handleAddTestimonial} addButtonLabel="+ Add Testimonial">
      <div className={styles.page}>
        <AdminGrid
          title="Testimonials"
          columns={columns}
          data={testimonials}
          actions={actions}
          onAdd={handleAddTestimonial}
          isLoading={isLoading}
          emptyMessage="No testimonials yet. Create your first one!"
        />

        <FormModal
          isOpen={isModalOpen}
          title={editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          fields={formFields}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={editingTestimonial || {}}
          isSubmitting={isSubmitting}
          submitLabel={editingTestimonial ? 'Update' : 'Create'}
        />
      </div>
    </AdminLayout>
  )
}
