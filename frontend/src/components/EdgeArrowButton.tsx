import { Link } from 'react-router-dom'
import { Direction } from '../types'
import styles from './EdgeArrowButton.module.css'

type EdgeArrowButtonProps = {
  to: string
  ariaLabel: string
  label: string
  arrow: React.ReactNode
  icon: React.ReactNode
  direction: Direction
  className?: string
  asReturnButton?: boolean
}

const DIRECTION_CLASS: Record<Direction, string> = {
  [Direction.Top]: styles.edgeArrowTop,
  [Direction.Right]: styles.edgeArrowRight,
  [Direction.Bottom]: styles.edgeArrowBottom,
  [Direction.Left]: styles.edgeArrowLeft,
}

const DIRECTION_LABEL_CLASS: Record<Direction, string> = {
  [Direction.Top]: styles.edgeArrowLabelTop,
  [Direction.Right]: styles.edgeArrowLabelRight,
  [Direction.Bottom]: styles.edgeArrowLabelBottom,
  [Direction.Left]: styles.edgeArrowLabelLeft,
}

export function EdgeArrowButton({
  to,
  ariaLabel,
  label,
  arrow,
  icon,
  direction,
  className,
  asReturnButton,
}: EdgeArrowButtonProps) {
  const composedClassName = [
    styles.edgeArrow,
    DIRECTION_CLASS[direction],
    asReturnButton && styles.returnBtn,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link
      to={to}
      className={composedClassName}
      aria-label={ariaLabel}
    >
      <span className={styles.edgeArrowContent} aria-hidden="true" data-edge-content>
        <span className={styles.edgeArrowArrow} data-edge-arrow>{arrow}</span>
        <span className={styles.edgeArrowIcon} data-edge-icon>{icon}</span>
      </span>
      <span 
        className={`${styles.edgeArrowLabel} ${DIRECTION_LABEL_CLASS[direction]}`}
        aria-hidden="true"
        data-edge-label
      >
        {label}
      </span>
    </Link>
  )
}
