import { useState, useEffect } from 'react'
import styles from './ResourcesGrid.module.css'

interface Resource {
  id: number
  title: string
  description: string
  resource_url: string
  active: boolean
  order: number
}

export function ResourcesGrid() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await fetch('/api/resources?active=true')
        if (!response.ok) throw new Error('Failed to load resources')
        const data = await response.json()
        const active = Array.isArray(data) ? data.filter((r: Resource) => r.active).sort((a, b) => a.order - b.order) : []
        setResources(active)
      } catch (error) {
        console.error('Failed to load resources:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadResources()
  }, [])

  if (isLoading) {
    return (
      <section className={styles.resourcesSection}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Loading resources...
        </div>
      </section>
    )
  }

  if (resources.length === 0) {
    return (
      <section className={styles.resourcesSection}>
        <div className={styles.emptySection}>
          <h3>Resources Coming Soon</h3>
          <p>I'm currently curating resources. Check back soon!</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.resourcesSection}>
      <div className={styles.grid}>
        {resources.map((resource) => (
          <div key={resource.id} className={styles.resourceCard}>
            <h3 className={styles.resourceTitle}>{resource.title}</h3>
            <p className={styles.resourceDescription}>{resource.description}</p>
            <a href={resource.resource_url} target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>
              Visit Resource
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
