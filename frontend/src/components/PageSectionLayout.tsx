import type { ReactNode } from 'react'
import styles from './PageSectionLayout.module.css'

type TitlePosition = 'top' | 'left' | 'right'
type NavRailPosition = 'none' | 'top' | 'right' | 'bottom' | 'left'

type PageSectionLayoutProps = {
  title: string
  titlePosition: TitlePosition
  children: ReactNode
  className?: string
  navRail?: NavRailPosition
}

const POSITION_CLASS: Record<TitlePosition, string> = {
  top: styles.layoutTop,
  left: styles.layoutLeft,
  right: styles.layoutRight,
}

const RAIL_CLASS: Record<NavRailPosition, string> = {
  none: '',
  top: styles.railTop,
  right: styles.railRight,
  bottom: styles.railBottom,
  left: styles.railLeft,
}

export function PageSectionLayout({
  title,
  titlePosition,
  children,
  className,
  navRail = 'none',
}: PageSectionLayoutProps) {
  const composedClassName = [
    styles.layout,
    POSITION_CLASS[titlePosition],
    RAIL_CLASS[navRail],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={composedClassName} aria-label={`${title} section`}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.content} data-page-content-scroll="true">
        {children}
      </div>
    </section>
  )
}
