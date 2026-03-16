import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BackgroundCard } from '../components/BackgroundCard'
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

type ApiAbout = {
  text?: string
  about?: string
  paragraphs?: string[]
}

type ApiSkill = {
  id?: string | number
  name?: string
  title?: string
  order?: number
  icon?: string
  emoji?: string
  iconUrl?: string
  // backend stores path in snake_case
  icon_path?: string
}

type SkillItem = {
  id: string
  label: string
  iconText?: string
  iconUrl?: string
}

type ApiTestimonial = {
  id?: string | number
  name?: string
  author?: string
  order?: number
  role?: string
  link?: string
  title?: string
  position?: string
  text?: string
  message?: string
  content?: string
  quote?: string
}

type TestimonialItem = {
  id: string
  name: string
  role: string
  link?: string
  text: string
}

type ApiWorkHistory = {
  id?: string | number
  year?: string | number
  order?: number
  title?: string
  role?: string
  position?: string
  text?: string
  description?: string
  summary?: string
  emoji?: string
  icon?: string
  accentColor?: string
  color?: string
}

type WorkHistoryItem = {
  id: string
  year: string
  title: string
  text: string
  emoji: string
  accentColor: string
}

const FALLBACK_ABOUT_PARAGRAPHS = [
  'Hey there, I am Bene.',
  'I am a software engineer based in Bavaria, Germany.',
  'I love turning ideas into solid, well-tested software that actually works. I specialize in functional programming and software architecture.',
  'My mission is to build reliable, professional software while continuously learning and improving.',
]

const FALLBACK_SKILLS: SkillItem[] = [
  { id: 'web', label: 'Web Development', iconText: '<>' },
  { id: 'python', label: 'Python', iconText: 'Py' },
  { id: 'math', label: 'Mathematics', iconText: 'f(x)' },
  { id: 'ai', label: 'AI', iconText: 'AI' },
  { id: 'docker', label: 'Docker', iconText: 'DK' },
  { id: 'rust', label: 'Rust', iconText: 'RS' },
  { id: 'scala', label: 'Scala', iconText: 'SC' },
  { id: 'linux', label: 'Linux', iconText: 'LX' },
  { id: 'sql', label: 'SQL', iconText: 'SQL' },
  { id: 'cloud', label: 'Cloud', iconText: 'CL' },
]

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-1',
    name: 'Thomas Hofer',
    role: 'Senior Software Engineer',
    text:
      'Bene combines technical depth with clear communication. He contributes reliable code and helps teams move faster with pragmatic solutions.',
  },
  {
    id: 't-2',
    name: 'Markus Ziegler',
    role: 'Senior Software Engineer',
    text:
      'Fast to adapt, calm under pressure, and consistently focused on quality. A strong teammate for challenging engineering tasks.',
  },
  {
    id: 't-3',
    name: 'Jannik Meier',
    role: 'Software Developer',
    text:
      'Working with Bene is productive and enjoyable. He supports collaboration and keeps delivery standards high.',
  },
  {
    id: 't-4',
    name: 'Basit Rehman',
    role: 'Software Developer',
    text:
      'Bene quickly understands new stacks and improves existing architecture with practical, maintainable changes.',
  },
]

const FALLBACK_WORK_HISTORY: WorkHistoryItem[] = [
  {
    id: 'history-1',
    year: '2021',
    title: 'Full-Stack Software Engineer',
    text: 'At boerse.de Group AG, I processed large data sets, built internal tools, and delivered new website features.',
    emoji: '👨‍💻',
    accentColor: '#8b5cf6',
  },
  {
    id: 'history-2',
    year: '2022',
    title: 'Career Transition',
    text: 'In a bridging warehouse role, I managed stock, coordinated shipments, and kept operations running smoothly.',
    emoji: '📦',
    accentColor: '#f59e0b',
  },
  {
    id: 'history-3',
    year: '2024',
    title: 'Software Engineer',
    text: 'I returned full-time to software and focused on architecture, delivery quality, and maintainable implementations.',
    emoji: '🧠',
    accentColor: '#22c55e',
  },
  {
    id: 'history-4',
    year: '2025',
    title: 'Software Engineer, Founder',
    text: 'I started building products independently while continuing to deliver robust software engineering projects.',
    emoji: '🚀',
    accentColor: '#ef4444',
  },
]

const MORE_SKILLS_LINK = '/resources'

function normalizeSkill(skill: ApiSkill, index: number): SkillItem {
  const label = skill.name?.trim() || skill.title?.trim() || `Skill ${index + 1}`
  // backend may return icon_path or iconUrl or other fields depending on API
  const iconUrl =
    skill.iconUrl?.trim() ||
    (skill as any).icon_path?.trim() ||
    skill.icon?.trim() ||
    skill.emoji?.trim()
  const iconText = skill.icon?.trim() || skill.emoji?.trim() || label.slice(0, 2).toUpperCase()

  return {
    id: String(skill.id ?? `skill-${index}`),
    label,
    iconUrl: iconUrl || undefined,
    iconText,
  }
}

function normalizeAboutParagraphs(payload: ApiAbout): string[] {
  if (Array.isArray(payload.paragraphs) && payload.paragraphs.length > 0) {
    return payload.paragraphs.filter(Boolean)
  }

  const combined = payload.text?.trim() || payload.about?.trim()
  if (!combined) {
    return []
  }

  return combined
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function normalizeTestimonial(item: ApiTestimonial, index: number): TestimonialItem {
  const name = item.name?.trim() || item.author?.trim() || `Reference ${index + 1}`
  const role = item.role?.trim() || item.title?.trim() || item.position?.trim() || 'Professional Reference'
  const link = item.link?.trim() || undefined
  const text = item.text?.trim() || item.message?.trim() || item.content?.trim() || item.quote?.trim() || 'Recommendation unavailable.'

  return {
    id: String(item.id ?? `testimonial-${index}`),
    name,
    role,
    link,
    text,
  }
}

function normalizeWorkHistory(item: ApiWorkHistory, index: number): WorkHistoryItem {
  const yearRaw = item.year ?? `20${20 + index}`
  const title = item.title?.trim() || item.role?.trim() || item.position?.trim() || `Career Milestone ${index + 1}`
  const text = item.text?.trim() || item.description?.trim() || item.summary?.trim() || 'More details coming soon.'
  const emoji = item.emoji?.trim() || item.icon?.trim() || '💼'
  const accentColor = item.accentColor?.trim() || item.color?.trim() || '#3b82f6'

  return {
    id: String(item.id ?? `history-${index}`),
    year: String(yearRaw),
    title,
    text,
    emoji,
    accentColor,
  }
}

export function AboutPage() {
  const [aboutParagraphs, setAboutParagraphs] = useState<string[]>(FALLBACK_ABOUT_PARAGRAPHS)
  const [skills, setSkills] = useState<SkillItem[]>(FALLBACK_SKILLS)
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(FALLBACK_TESTIMONIALS)
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>(FALLBACK_WORK_HISTORY)
  const [timelineProgress, setTimelineProgress] = useState(0)
  const timelineRef = useRef<HTMLElement | null>(null)
  const markerRefs = useRef<Array<HTMLDivElement | null>>([])

  const getMarkerProgress = (index: number): number => {
    const timelineElement = timelineRef.current
    const markerElement = markerRefs.current[index]

    if (!timelineElement || !markerElement) {
      return workHistory.length <= 1 ? 0 : index / (workHistory.length - 1)
    }

    const sectionHeight = timelineElement.scrollHeight || timelineElement.getBoundingClientRect().height || 1
    const markerCenter = markerElement.offsetTop + markerElement.offsetHeight / 2
    return Math.max(0, Math.min(1, markerCenter / sectionHeight))
  }

  useEffect(() => {
    const abortController = new AbortController()

    fetch('/api/about', { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load about text')
        }

        return response.json() as Promise<ApiAbout>
      })
      .then((payload) => {
        const normalized = normalizeAboutParagraphs(payload)
        if (normalized.length > 0) {
          setAboutParagraphs(normalized)
        } else {
          setAboutParagraphs([])
        }
      })
      .catch(() => {
        setAboutParagraphs([])
      })

    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    fetch('/api/work-history', { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load work history')
        }

        return response.json() as Promise<
          ApiWorkHistory[] | { history?: ApiWorkHistory[]; timeline?: ApiWorkHistory[]; items?: ApiWorkHistory[] }
        >
      })
      .then((payload) => {
        const list = Array.isArray(payload)
          ? payload
          : payload.history || payload.timeline || payload.items

        if (!Array.isArray(list) || list.length === 0) {
          setWorkHistory([])
          return
        }

        const sorted = [...list].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
        setWorkHistory(sorted.map(normalizeWorkHistory))
      })
      .catch(() => {
        setWorkHistory([])
      })

    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    const updateTimelineProgress = () => {
      const timelineElement = timelineRef.current
      if (!timelineElement) {
        return
      }

      const scrollContainer = timelineElement.closest<HTMLElement>('[data-page-content-scroll="true"]')

      const rect = timelineElement.getBoundingClientRect()
      const sectionHeight = timelineElement.scrollHeight || rect.height || 1

      let sectionTop = 0
      let triggerPoint = 0

      if (scrollContainer) {
        const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight
        if (scrollContainer.scrollTop >= maxScrollTop - 2) {
          setTimelineProgress(1)
          return
        }

        const containerRect = scrollContainer.getBoundingClientRect()
        sectionTop = rect.top - containerRect.top + scrollContainer.scrollTop
        // Use the container bottom edge as the trigger so the final item is always reachable.
        triggerPoint = scrollContainer.scrollTop + scrollContainer.clientHeight

        const sectionBottom = sectionTop + sectionHeight
        if (triggerPoint >= sectionBottom - 2) {
          setTimelineProgress(1)
          return
        }
      } else {
        sectionTop = rect.top + window.scrollY
        // Fallback for non-container scrolling contexts.
        triggerPoint = window.scrollY + window.innerHeight

        const sectionBottom = sectionTop + sectionHeight
        if (triggerPoint >= sectionBottom - 2) {
          setTimelineProgress(1)
          return
        }
      }

      const rawProgress = (triggerPoint - sectionTop) / sectionHeight
      const clampedProgress = Math.max(0, Math.min(1, rawProgress))

      setTimelineProgress(clampedProgress)
    }

    const timelineElement = timelineRef.current
    const scrollContainer = timelineElement?.closest<HTMLElement>('[data-page-content-scroll="true"]') ?? null

    updateTimelineProgress()

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateTimelineProgress, { passive: true })
    } else {
      window.addEventListener('scroll', updateTimelineProgress, { passive: true })
    }

    window.addEventListener('resize', updateTimelineProgress)

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateTimelineProgress)
      } else {
        window.removeEventListener('scroll', updateTimelineProgress)
      }

      window.removeEventListener('resize', updateTimelineProgress)
    }
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    fetch('/api/testimonials-public', { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load testimonials')
        }

        return response.json() as Promise<ApiTestimonial[] | { testimonials?: ApiTestimonial[] }>
      })
      .then((payload) => {
        const list = Array.isArray(payload) ? payload : payload.testimonials
        if (!Array.isArray(list) || list.length === 0) {
          setTestimonials([])
          return
        }

        const sorted = [...list].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
        setTestimonials(sorted.map(normalizeTestimonial))
      })
      .catch(() => {
        setTestimonials([])
      })

    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    fetch('/api/skills-public', { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load skills')
        }

        return response.json() as Promise<ApiSkill[] | { skills?: ApiSkill[] }>
      })
      .then((payload) => {
        const list = Array.isArray(payload) ? payload : payload.skills
        if (!Array.isArray(list) || list.length === 0) {
          setSkills([])
          return
        }

        const sorted = [...list].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
        setSkills(sorted.map(normalizeSkill))
      })
      .catch(() => {
        setSkills([])
      })

    return () => {
      abortController.abort()
    }
  }, [])

  const visibleSkills = useMemo(() => skills.slice(0, 10), [skills])
  const extraSkills = Math.max(0, skills.length - visibleSkills.length)

  return (
    <main className={styles.aboutPage}>
      <EdgeArrowButton
        to="/"
        ariaLabel="Return to homepage"
        label="Home"
        arrow={ABOUT_HOME_ARROW}
        icon={HOME_ICON}
        direction={Direction.Right}
        asReturnButton
        className={styles.aboutPageReturn}
      />

      <PageSectionLayout title="About" titlePosition="top" navRail="right" className={styles.aboutLayout}>
        <motion.div
          className={styles.aboutStack}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* About Text Section: Only render if there are active paragraphs */}
          {aboutParagraphs.length > 0 && (
            <BackgroundCard className={styles.aboutCard} size="lg">
              <div className={styles.aboutTextBlock}>
                {aboutParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </BackgroundCard>
          )}

          {/* Skills Section: Only render if there are active skills */}
          {visibleSkills.length > 0 && (
            <BackgroundCard className={styles.skillsHeadingCard}>
              <h2>THESE ARE MY CURRENT SKILLS</h2>
            </BackgroundCard>
          )}

          {visibleSkills.length > 0 && (
            <BackgroundCard className={styles.skillsContainer} size="lg">
              <section className={styles.skillsRow} aria-label="Current skills">
                {visibleSkills.map((skill) => (
                  <BackgroundCard
                    key={skill.id}
                    as="article"
                    size="sm"
                    className={styles.skillTile}
                  >
                    {skill.iconUrl ? (
                      <img className={styles.skillIconImage} src={skill.iconUrl} alt={skill.label} />
                    ) : (
                      <span className={styles.skillFallbackIcon} aria-hidden="true">
                        {skill.iconText}
                      </span>
                    )}
                    <span className={styles.skillLabel}>{skill.label}</span>
                  </BackgroundCard>
                ))}

                <Link
                  to={MORE_SKILLS_LINK}
                  className={styles.moreSkillsBubble}
                  aria-label={
                    extraSkills > 0
                      ? `${extraSkills} more skills available`
                      : 'See more skills and resources'
                  }
                >
                  <span>+</span>
                  <small>{extraSkills > 0 ? `${extraSkills} more` : 'more skills'}</small>
                </Link>
              </section>
            </BackgroundCard>
          )}

          {/* Testimonials Section: Only render if there are active testimonials */}
          {testimonials.length > 0 && (
            <BackgroundCard className={styles.testimonialsHeadingCard}>
              <h2>MY TESTIMONIALS</h2>
            </BackgroundCard>
          )}

          {testimonials.length > 0 && (
            <BackgroundCard className={styles.testimonialsContainer} size="lg">
              <section className={styles.testimonialsGrid} aria-label="Testimonials">
                {testimonials.map((testimonial, index) => (
                  <BackgroundCard
                    key={testimonial.id}
                    as="article"
                    size="md"
                    className={`${styles.testimonialCard} ${index % 3 === 0 ? styles.testimonialCardWide : ''}`.trim()}
                  >
                    <div className={styles.testimonialHead}>
                      <span className={styles.quoteMark} aria-hidden="true">
                        {'\u275D'}
                      </span>
                      <div className={styles.testimonialIdentity}>
                        <h3>
                          {testimonial.link ? (
                            <a href={testimonial.link} target="_blank" rel="noopener noreferrer">
                              {testimonial.name}
                            </a>
                          ) : (
                            testimonial.name
                          )}
                        </h3>
                        <p>{testimonial.role}</p>
                      </div>
                    </div>
                    <p className={styles.testimonialText}>{testimonial.text}</p>
                  </BackgroundCard>
                ))}
              </section>
            </BackgroundCard>
          )}

          {/* Timeline Section: Only render if there are active work history items */}
          {workHistory.length > 0 && (
            <BackgroundCard className={styles.timelineHeadingCard}>
              <h2>MY WORK HISTORY</h2>
            </BackgroundCard>
          )}

          {workHistory.length > 0 && (
            <section ref={timelineRef} className={styles.timelineSection} aria-label="Work history timeline">
              <div className={styles.timelineLineBase} aria-hidden="true" />
              <div
                className={styles.timelineLineFill}
                aria-hidden="true"
                style={{ height: `${timelineProgress * 100}%` }}
              />

              <div className={styles.timelineRows}>
                {workHistory.map((item, index) => {
                  const isLeft = index % 2 === 0
                  const markerProgress = getMarkerProgress(index)
                  const isRevealed = timelineProgress >= markerProgress

                  return (
                    <article key={item.id} className={styles.timelineRow}>
                      <motion.div
                        className={`${styles.timelineCardWrap} ${isLeft ? styles.timelineCardLeft : styles.timelineCardRight}`}
                        initial={false}
                        animate={{
                          opacity: isRevealed ? 1 : 0,
                          x: isRevealed ? 0 : isLeft ? -72 : 72,
                          y: isRevealed ? 0 : 16,
                        }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <BackgroundCard as="div" size="md" className={styles.timelineCard}>
                          <div
                            className={styles.timelineCardTop}
                            style={{ background: item.accentColor }}
                            aria-hidden="true"
                          >
                            <span>{item.emoji}</span>
                          </div>
                          <p className={styles.timelineCardText}>{item.text}</p>
                        </BackgroundCard>
                      </motion.div>

                      <div className={styles.timelineMarkerColumn}>
                        <div
                          ref={(element) => {
                            markerRefs.current[index] = element
                          }}
                          className={`${styles.timelineYearDot} ${isRevealed ? styles.timelineYearDotActive : ''}`}
                        >
                          {item.year}
                        </div>
                      </div>

                      <div className={`${styles.timelineRoleLabel} ${isLeft ? styles.timelineRoleLabelRight : styles.timelineRoleLabelLeft}`}>
                        {item.title}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}
        </motion.div>
      </PageSectionLayout>
    </main>
  )
}
