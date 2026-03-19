import { useState, useEffect } from 'react'
import { BackgroundCard } from '../components/BackgroundCard'
import styles from './SkillsGallery.module.css'
import aboutStyles from '../pages/AboutPage.module.css'
import { APP_LINKS } from '../config/links'

interface Skill {
  id: string | number
  name: string
  icon_path?: string
  iconUrl?: string
  icon?: string
  emoji?: string
  iconText?: string
  link?: string
  active?: boolean
  order?: number
  label?: string
}

export function SkillsGallery() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await fetch('/api/skills-public')
        if (!response.ok) throw new Error('Failed to load skills')
        const data = await response.json()
        // Normalize to match AboutPage tile structure
        const list = Array.isArray(data) ? data : data.skills
        const sorted = Array.isArray(list) ? [...list].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)) : []
        setSkills(sorted.map((skill: any, idx: number) => {
          const label = skill.name?.trim() || skill.title?.trim() || `Skill ${idx + 1}`
          const iconUrl = skill.iconUrl?.trim() || skill.icon_path?.trim() || skill.icon?.trim() || skill.emoji?.trim()
          const iconText = skill.icon?.trim() || skill.emoji?.trim() || label.slice(0, 2).toUpperCase()
          const link = skill.link?.trim() || skill.url?.trim() || skill.href?.trim() || skill.website?.trim()
          return {
            id: String(skill.id ?? `skill-${idx}`),
            label,
            iconUrl: iconUrl || undefined,
            iconText,
            link,
          }
        }))
      } catch (error) {
        console.error('Failed to load skills:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSkills()
  }, [])

  if (isLoading) {
    return (
      <section className={aboutStyles.skillsRow}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Loading skills...
        </div>
      </section>
    )
  }

  if (skills.length === 0) {
    return (
      <section className={aboutStyles.skillsRow}>
        <div className={styles.emptySection}>
          <h3>Skills Coming Soon</h3>
          <p>I'm currently updating my skills section. Check back soon!</p>
        </div>
      </section>
    )
  }

  // Show only first 10 skills, rest as LinkedIn bubble
  const visibleSkills = skills.slice(0, 10)
  const extraSkills = Math.max(0, skills.length - visibleSkills.length)
  const MORE_SKILLS_LINK = APP_LINKS.linkedinSkills

  return (
    <section className={aboutStyles.skillsRow} aria-label="Current skills">
      {visibleSkills.map((skill) => {
        const skillContent = (
          <>
            {skill.iconUrl ? (
              <img className={aboutStyles.skillIconImage} src={skill.iconUrl} alt={skill.label} />
            ) : (
              <span className={aboutStyles.skillFallbackIcon} aria-hidden="true">
                {skill.iconText}
              </span>
            )}
            <span className={aboutStyles.skillLabel}>{skill.label}</span>
          </>
        )
        return (
          <div key={skill.id}>
            {skill.link ? (
              <a
                href={skill.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`${aboutStyles.skillTile} ${aboutStyles.skillTileClickable}`}
                title={`Learn more about ${skill.label}`}
                onClick={(event) => {
                  event.preventDefault()
                  window.open(skill.link, '_blank', 'noopener,noreferrer')
                }}
              >
                {skillContent}
              </a>
            ) : (
              <BackgroundCard
                as="article"
                size="sm"
                className={aboutStyles.skillTile}
              >
                {skillContent}
              </BackgroundCard>
            )}
          </div>
        )
      })}
      <a
        href={MORE_SKILLS_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className={aboutStyles.moreSkillsBubble}
        aria-label={
          extraSkills > 0
            ? `${extraSkills} more skills available on LinkedIn`
            : 'See more skills on LinkedIn'
        }
      >
        <span>+</span>
        <small>{extraSkills > 0 ? `${extraSkills} more` : 'more skills'}</small>
      </a>
    </section>
  )
}