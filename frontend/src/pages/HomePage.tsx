import { EdgeArrowNav } from '../components/EdgeArrowNav'
import { PageSectionLayout } from '../components/PageSectionLayout'
import { RotatingText } from '../components/RotatingText'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <main className={styles.homePage}>
      <EdgeArrowNav />
      <PageSectionLayout titlePosition="top" ariaLabel="Homepage" className={styles.homeLayout}>
        <section className={styles.homePageContent} aria-label="Homepage content">
          <h2>Homepage</h2>
          <p>Use the navigation to explore the site.</p>
          <p className={styles.rotatingLine}>
            <RotatingText />
          </p>
        </section>
      </PageSectionLayout>
    </main>
  )
}