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
}

const HOME_ARROW = (
  <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const FALLBACK_PROJECTS: ProjectCard[] = [
  {
    id: 'portfolio-redesign',
    title: 'Portfolio Redesign',
    summary: 'A fast, scroll-first portfolio focused on clear routes, expressive motion, and low visual noise.',
    tags: ['react', 'typescript', 'motion'],
    year: '2026',
  },
  {
    id: 'resource-lab',
    title: 'Resource Lab',
    summary: 'A curated resource hub with topic maps and directional navigation patterns for quick discovery.',
    tags: ['ux', 'content', 'navigation'],
    year: '2025',
  },
  {
    id: 'project-atlas',
    title: 'Project Atlas',
    summary: 'A compact project tracker with clean card interactions and keyboard-friendly browsing patterns.',
    tags: ['frontend', 'architecture', 'api-ready'],
    year: '2024',
  },
]

function normalizeProject(project: ApiProject, index: number): ProjectCard {
  const title = project.title ?? project.name ?? `Project ${index + 1}`
  const summary =
    project.summary ??
    project.description ??
    'A project card loaded from the backend API.'

  return {
    id: String(project.id ?? `project-${index}`),
    title,
    summary,
    tags: Array.isArray(project.tags) ? project.tags : ['project'],
    year: project.year ? String(project.year) : undefined,
  }
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCard[]>(FALLBACK_PROJECTS)

  useEffect(() => {
    const abortController = new AbortController()

    fetch('/api/projects', { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load projects')
        }

        return response.json() as Promise<ApiProject[] | { projects?: ApiProject[] }>
      })
      .then((payload) => {
        const list = Array.isArray(payload) ? payload : payload.projects
        if (!Array.isArray(list) || list.length === 0) {
          return
        }

        setProjects(list.map(normalizeProject))
      })
      .catch(() => {
        // Keep fallback projects when the backend is not ready yet.
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
        className={styles.projectsPageReturn}
      />

      <PageSectionLayout title="Projects" titlePosition="top" className={styles.projectsLayout}>
        <section className={styles.projectsContent} aria-label="Projects content">
          <p>
            {projects.length} projects loaded. Use your mouse wheel to cycle through them. The slider loops
            infinitely.
          </p>
          <ProjectCardSlider projects={projects} />
        </section>
      </PageSectionLayout>
    </main>
  )
}
