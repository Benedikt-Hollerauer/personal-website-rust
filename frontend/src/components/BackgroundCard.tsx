import type { ElementType, ReactNode } from 'react'
import styles from './BackgroundCard.module.css'

type BackgroundCardSize = 'sm' | 'md' | 'lg'

type BackgroundCardProps = {
  children: ReactNode
  className?: string
  size?: BackgroundCardSize
  as?: ElementType
}

const SIZE_CLASS: Record<BackgroundCardSize, string> = {
  sm: styles.cardSm,
  md: styles.cardMd,
  lg: styles.cardLg,
}

export function BackgroundCard({
  children,
  className,
  size = 'md',
  as: Component = 'section',
}: BackgroundCardProps) {
  const composedClassName = [styles.card, SIZE_CLASS[size], className].filter(Boolean).join(' ')

  return <Component className={composedClassName}>{children}</Component>
}
