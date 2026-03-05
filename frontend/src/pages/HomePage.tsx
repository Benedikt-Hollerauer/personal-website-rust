import { EdgeArrowNav } from '../components/EdgeArrowNav'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <main className={styles.homePage}>
      <EdgeArrowNav />
      <section className={styles.homePageContent} aria-label="Homepage content">
        <h1>Homepage</h1>
        <p>Use the edge arrows to navigate.</p>
      </section>
    </main>
  )
}
