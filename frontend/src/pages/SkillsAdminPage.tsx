import { useState, useEffect } from 'react'
import { fetchAuthenticated, uploadFile } from '../utils/api'
import { FormModal, type FormField } from '../components/FormModal'
import { AdminGrid, type GridColumn, type GridAction } from '../components/AdminGrid'
import { AdminLayout } from '../components/AdminLayout'
import styles from './SkillsAdminPage.module.css'

interface Skill {
  id: number
  name: string
  icon_path: string
  link: string
  active: boolean
  order: number
  created_at: string
  updated_at: string
}

export function SkillsAdminPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      setIsLoading(true)
      const response = await fetchAuthenticated('/api/skills')
      if (!response.ok) throw new Error('Failed to load skills')
      const data = await response.json()
      setSkills(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : [])
    } catch (error) {
      console.error('Failed to load skills:', error)
      alert('Failed to load skills')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSkill = () => {
    setEditingSkill(null)
    setIsModalOpen(true)
  }

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill)
    setIsModalOpen(true)
  }

  const handleDeleteSkill = async (skill: Skill) => {
    if (confirm(`Are you sure you want to delete "${skill.name}"?`)) {
      try {
        const response = await fetchAuthenticated(`/api/skills/${skill.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete skill')
        await loadSkills()
      } catch (error) {
        console.error('Failed to delete skill:', error)
        alert('Failed to delete skill')
      }
    }
  }

  const handleToggleActive = async (skill: Skill) => {
    try {
      const response = await fetchAuthenticated(`/api/skills/${skill.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !skill.active }),
      })
      if (!response.ok) throw new Error('Failed to update skill')
      await loadSkills()
    } catch (error) {
      console.error('Failed to toggle skill:', error)
      alert('Failed to toggle skill')
    }
  }

  const handleSubmitForm = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      // if a new icon file was selected upload it first
      if (data.icon_file instanceof File) {
        const result = await uploadFile('skills', data.icon_file)
        data.icon_path = result.url
      }

      // clean up temporary fields
      delete data.icon_file

      const url = editingSkill ? `/api/skills/${editingSkill.id}` : '/api/skills'
      const method = editingSkill ? 'PATCH' : 'POST'

      const normalizedData = {
        ...data,
        order: data.order === undefined || data.order === '' ? undefined : Number(data.order),
      }

      const response = await fetchAuthenticated(url, {
        method,
        body: JSON.stringify(normalizedData),
      })

      if (!response.ok) throw new Error(`Failed to ${editingSkill ? 'update' : 'create'} skill`)
      await loadSkills()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Form submission error:', error)
      alert(`Failed to ${editingSkill ? 'update' : 'create'} skill`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formFields: FormField[] = [
    { name: 'name', label: 'Skill Name', type: 'text', required: true, placeholder: 'e.g., React' },
    { name: 'icon_file', label: 'Icon File', type: 'file' },
    { name: 'link', label: 'Link', type: 'url', placeholder: 'https://react.dev' },
    { name: 'order', label: 'Display Order', type: 'number' },
    { name: 'active', label: 'Active', type: 'checkbox' },
  ]

  const columns: GridColumn[] = [
    { key: 'icon_path', label: 'Icon', render: (val) =>
        val ? <img src={val} alt="icon" style={{ width: 32, height: 32, objectFit: 'cover' }} /> : '—'
    },
    { key: 'name', label: 'Name' },
    { key: 'link', label: 'Link', render: (value) => value ? <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#4a9eff' }}>View</a> : 'N/A' },
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
    { label: 'Edit', variant: 'edit', onClick: handleEditSkill },
    { label: 'Toggle', variant: 'toggle', onClick: handleToggleActive },
    { label: 'Delete', variant: 'delete', onClick: handleDeleteSkill },
  ]

  return (
    <AdminLayout pageTitle="Skills" onAddClick={handleAddSkill} addButtonLabel="+ Add Skill">
      <div className={styles.skillsPage}>
        <AdminGrid
          title="Skills"
          columns={columns}
          data={skills}
          actions={actions}
          onAdd={handleAddSkill}
          isLoading={isLoading}
          emptyMessage="No skills yet. Create your first skill!"
        />

        <FormModal
          isOpen={isModalOpen}
          title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
          fields={formFields}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={editingSkill || {}}
          isSubmitting={isSubmitting}
          submitLabel={editingSkill ? 'Update' : 'Create'}
        >
          {/* when editing, show current icon preview and allow deletion */}
          {editingSkill?.icon_path && (
            <div className={styles.currentIconPreview}>
              <p>Current icon:</p>
              <img src={editingSkill.icon_path} alt="current icon" style={{ width: 48, height: 48, objectFit: 'cover' }} />
            </div>
          )}
        </FormModal>
      </div>
    </AdminLayout>
  )
}
