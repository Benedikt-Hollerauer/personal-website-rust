import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { BackgroundCard } from '../components/BackgroundCard'
import { EdgeArrowButton } from '../components/EdgeArrowButton'
import { HOME_ICON } from '../components/EdgeArrowNav'
import { PageSectionLayout } from '../components/PageSectionLayout'
import { Direction } from '../types'
import styles from './ResourcesPage.module.css'

const RESOURCES_HOME_ARROW = (
  <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="19 12 12 19 5 12" />
  </svg>
)

type ApiResource = {
  id?: string | number
  title?: string
  description?: string
  resource?: string
  url?: string
  downloadUrl?: string
  isCv?: boolean
  resource_url?: string
}

type ResourceCard = {
  id: string
  title: string
  description: string
  href: string
  isCv: boolean
}

function normalizeResource(item: ApiResource, index: number): ResourceCard {
  const title = item.title?.trim() || `Resource ${index + 1}`
  const description = item.description?.trim() || ''
  const href = item.downloadUrl || item.resource || item.url || (item as any).resource_url || '#'
  const isCv = Boolean(item.isCv) || /\bcv\b/i.test(title)

  return {
    id: String(item.id ?? `resource-${index}`),
    title,
    description,
    href,
    isCv,
  }
}

export function ResourcesPage() {
  const [resources, setResources] = useState<ResourceCard[]>([])

  useEffect(() => {
    const abortController = new AbortController()

    fetch('/api/resources-public', { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load resources')
        return response.json() as Promise<ApiResource[] | { resources?: ApiResource[] }>
      })
      .then((payload) => {
        const list = Array.isArray(payload) ? payload : payload.resources
        if (!Array.isArray(list) || list.length === 0) {
          setResources([])
          return
        }
        setResources(list.map(normalizeResource))
      })
      .catch(() => setResources([]))

    return () => abortController.abort()
  }, [])

  const sortedResources = useMemo(() => {
    return [...resources].sort((a, b) => Number(b.isCv) - Number(a.isCv))
  }, [resources])

  return (
    <main className={styles.resourcesPage}>
      <EdgeArrowButton
        to="/"
        ariaLabel="Return to homepage"
        label="Home"
        arrow={RESOURCES_HOME_ARROW}
        icon={HOME_ICON}
        direction={Direction.Bottom}
        asReturnButton
        className={styles.resourcesPageReturn}
      />

      <PageSectionLayout title="Resources" titlePosition="left" navRail="bottom" className={styles.resourcesLayout}>
        {sortedResources.length > 0 && (
          <motion.section
            className={styles.resourcesGrid}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {sortedResources.map((item, index) => (
              <BackgroundCard
                key={item.id}
                as="article"
                size="md"
                className={`${styles.resourceCard} ${item.isCv ? styles.resourceCardCv : ''}`}
              >
                <h2>{item.title}</h2>
                {item.description && <p>{item.description}</p>}
                <a
                  className={styles.downloadButton}
                  href={(() => {
                    const url = item.href
                    if (!url.startsWith('/api/files/')) return url
                    const lastSegment = url.split('/').pop() || ''
                    const dot = lastSegment.lastIndexOf('.')
                    const ext = dot !== -1 ? lastSegment.substring(dot + 1) : ''
                    const downloadName = ext ? `${item.title}.${ext}` : item.title
                    return `${url}?name=${encodeURIComponent(downloadName)}`
                  })()}
                  download
                  rel="noreferrer"
                >
                  Download
                </a>
                {item.isCv && index === 0 && <span className={styles.cvBadge}>Highlighted</span>}
              </BackgroundCard>
            ))}
          </motion.section>
        )}
      </PageSectionLayout>
    </main>
  )
}
