import { Link } from 'react-router-dom'

type Direction = 'top' | 'right' | 'bottom' | 'left'

type EdgeArrowConfig = {
  direction: Direction
  to: string
  ariaLabel: string
  symbol: string
}

const EDGE_ARROWS: EdgeArrowConfig[] = [
  { direction: 'top', to: '/resources', ariaLabel: 'Go to resources page', symbol: '^' },
  { direction: 'right', to: '/projects', ariaLabel: 'Go to projects page', symbol: '>' },
  { direction: 'bottom', to: '/contact', ariaLabel: 'Go to contact page', symbol: 'v' },
  { direction: 'left', to: '/about', ariaLabel: 'Go to about page', symbol: '<' },
]

export function EdgeArrowNav() {
  return (
    <nav className="edge-nav" aria-label="Main page edge navigation">
      {EDGE_ARROWS.map((arrow) => (
        <Link
          key={arrow.direction}
          to={arrow.to}
          className={`edge-arrow edge-arrow--${arrow.direction}`}
          aria-label={arrow.ariaLabel}
        >
          <span className="edge-arrow__symbol" aria-hidden="true">
            {arrow.symbol}
          </span>
        </Link>
      ))}
    </nav>
  )
}
