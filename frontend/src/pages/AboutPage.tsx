import { motion } from 'framer-motion'
import { EdgeArrowButton } from '../components/EdgeArrowButton'
import { HOME_ICON } from '../components/EdgeArrowNav'
import { PageSectionLayout } from '../components/PageSectionLayout'
import { Direction } from '../types'
import styles from './AboutPage.module.css'

const ABOUT_HOME_ARROW = (
  <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const ABOUT_ITEMS = [
  'Building modern web apps with Rust + React.',
  'Designing directional, motion-driven interfaces.',
  'Focused on clean architecture and fast user experiences.',
]

export function AboutPage() {
  return (
    <main className={styles.aboutPage}>
      <EdgeArrowButton
        to="/"
        ariaLabel="Return to homepage"
        label="Home"
        arrow={ABOUT_HOME_ARROW}
        icon={HOME_ICON}
        direction={Direction.Right}
        className={styles.aboutPageReturn}
      />

      <PageSectionLayout title="About" titlePosition="top" className={styles.aboutLayout}>
        <motion.section
          className={styles.aboutCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>
            This section is the base for your full About story. The layout now matches your global rule:
            title on top, components underneath.
          </p>
          <ul className={styles.aboutList}>
            {ABOUT_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.section>
      </PageSectionLayout>
    </main>
  )
}
