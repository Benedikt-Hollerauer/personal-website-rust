import { useState, useEffect } from 'react'
import styles from './AboutSection.module.css'

interface AboutText {
  id: number
  content: string
  active: boolean
}

export function AboutSection() {
  const [aboutText, setAboutText] = useState<AboutText | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAboutText = async () => {
      try {
        const response = await fetch('/api/about-texts?active=true')
        if (!response.ok) throw new Error('Failed to load about text')
        const data = await response.json()
        const active = Array.isArray(data) ? data.find((t: AboutText) => t.active) : null
        setAboutText(active || null)
      } catch (error) {
        console.error('Failed to load about text:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAboutText()
  }, [])

  if (isLoading) {
    return (
      <section className={styles.aboutSection}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Loading...
        </div>
      </section>
    )
  }

  if (!aboutText) {
    return (
      <section className={styles.aboutSection}>
        <div className={styles.empty}>No about information available yet.</div>
      </section>
    )
  }

  return (
    <section className={styles.aboutSection}>
      <div className={styles.content}>{aboutText.content}</div>
    </section>
  )
}
