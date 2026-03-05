import { Link } from 'react-router-dom'
import { useState } from 'react'
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
}: EdgeArrowButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const composedClassName = [styles.edgeArrow, DIRECTION_CLASS[direction], className]
    .filter(Boolean)
    .join(' ')

  return (
    <Link
      to={to}
      className={composedClassName}
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={styles.edgeArrowContent} aria-hidden="true">
        {isHovered ? (
          <span className={styles.edgeArrowIcon}>{icon}</span>
        ) : (
          <span className={styles.edgeArrowArrow}>{arrow}</span>
        )}
      </span>
      <span 
        className={`${styles.edgeArrowLabel} ${DIRECTION_LABEL_CLASS[direction]}`}
        aria-hidden="true"
      >
        {label}
      </span>
    </Link>
  )
}
