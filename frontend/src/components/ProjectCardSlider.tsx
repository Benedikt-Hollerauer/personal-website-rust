import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { APP_LINKS } from '../config/links'
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

const GITHUB_PROFILE_URL = APP_LINKS.githubProfile

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
  const touchStartXRef = useRef(0)

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

  // Custom wheel handler for scrollable card content (native event)
  const cardContentRef = useRef<HTMLDivElement>(null);
  // Track if user has scrolled to bottom and needs an extra scroll to switch
  const scrolledToBottomRef = useRef(false);
  const handleCardContentWheel = (event: WheelEvent) => {
    const el = event.currentTarget as HTMLDivElement;
    const scrollingDown = event.deltaY > 0;
    const scrollingUp = event.deltaY < 0;

    if (scrollingDown) {
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (remaining > 0) {
        // Let default scroll happen
        return;
      }
    } else if (scrollingUp) {
      if (el.scrollTop > 0) {
        // Let default scroll happen
        return;
      }
    }
    event.preventDefault();
    moveBy(scrollingDown ? 1 : -1);
  };

  useEffect(() => {
    const el = cardContentRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleCardContentWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleCardContentWheel);
    };
  }, [activeIndex]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveBy(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveBy(1)
    }
  }

  const handleTouchStart = (event: TouchEvent) => {
    touchStartXRef.current = event.touches[0].clientX
  }

  const handleTouchEnd = (event: TouchEvent) => {
    const touchEndX = event.changedTouches[0].clientX
    const diffX = touchStartXRef.current - touchEndX
    const minSwipeDistance = 40

    if (Math.abs(diffX) > minSwipeDistance) {
      moveBy(diffX > 0 ? 1 : -1)
    }
  }

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    slider.addEventListener('wheel', handleWheel, { passive: false })
    slider.addEventListener('touchstart', handleTouchStart, { passive: true })
    slider.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      slider.removeEventListener('wheel', handleWheel)
      slider.removeEventListener('touchstart', handleTouchStart)
      slider.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
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
                  Check out more projects on my{' '}
                  <a href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
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
              <div
                className={styles.projectCardContent}
                ref={cardContentRef}
                tabIndex={0}
              >
                {/* Redesigned Header */}
                <header className={styles.projectHeaderBetter}>
                  <div className={styles.projectHeaderTopRowNoEmoji}>
                    <h2 className={styles.projectTitleBetter}>{activeProject.title}</h2>
                    <div className={styles.projectHeaderTopRightDecor}>
                      <span>🌐</span>
                    </div>
                  </div>
                  <div className={styles.projectDescBetterLeft}>
                    {activeProject.location && (
                      <span className={styles.locationBetter}>📍 {activeProject.location}</span>
                    )}
                    {(activeProject.startDate || activeProject.endDate) && (
                      <span className={styles.projectDatesBetter}>
                        <span className={styles.projectDatesEmoji}>🗓️</span>
                        {activeProject.startDate ? new Date(activeProject.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : ''}
                        {activeProject.startDate && activeProject.endDate ? ' - ' : ''}
                        {activeProject.endDate ? new Date(activeProject.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : ''}
                      </span>
                    )}
                  </div>
                </header>

                {/* Description & Link */}
                {activeProject.summary && (
                  <>
                    <div className={styles.projectSummaryBetter}>
                      {activeProject.summary}
                    </div>
                    {activeProject.link && (
                      <div className={styles.projectLinkButtonWrapperImprovedBetter}>
                        <a
                          href={activeProject.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.githubLinkImproved}
                          title="Check it out here"
                        >
                          🔗 Check it out here
                        </a>
                      </div>
                    )}
                  </>
                )}

                {/* Key Points section */}
                {activeProject.keyPoints && activeProject.keyPoints.length > 0 && (
                  <div className={styles.keyPointsBetterImproved}>
                    <h3>Key Points</h3>
                    <ul>
                      {activeProject.keyPoints.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags section */}
                {activeProject.tags && activeProject.tags.length > 0 && (
                  <ul className={styles.projectTagsBetter} aria-label="Project tags">
                    {activeProject.tags.map((tag: string) => (
                      <li key={`${activeProject.id}-${tag}`}>{tag}</li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.sliderControls}>
        <button
          className={styles.sliderButton}
          onClick={() => moveBy(-1)}
          aria-label="Previous project"
          title="Previous (← Key)"
          disabled={totalItems <= 1}
        >
          ←
        </button>
        <p className={styles.sliderCounter}>
          {activeIndex + 1} / {totalItems}
        </p>
        <button
          className={styles.sliderButton}
          onClick={() => moveBy(1)}
          aria-label="Next project"
          title="Next (→ Key)"
          disabled={totalItems <= 1}
        >
          →
        </button>
      </div>
    </section>
  )
}
