import { Link } from 'react-router-dom'

type Direction = 'top' | 'right' | 'bottom' | 'left'

type RoutePlaceholderPageProps = {
  title: string
  returnDirection: Direction
}

const DIRECTION_SYMBOL: Record<Direction, string> = {
  top: '^',
  right: '>',
  bottom: 'v',
  left: '<',
}

export function RoutePlaceholderPage({
  title,
  returnDirection,
}: RoutePlaceholderPageProps) {
  return (
    <main className="route-page">
      <Link
        className={`route-page__return edge-arrow edge-arrow--${returnDirection}`}
        to="/"
        aria-label="Return to homepage"
      >
        <span className="edge-arrow__symbol" aria-hidden="true">
          {DIRECTION_SYMBOL[returnDirection]}
        </span>
      </Link>
      <h1>{title}</h1>
      <p>This page is a placeholder for now.</p>
    </main>
  )
}
