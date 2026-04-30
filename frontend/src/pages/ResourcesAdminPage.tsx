import { useState, useEffect } from 'react'
import { fetchAuthenticated, uploadFile } from '../utils/api'
import { FormModal, type FormField } from '../components/FormModal'
import { AdminGrid, type GridColumn, type GridAction } from '../components/AdminGrid'
import { AdminLayout } from '../components/AdminLayout'
import styles from './ResourcesAdminPage.module.css'

interface Resource {
  id: number
  title: string
  description: string
  resource_url: string
  active: boolean
  order: number
  created_at: string
  updated_at: string
}

export function ResourcesAdminPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      setIsLoading(true)
      const response = await fetchAuthenticated('/api/resources')
      if (!response.ok) throw new Error('Failed to load resources')
      const data = await response.json()
      setResources(Array.isArray(data) ? data.sort((a, b) => Number(a.order) - Number(b.order)) : [])
    } catch (error) {
      console.error('Failed to load resources:', error)
      alert('Failed to load resources')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddResource = () => {
    setEditingResource(null)
    setIsModalOpen(true)
  }

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource)
    setIsModalOpen(true)
  }

  const handleDeleteResource = async (resource: Resource) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      try {
        const response = await fetchAuthenticated(`/api/resources/${resource.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete resource')
        await loadResources()
      } catch (error) {
        console.error('Failed to delete resource:', error)
        alert('Failed to delete resource')
      }
    }
  }

  const handleReorder = async (reorderedItems: Resource[]) => {
    setResources(reorderedItems)
    try {
      await Promise.all(
        reorderedItems.map((item, index) =>
          fetchAuthenticated(`/api/resources/${item.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ order: index + 1 }),
          })
        )
      )
    } catch (error) {
      console.error('Failed to save order:', error)
      await loadResources()
    }
  }

  const handleToggleActive = async (resource: Resource) => {
    try {
      const response = await fetchAuthenticated(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !resource.active }),
      })
      if (!response.ok) throw new Error('Failed to update resource')
      await loadResources()
    } catch (error) {
      console.error('Failed to toggle resource:', error)
      alert('Failed to toggle resource')
    }
  }

  const handleSubmitForm = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      if (data.resource_file instanceof File) {
        const originalName = (data.resource_file as File).name
        const result = await uploadFile('resources', data.resource_file)
        data.resource_url = result.url
        data.original_filename = originalName
      }

      delete data.resource_file

      // for new resources, file upload is required. for edits, keep existing file when no new one is uploaded.
      if (!editingResource && !data.resource_url) {
        throw new Error('Please upload a file for the resource')
      }

      const url = editingResource ? `/api/resources/${editingResource.id}` : '/api/resources'
      const method = editingResource ? 'PATCH' : 'POST'

      const normalizedData = {
        ...data,
        order: Number(data.order),
      }

      const response = await fetchAuthenticated(url, {
        method,
        body: JSON.stringify(normalizedData),
      })

      if (!response.ok) throw new Error(`Failed to ${editingResource ? 'update' : 'create'} resource`)
      await loadResources()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Form submission error:', error)
      alert(`Failed to ${editingResource ? 'update' : 'create'} resource: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formFields: FormField[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'resource_file', label: 'Resource File', type: 'file', required: !editingResource },
    { name: 'order', label: 'Order', type: 'number', required: true },
    { name: 'active', label: 'Active', type: 'checkbox' },
  ]

  const columns: GridColumn[] = [
    { key: 'title', label: 'Title' },
    {
      key: 'resource_url',
      label: 'Link',
      render: (value) => (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#4285f4' }}>
          Open
        </a>
      ),
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
    { label: 'Edit', variant: 'edit', onClick: handleEditResource },
    { label: 'Toggle', variant: 'toggle', onClick: handleToggleActive },
    { label: 'Delete', variant: 'delete', onClick: handleDeleteResource },
  ]

  return (
    <AdminLayout pageTitle="Resources" onAddClick={handleAddResource} addButtonLabel="+ Add Resource">
      <div className={styles.page}>
        <AdminGrid
          title="Resources"
          columns={columns}
          data={resources}
          actions={actions}
          onAdd={handleAddResource}
          isLoading={isLoading}
          emptyMessage="No resources yet. Create your first one!"
          onReorder={handleReorder}
        />

        <FormModal
          isOpen={isModalOpen}
          title={editingResource ? 'Edit Resource' : 'Add New Resource'}
          fields={formFields}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={editingResource || {}}
          isSubmitting={isSubmitting}
          submitLabel={editingResource ? 'Update' : 'Create'}
        >
          {editingResource?.resource_url && (
            <div className={styles.currentFilePreview}>
              <p>Current file:</p>
              <a href={editingResource.resource_url} target="_blank" rel="noreferrer">
                {(editingResource.resource_url.split('/').pop()) || 'download'}
              </a>
            </div>
          )}
        </FormModal>
      </div>
    </AdminLayout>
  )
}
