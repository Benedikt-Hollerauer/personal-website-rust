import { motion } from 'framer-motion'
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

const RESOURCE_ITEMS = [
  { title: 'Frontend Stack', text: 'React, TypeScript, Framer Motion, and component-first architecture.' },
  { title: 'Backend Stack', text: 'Rust APIs, reliable request handling, and clean data boundaries.' },
  { title: 'Workflow', text: 'Rapid prototypes, refinement loops, and production-ready polish.' },
]

export function ResourcesPage() {
  return (
    <main className={styles.resourcesPage}>
      <EdgeArrowButton
        to="/"
        ariaLabel="Return to homepage"
        label="Home"
        arrow={RESOURCES_HOME_ARROW}
        icon={HOME_ICON}
        direction={Direction.Bottom}
        className={styles.resourcesPageReturn}
      />

      <PageSectionLayout title="Resources" titlePosition="left" className={styles.resourcesLayout}>
        <motion.section
          className={styles.resourcesGrid}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {RESOURCE_ITEMS.map((item) => (
            <article key={item.title} className={styles.resourceCard}>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </motion.section>
      </PageSectionLayout>
    </main>
  )
}
