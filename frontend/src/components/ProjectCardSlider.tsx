import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import styles from './ProjectCardSlider.module.css'

export type ProjectCard = {
  id: string
  title: string
  summary: string
  tags: string[]
  year?: string
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

  const hasProjects = projects.length > 0
  const activeProject = useMemo(
    () => (hasProjects ? projects[activeIndex] : null),
    [activeIndex, hasProjects, projects],
  )

  const moveBy = (step: SlideDirection) => {
    if (projects.length <= 1 || isLockedRef.current) {
      return
    }

    isLockedRef.current = true
    setSlideDirection(step)
    setActiveIndex((current) => {
      const nextIndex = (current + step + projects.length) % projects.length
      return nextIndex
    })

    window.setTimeout(() => {
      isLockedRef.current = false
    }, 360)
  }

  const handleWheel: React.WheelEventHandler<HTMLElement> = (event) => {
    if (Math.abs(event.deltaY) < 8) {
      return
    }

    event.preventDefault()
    moveBy(event.deltaY > 0 ? 1 : -1)
  }

  if (!activeProject) {
    return (
      <section className={styles.sliderEmpty} aria-live="polite">
        <p>No projects yet.</p>
      </section>
    )
  }

  return (
    <section className={styles.sliderShell} onWheel={handleWheel} aria-label="Project slider">
      <p className={styles.sliderHint}>Scroll to explore projects</p>

      <div className={styles.sliderViewport}>
        <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
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
              <h2>{activeProject.title}</h2>
              {activeProject.year ? <span>{activeProject.year}</span> : null}
            </header>

            <p className={styles.projectSummary}>{activeProject.summary}</p>

            <ul className={styles.projectTags} aria-label="Project tags">
              {activeProject.tags.map((tag) => (
                <li key={`${activeProject.id}-${tag}`}>{tag}</li>
              ))}
            </ul>
          </motion.article>
        </AnimatePresence>
      </div>

      <p className={styles.sliderCounter}>
        {activeIndex + 1} / {projects.length}
      </p>
    </section>
  )
}
