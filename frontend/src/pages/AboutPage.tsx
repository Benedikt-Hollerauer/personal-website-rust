import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
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
  icon?: string
  emoji?: string
  iconUrl?: string
}

type SkillItem = {
  id: string
  label: string
  iconText?: string
  iconUrl?: string
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

const MORE_SKILLS_LINK = '/resources'

function normalizeSkill(skill: ApiSkill, index: number): SkillItem {
  const label = skill.name?.trim() || skill.title?.trim() || `Skill ${index + 1}`
  const iconUrl = skill.iconUrl?.trim() || undefined
  const iconText = skill.icon?.trim() || skill.emoji?.trim() || label.slice(0, 2).toUpperCase()

  return {
    id: String(skill.id ?? `skill-${index}`),
    label,
    iconUrl,
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

export function AboutPage() {
  const [aboutParagraphs, setAboutParagraphs] = useState<string[]>(FALLBACK_ABOUT_PARAGRAPHS)
  const [skills, setSkills] = useState<SkillItem[]>(FALLBACK_SKILLS)

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
        }
      })
      .catch(() => {
        // Keep fallback about text when backend is unavailable.
      })

    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    fetch('/api/skills', { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load skills')
        }

        return response.json() as Promise<ApiSkill[] | { skills?: ApiSkill[] }>
      })
      .then((payload) => {
        const list = Array.isArray(payload) ? payload : payload.skills
        if (!Array.isArray(list) || list.length === 0) {
          return
        }

        setSkills(list.map(normalizeSkill))
      })
      .catch(() => {
        // Keep fallback skills when backend is unavailable.
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
        className={styles.aboutPageReturn}
      />

      <PageSectionLayout title="About" titlePosition="top" className={styles.aboutLayout}>
        <motion.div
          className={styles.aboutStack}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <BackgroundCard className={styles.aboutCard} size="lg">
            <div className={styles.aboutTextBlock}>
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </BackgroundCard>

          <BackgroundCard className={styles.skillsHeadingCard}>
            <h2>THESE ARE MY CURRENT SKILLS</h2>
          </BackgroundCard>

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
        </motion.div>
      </PageSectionLayout>
    </main>
  )
}
