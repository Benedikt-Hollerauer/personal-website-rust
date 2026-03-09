import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import styles from './ProjectCardSlider.module.css'

export type ProjectCard = {
  id: string
  title: string
  summary: string
  tags: string[]
  year?: string
  keyPoints?: string[]
  location?: string
  link?: string
  startDate?: string
  endDate?: string
  active?: boolean
}

type ProjectCardSliderProps = {
  projects: ProjectCard[]
}

type SlideDirection = 1 | -1

const slideVariants = {
  enter: (direction: SlideDirection) => ({
    x: direction > 0 ? 70 : -70,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: SlideDirection) => ({
    x: direction > 0 ? -70 : 70,
    opacity: 0,
    scale: 0.98,
  }),
}

export function ProjectCardSlider({ projects }: ProjectCardSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(1)
  const isLockedRef = useRef(false)
  const sliderRef = useRef<HTMLElement>(null)

  // Include a special "github" card at the end
  const allItems = [...projects, { id: 'github-card', isGithubCard: true } as any]
  const totalItems = allItems.length

  const hasItems = totalItems > 0
  const isGithubCard = hasItems && activeIndex === projects.length
  const activeProject = hasItems ? allItems[activeIndex] : null

  const moveBy = (step: SlideDirection) => {
    if (totalItems <= 1 || isLockedRef.current) {
      return
    }

    isLockedRef.current = true
    setSlideDirection(step)
    setActiveIndex((current) => {
      const nextIndex = (current + step + totalItems) % totalItems
      return nextIndex
    })

    window.setTimeout(() => {
      isLockedRef.current = false
    }, 360)
  }

  const handleWheel = (event: WheelEvent) => {
    if (Math.abs(event.deltaY) < 8) {
      return
    }

    event.preventDefault()
    moveBy(event.deltaY > 0 ? 1 : -1)
  }

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    slider.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      slider.removeEventListener('wheel', handleWheel)
    }
  }, [totalItems, isLockedRef])

  if (!hasItems) {
    return (
      <section className={styles.sliderEmpty} aria-live="polite">
        <p>No projects yet.</p>
      </section>
    )
  }

  return (
    <section className={styles.sliderShell} ref={sliderRef} aria-label="Project slider">
      <p className={styles.sliderHint}>Scroll to explore projects</p>

      <div className={styles.sliderViewport}>
        <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
          {isGithubCard ? (
            <motion.article
              key="github-card"
              className={styles.githubCard}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.githubCardContent}>
                <h2>More Projects</h2>
                <p className={styles.githubCardText}>
                  Currently no projects eingetragen. Check out more projects on my{' '}
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
                    GitHub
                  </a>
                </p>
              </div>
            </motion.article>
          ) : (
            <motion.article
              key={activeProject.id}
              className={styles.projectCard}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className={styles.projectHeader}>
                <div className={styles.projectTitleSection}>
                  <h2>{activeProject.title}</h2>
                  {activeProject.year ? <span className={styles.year}>{activeProject.year}</span> : null}
                </div>
                {activeProject.location && (
                  <p className={styles.location}>📍 {activeProject.location}</p>
                )}
              </header>

              <p className={styles.projectSummary}>{activeProject.summary}</p>

              {activeProject.link && (
                <a href={activeProject.link} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                  → Visit Project
                </a>
              )}

              {(activeProject.startDate || activeProject.endDate) && (
                <div className={styles.projectDates}>
                  {activeProject.startDate && (
                    <span>
                      Start: {new Date(activeProject.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  )}
                  {activeProject.endDate && (
                    <span>
                      End: {new Date(activeProject.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              )}

              {activeProject.keyPoints && activeProject.keyPoints.length > 0 && (
                <div className={styles.keyPoints}>
                  <h3>Key Points</h3>
                  <ul>
                    {activeProject.keyPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeProject.tags && activeProject.tags.length > 0 && (
                <ul className={styles.projectTags} aria-label="Project tags">
                  {activeProject.tags.map((tag) => (
                    <li key={`${activeProject.id}-${tag}`}>{tag}</li>
                  ))}
                </ul>
              )}
            </motion.article>
          )}
        </AnimatePresence>
      </div>

      <p className={styles.sliderCounter}>
        {activeIndex + 1} / {totalItems}
      </p>
    </section>
  )
}
