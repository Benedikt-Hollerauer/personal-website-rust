import { useState, useEffect } from 'react'
import styles from './SkillsGallery.module.css'

interface Skill {
  id: number
  name: string
  icon_path?: string
  link?: string
  active: boolean
  order: number
}

export function SkillsGallery() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await fetch('/api/skills?active=true')
        if (!response.ok) throw new Error('Failed to load skills')
        const data = await response.json()
        const active = Array.isArray(data) ? data.filter((s: Skill) => s.active).sort((a, b) => a.order - b.order) : []
        setSkills(active)
      } catch (error) {
        console.error('Failed to load skills:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSkills()
  }, [])

  if (isLoading) {
    return (
      <section className={styles.skillsGallery}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Loading skills...
        </div>
      </section>
    )
  }

  if (skills.length === 0) {
    return (
      <section className={styles.skillsGallery}>
        <div className={styles.emptySection}>
          <h3>Skills Coming Soon</h3>
          <p>I'm currently updating my skills section. Check back soon!</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.skillsGallery}>
      <div className={styles.grid}>
        {skills.map((skill) => (
          <div key={skill.id} className={styles.skillCard}>
            {skill.icon_path && (
              <img
                src={skill.icon_path}
                alt={skill.name}
                className={styles.skillIcon}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <div className={styles.skillName}>{skill.name}</div>
            {skill.link && (
              <a href={skill.link} target="_blank" rel="noopener noreferrer" className={styles.skillLink}>
                Learn more
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
