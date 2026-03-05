import { EdgeArrowButton } from './EdgeArrowButton'
import { Direction } from '../types'
import styles from './EdgeArrowNav.module.css'

type EdgeArrowConfig = {
  direction: Direction
  to: string
  ariaLabel: string
  label: string
  arrow: React.ReactNode
  icon: React.ReactNode
}

const DIRECTION_ARROWS: Record<Direction, React.ReactNode> = {
  [Direction.Top]: (
    <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  [Direction.Right]: (
    <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  [Direction.Bottom]: (
    <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  [Direction.Left]: (
    <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
}

const EDGE_ARROWS: EdgeArrowConfig[] = [
  { 
    direction: Direction.Top, 
    to: '/resources', 
    ariaLabel: 'Go to resources page', 
    label: 'Resources',
    arrow: DIRECTION_ARROWS[Direction.Top],
    icon: (
      <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    )
  },
  { 
    direction: Direction.Right, 
    to: '/projects', 
    ariaLabel: 'Go to projects page', 
    label: 'Projects',
    arrow: DIRECTION_ARROWS[Direction.Right],
    icon: (
      <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="7" height="7" />
        <rect x="13" y="4" width="7" height="7" />
        <rect x="4" y="13" width="7" height="7" />
        <rect x="13" y="13" width="7" height="7" />
      </svg>
    )
  },
  { 
    direction: Direction.Bottom, 
    to: '/contact', 
    ariaLabel: 'Go to contact page', 
    label: 'Contact',
    arrow: DIRECTION_ARROWS[Direction.Bottom],
    icon: (
      <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 6l10 7 10-7" />
      </svg>
    )
  },
  { 
    direction: Direction.Left, 
    to: '/about', 
    ariaLabel: 'Go to about page', 
    label: 'About',
    arrow: DIRECTION_ARROWS[Direction.Left],
    icon: (
      <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="3" />
        <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
      </svg>
    )
  },
]

export const HOME_ICON = (
  <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2z" />
  </svg>
)

export function EdgeArrowNav() {
  return (
    <nav className={styles.edgeNav} aria-label="Main page edge navigation">
      {EDGE_ARROWS.map((arrow) => (
        <EdgeArrowButton
          key={arrow.direction}
          to={arrow.to}
          ariaLabel={arrow.ariaLabel}
          label={arrow.label}
          arrow={arrow.arrow}
          icon={arrow.icon}
          direction={arrow.direction}
        />
      ))}
    </nav>
  )
}
