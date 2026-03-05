import { EdgeArrowButton } from '../components/EdgeArrowButton'
import { HOME_ICON } from '../components/EdgeArrowNav'
import { Direction } from '../types'
import styles from './RoutePlaceholderPage.module.css'

type RoutePlaceholderPageProps = {
  title: string
  returnDirection: Direction
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

export function RoutePlaceholderPage({
  title,
  returnDirection,
}: RoutePlaceholderPageProps) {
  const homeArrow = DIRECTION_ARROWS[returnDirection]

  return (
    <main className={styles.routePage}>
      <EdgeArrowButton
        to="/"
        ariaLabel="Return to homepage"
        label="Home"
        arrow={homeArrow}
        icon={HOME_ICON}
        direction={returnDirection}
        className={styles.routePageReturn}
      />
      <h1>{title}</h1>
      <p>This page is a placeholder for now.</p>
    </main>
  )
}
