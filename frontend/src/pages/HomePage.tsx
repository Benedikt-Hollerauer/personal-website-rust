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
          <div className={styles.nameBlock}>
            <h1 className={styles.name}>BENEDIKT</h1>
            <h1 className={styles.name}>HOLLERAUER</h1>
            <p className={styles.role}>Software Engineer</p>
          </div>

          <section className={styles.scramblePanel} aria-label="Introduction highlights">
            <p className={styles.scrambleLine}>
              <RotatingText />
            </p>
          </section>
        </section>
      </PageSectionLayout>
    </main>
  )
}