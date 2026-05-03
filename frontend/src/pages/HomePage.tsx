import { Link } from 'react-router-dom'
import { EdgeArrowNav } from '../components/EdgeArrowNav'
import { RotatingText } from '../components/RotatingText'
import { ThemeToggle } from '../components/ThemeToggle'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <main className={styles.homePage}>
      <div className={styles.bgGlow} aria-hidden="true" />
      <EdgeArrowNav />

      <div className={styles.themeToggleWrap}>
        <ThemeToggle />
      </div>

      <div className={styles.hero}>
        <div className={styles.availability}>
          <span className={styles.availabilityDot} />
          <span>Available for opportunities</span>
          <Link to="/contact" className={styles.availabilityCta}>Let's talk →</Link>
        </div>

        <div className={styles.nameBlock}>
          <h1 className={styles.name}>Benedikt</h1>
          <h1 className={styles.name}>Hollerauer</h1>
        </div>

        <p className={styles.role}>Software Engineer</p>

        <section className={styles.scramblePanel} aria-label="Introduction highlights">
          <p className={styles.scrambleLine}>
            <RotatingText />
          </p>
        </section>

        <div className={styles.actions}>
          <Link to="/projects" className={styles.btnPrimary}>View Projects →</Link>
          <Link to="/about" className={styles.btnSecondary}>About Me</Link>
        </div>
      </div>
    </main>
  )
}
