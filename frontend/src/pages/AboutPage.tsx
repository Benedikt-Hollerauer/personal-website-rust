import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BackgroundCard } from '../components/BackgroundCard'
import { SkillsGallery } from '../components/SkillsGallery'
import { EdgeArrowButton } from '../components/EdgeArrowButton'
import { HOME_ICON } from '../components/EdgeArrowNav'
import { PageSectionLayout } from '../components/PageSectionLayout'
import { APP_LINKS } from '../config/links'
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
  link?: string
  url?: string
  // backend stores path in snake_case
  icon_path?: string
}

type SkillItem = {
  id: string
  label: string
  iconText?: string
  iconUrl?: string
  link?: string
}

type ApiTestimonial = {
  id?: string | number
  name?: string
  author?: string
  order?: number
  role?: string
  link?: string
  url?: string
  href?: string
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

const MORE_SKILLS_LINK = APP_LINKS.linkedinSkills

function normalizeExternalLink(value?: string): string | undefined {
  const raw = value?.trim()
  if (!raw) {
    return undefined
  }

  if (/^https?:\/\//i.test(raw) || /^mailto:/i.test(raw)) {
    return raw
  }

  // Accept plain domains from the API and make them valid absolute links.
  return `https://${raw.replace(/^\/+/, '')}`
}

function normalizeSkill(skill: ApiSkill, index: number): SkillItem {
  const label = skill.name?.trim() || skill.title?.trim() || `Skill ${index + 1}`
  // backend may return icon_path or iconUrl or other fields depending on API
  const iconUrl =
    skill.iconUrl?.trim() ||
    (skill as any).icon_path?.trim() ||
    skill.icon?.trim() ||
    skill.emoji?.trim()
  const iconText = skill.icon?.trim() || skill.emoji?.trim() || label.slice(0, 2).toUpperCase()
  const link =
    normalizeExternalLink(skill.link) ||
    normalizeExternalLink((skill as any).url) ||
    normalizeExternalLink((skill as any).href) ||
    normalizeExternalLink((skill as any).website)

  return {
    id: String(skill.id ?? `skill-${index}`),
    label,
    iconUrl: iconUrl || undefined,
    iconText,
    link,
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
  const link = normalizeExternalLink(item.link) || normalizeExternalLink(item.url) || normalizeExternalLink(item.href)
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

// Helper to get and merge localStorage overrides for work history
function getWorkHistoryOverrides(): Record<string, { emoji?: string; accentColor?: string }> {
  try {
    return JSON.parse(localStorage.getItem('workHistoryOverrides') || '{}');
  } catch {
    return {};
  }
}

export function AboutPage() {
  const [aboutParagraphs, setAboutParagraphs] = useState<string[]>(FALLBACK_ABOUT_PARAGRAPHS)
  // Remove AboutPage's own skills state, SkillsGallery will handle skills
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(FALLBACK_TESTIMONIALS)
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>(FALLBACK_WORK_HISTORY)
  const [timelineTrackTop, setTimelineTrackTop] = useState(0)
  const [timelineTrackHeight, setTimelineTrackHeight] = useState(0)
  const [activeTimelineIndices, setActiveTimelineIndices] = useState<Set<number>>(new Set())
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const fillRef = useRef<HTMLDivElement | null>(null)
  const markerRefs = useRef<Array<HTMLDivElement | null>>([])

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
        // Merge localStorage overrides
        const overrides = getWorkHistoryOverrides();
        setWorkHistory(sorted.map((item, idx) => {
          const normalized = normalizeWorkHistory(item, idx);
          const override = overrides[normalized.id] || {};
          return {
            ...normalized,
            ...override,
            emoji: override.emoji || normalized.emoji,
            accentColor: override.accentColor || normalized.accentColor,
          };
        }));
      })
      .catch(() => {
        // If API fails, use fallback and merge overrides
        const overrides = getWorkHistoryOverrides();
        setWorkHistory(FALLBACK_WORK_HISTORY.map((item) => {
          const override = overrides[item.id] || {};
          return {
            ...item,
            ...override,
            emoji: override.emoji || item.emoji,
            accentColor: override.accentColor || item.accentColor,
          };
        }));
      })

    return () => {
      abortController.abort()
    }
  }, [])

  // Timeline scroll-fill effect
  useEffect(() => {
    const timeline = timelineRef.current
    if (!timeline || workHistory.length === 0) return

    // Dynamically set bottom padding so last item can reach trigger point (mobile)
    const scrollContainer = timeline.closest<HTMLElement>('[data-page-content-scroll="true"]')
    const containerHeight = scrollContainer ? scrollContainer.clientHeight : window.innerHeight
    const minPadding = Math.max(0, containerHeight * (window.innerWidth <= 1100 ? 0.6 : 0.4))
    timeline.style.paddingBottom = `${minPadding}px`

    let rafId = 0

    const update = () => {
      rafId = 0
      const markers = markerRefs.current
      if (markers.length === 0) return

      const timelineRect = timeline.getBoundingClientRect()

      // Marker center positions relative to the timeline section top
      const centers: number[] = []
      for (const m of markers) {
        if (!m) continue
        const r = m.getBoundingClientRect()
        centers.push(r.top + r.height / 2 - timelineRect.top)
      }
      if (centers.length === 0) return

      const firstCenter = centers[0]
      const lastCenter = centers[centers.length - 1]

      // Position the track line from first marker to last marker
      setTimelineTrackTop(firstCenter)
      setTimelineTrackHeight(Math.max(0, lastCenter - firstCenter))

      // Trigger point: 60% down the visible area (slightly below center)
      let triggerY: number
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect()
        triggerY = containerRect.top + containerRect.height * 0.6 - timelineRect.top
      } else {
        triggerY = window.innerHeight * 0.6 - timelineRect.top
      }

      // Fill from first marker downward, clamped to track length
      const fillHeight = Math.max(0, Math.min(lastCenter - firstCenter, triggerY - firstCenter))
      if (fillRef.current) {
        fillRef.current.style.height = `${fillHeight}px`
      }

      // Activate items whose marker center is at or above the fill point
      const nextActive = new Set<number>()
      for (let i = 0; i < centers.length; i++) {
        if (triggerY >= centers[i]) {
          nextActive.add(i)
        }
      }

      setActiveTimelineIndices((prev) => {
        if (prev.size === nextActive.size) {
          let same = true
          for (const idx of nextActive) {
            if (!prev.has(idx)) { same = false; break }
          }
          if (same) return prev
        }
        return nextActive
      })
    }

    const schedule = () => {
      if (rafId === 0) {
        rafId = requestAnimationFrame(update)
      }
    }

    // Initial calculation
    schedule()

    const target = scrollContainer ?? window
    target.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      target.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (rafId !== 0) cancelAnimationFrame(rafId)
    }
  }, [workHistory])

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
          // setSkills removed, SkillsGallery manages skills
          return
        }

        const sorted = [...list].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
        // setSkills removed, SkillsGallery manages skills
      })
      .catch(() => {
        setSkills([])
      })

    return () => {
      abortController.abort()
    }
  }, [])

  // Remove AboutPage's own skills calculations

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

          {/* Skills Section: Use SkillsGallery component */}
          <h2 className={styles.sectionHeading}>THESE ARE MY CURRENT SKILLS</h2>
          <SkillsGallery />

          {/* Testimonials Section: Only render if there are active testimonials */}
          {testimonials.length > 0 && (
            <h2 className={styles.sectionHeading}>MY TESTIMONIALS</h2>
          )}

          {testimonials.length > 0 && (
            <section className={styles.testimonialsContainer} aria-label="Testimonials section">
              <div className={styles.testimonialsGrid} aria-label="Testimonials">
                {testimonials.map((testimonial) => (
                  <BackgroundCard
                    key={testimonial.id}
                    as="article"
                    size="md"
                    className={styles.testimonialCard}
                  >
                    <div className={styles.testimonialHead}>
                      <span className={styles.quoteMark} aria-hidden="true">
                        {'\u275D'}
                      </span>
                      <div className={styles.testimonialIdentity}>
                        <h3>
                          {testimonial.link ? (
                            <a
                              href={testimonial.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.testimonialLink}
                              onClick={(event) => {
                                event.preventDefault()
                                window.open(testimonial.link, '_blank', 'noopener,noreferrer')
                              }}
                            >
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
              </div>
            </section>
          )}

          {/* Timeline Section: Only render if there are active work history items */}
          {workHistory.length > 0 && (
            <h2 className={styles.sectionHeading}>MY WORK HISTORY</h2>
          )}

          {workHistory.length > 0 && (
            <section
              ref={timelineRef}
              className={styles.timelineSection}
              aria-label="Work history timeline"
            >
              {/* Vertical line track & fill */}
              <div
                className={styles.timelineTrack}
                aria-hidden="true"
                style={{ top: `${timelineTrackTop}px`, height: `${timelineTrackHeight}px` }}
              >
                <div className={styles.timelineTrackBase} />
                <div
                  ref={fillRef}
                  className={styles.timelineTrackFill}
                />
              </div>

              {/* Timeline items */}
              {workHistory.map((item, index) => {
                const isLeft = index % 2 === 0
                const isRevealed = activeTimelineIndices.has(index)

                return (
                  <div key={item.id} className={styles.timelineItem}>
                    {/* Marker (year dot) */}
                    <div className={styles.timelineMarker}>
                      <div
                        ref={(el) => { markerRefs.current[index] = el }}
                        className={`${styles.timelineYearDot} ${isRevealed ? styles.timelineYearDotActive : ''}`}
                      >
                        {item.year}
                      </div>
                    </div>

                    {/* Card */}
                    <motion.div
                      className={`${styles.timelineCardWrap} ${isLeft ? styles.timelineCardLeft : styles.timelineCardRight}`}
                      initial={false}
                      animate={{
                        opacity: isRevealed ? 1 : 0,
                        x: isRevealed ? 0 : isLeft ? -44 : 44,
                        y: isRevealed ? 0 : 14,
                        scale: isRevealed ? 1 : 0.96,
                      }}
                      transition={{ type: 'spring', stiffness: 190, damping: 22, mass: 0.8 }}
                    >
                      <BackgroundCard as="div" size="md" className={styles.timelineCard}>
                        <div
                          className={styles.timelineCardTop}
                          style={{ background: item.accentColor }}
                          aria-hidden="true"
                        >
                          <span>{item.emoji}</span>
                        </div>
                        <div className={styles.timelineCardTitle}>{item.title}</div>
                        <p className={styles.timelineCardText}>{item.text}</p>
                      </BackgroundCard>
                    </motion.div>

                    {/* Role label (animated) */}
                    <motion.div
                      className={`${styles.timelineRoleLabel} ${isLeft ? styles.timelineRoleLabelRight : styles.timelineRoleLabelLeft}`}
                      initial={false}
                      animate={{
                        opacity: isRevealed ? 1 : 0,
                        y: isRevealed ? 0 : 24,
                      }}
                      transition={{ type: 'spring', stiffness: 180, damping: 20, mass: 0.7 }}
                    >
                      {item.title}
                    </motion.div>
                  </div>
                )
              })}
            </section>
          )}
        </motion.div>
      </PageSectionLayout>
    </main>
  )
}
