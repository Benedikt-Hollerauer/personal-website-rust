export const Direction = {
  Top: 'top',
  Right: 'right',
  Bottom: 'bottom',
  Left: 'left',
} as const

export type Direction = (typeof Direction)[keyof typeof Direction]
