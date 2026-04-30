import { Link } from 'react-router-dom'
import { EdgeArrowNav } from '../components/EdgeArrowNav'
import { RotatingText } from '../components/RotatingText'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <main className={styles.homePage}>
      <div className={styles.bgGlow} aria-hidden="true" />
      <EdgeArrowNav />

      <div className={styles.hero}>
        <div className={styles.availability}>
          <span className={styles.availabilityDot} />
          Available for opportunities
        </div>

        <div className={styles.nameBlock}>
          <h1 className={styles.name}>Benediktt</h1>
          <h1 className={styles.name}>Hollerauer</h1>
        </div>

        <p className={styles.role}>Software Engineer</p>

        <section className={styles.scramblePanel} aria-label="Introduction highlights">
          <p className={styles.scrambleLine}>
            <RotatingText />
          </p>
        </section>

        <div className={styles.actions}>
          <Link to="/about" className={styles.btnPrimary}>About Me</Link>
          <Link to="/contact" className={styles.btnSecondary}>Get In Touch</Link>
        </div>
      </div>
    </main>
  )
}
