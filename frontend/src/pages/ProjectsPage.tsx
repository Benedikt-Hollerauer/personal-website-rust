import { useEffect, useState } from 'react'
import { EdgeArrowButton } from '../components/EdgeArrowButton'
import { HOME_ICON } from '../components/EdgeArrowNav'
import { PageSectionLayout } from '../components/PageSectionLayout'
import { ProjectCardSlider, type ProjectCard } from '../components/ProjectCardSlider'
import { Direction } from '../types'
import styles from './ProjectsPage.module.css'

type ApiProject = {
  id?: string | number
  title?: string
  name?: string
  summary?: string
  description?: string
  tags?: string[]
  year?: string | number
  key_points?: Record<string, unknown>
  location?: string
  link?: string
  start_date?: string
  end_date?: string
  active?: boolean
}

const HOME_ARROW = (
  <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

function normalizeProject(project: ApiProject, index: number): ProjectCard {
  const title = project.title ?? project.name ?? `Project ${index + 1}`
  const summary =
    project.summary ??
    project.description ??
    'A project card loaded from the backend API.'

  // Convert key_points object to array of strings
  let keyPoints: string[] = []
  if (project.key_points && typeof project.key_points === 'object') {
    keyPoints = Object.values(project.key_points).map((v) => String(v))
  }

  // Extract year from start_date if available
  let year = project.year ? String(project.year) : undefined
  if (!year && project.start_date) {
    try {
      year = new Date(project.start_date).getFullYear().toString()
    } catch {
      // Ignore date parsing errors
    }
  }

  return {
    id: String(project.id ?? `project-${index}`),
    title,
    summary,
    tags: Array.isArray(project.tags) && project.tags.length > 0 ? project.tags : [],
    year,
    keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
    location: project.location,
    link: project.link,
    startDate: project.start_date,
    endDate: project.end_date,
    active: project.active !== false, // default to true if not specified
  }
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCard[]>([])

  useEffect(() => {
    const abortController = new AbortController()

    fetch('/api/projects-public', { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load projects')
        }

        return response.json() as Promise<ApiProject[] | { projects?: ApiProject[] }>
      })
      .then((payload) => {
        const list = Array.isArray(payload) ? payload : payload.projects
        if (!Array.isArray(list)) {
          setProjects([])
          return
        }

        // Filter only active projects and normalize them
        const activeProjects = list
          .filter((p) => p.active !== false)
          .map(normalizeProject)
        
        setProjects(activeProjects)
      })
      .catch(() => {
        // Empty array when backend is not ready (shows only GitHub card)
        setProjects([])
      })

    return () => {
      abortController.abort()
    }
  }, [])

  return (
    <main className={styles.projectsPage}>
      <EdgeArrowButton
        to="/"
        ariaLabel="Return to homepage"
        label="Home"
        arrow={HOME_ARROW}
        icon={HOME_ICON}
        direction={Direction.Left}
        asReturnButton
        className={styles.projectsPageReturn}
      />

      <PageSectionLayout title="Projects" titlePosition="top" navRail="left" className={styles.projectsLayout}>
        <section className={styles.projectsContent} aria-label="Projects content">
          <ProjectCardSlider projects={projects} />
        </section>
      </PageSectionLayout>
    </main>
  )
}
