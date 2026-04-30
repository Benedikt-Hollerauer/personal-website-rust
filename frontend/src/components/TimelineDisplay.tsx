import { useState, useEffect } from 'react'
import styles from './TimelineDisplay.module.css'

interface TimelineEntry {
  id: number
  title: string
  description: string
  start_date: string
  end_date?: string
  order: number
  emoji?: string | null
  accent_color?: string | null
}

export function TimelineDisplay() {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const response = await fetch('/api/timeline')
        if (!response.ok) throw new Error('Failed to load timeline')
        const data = await response.json()
        const sorted = Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : []
        setEntries(sorted)
      } catch (error) {
        console.error('Failed to load timeline:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTimeline()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }

  if (isLoading) {
    return (
      <section className={styles.timelineSection}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Loading timeline...
        </div>
      </section>
    )
  }

  if (entries.length === 0) {
    return (
      <section className={styles.timelineSection}>
        <div className={styles.empty}>No timeline entries available yet.</div>
      </section>
    )
  }

  return (
    <section className={styles.timelineSection}>
      <div className={styles.timeline}>
        {entries.map((entry) => {
          const dotColor = entry.accent_color || 'var(--accent-primary)'
          return (
            <div key={entry.id} className={styles.timelineItem}>
              <div className={styles.timelineMarker}>
                {entry.emoji ? (
                  <div className={styles.emojiDot}>{entry.emoji}</div>
                ) : (
                  <div className={styles.dot} style={{ background: dotColor, boxShadow: `0 0 0 2px ${dotColor}` }} />
                )}
                <div className={styles.line} style={{ background: dotColor + '55' }} />
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.period}>
                  {formatDate(entry.start_date)} -{' '}
                  {entry.end_date ? formatDate(entry.end_date) : 'Present'}
                </div>
                <div className={styles.title} style={{ color: dotColor }}>
                  {entry.title}
                </div>
                <div className={styles.description}>{entry.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
