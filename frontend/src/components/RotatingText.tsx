import { useEffect, useRef } from 'react'
import styles from './RotatingText.module.css'

const TEXTS = [
  "Hey 👋",
  "I'm Bene 😄",
  "A passionate software engineer 💻",
  "Feel free to explore 🗺️",
]

const DELAY_MS = 2500
const CHARS = '!<>-_\\/[]{}—=+*^?#________'

let animationDone = false

type QueueItem = { from: string; to: string; start: number; end: number; char?: string }

class TextScramble {
  private el: HTMLElement
  private queue: QueueItem[] = []
  private frame = 0
  private frameRequest = 0
  private resolve!: () => void

  constructor(el: HTMLElement) {
    this.el = el
    this.update = this.update.bind(this)
  }

  setText(newText: string): Promise<void> {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise<void>(resolve => (this.resolve = resolve))
    this.queue = []
    for (let i = 0; i < length; i++) {
      const from = oldText[i] ?? ''
      const to = newText[i] ?? ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }
    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()
    return promise
  }

  private update() {
    let output = ''
    let complete = 0
    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar()
          this.queue[i].char = char
        }
        output += `<span class="${styles.dud}">${char}</span>`
      } else {
        output += from
      }
    }
    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }

  private randomChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)]
  }

  destroy() {
    cancelAnimationFrame(this.frameRequest)
  }
}

export function RotatingText() {
  const elRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    if (animationDone) {
      el.innerText = TEXTS[TEXTS.length - 1]
      return
    }

    const fx = new TextScramble(el)
    let index = 0
    let cancelled = false

    const next = () => {
      if (cancelled) return
      fx.setText(TEXTS[index]).then(() => {
        if (cancelled) return
        index++
        if (index < TEXTS.length) {
          setTimeout(next, DELAY_MS)
        } else {
          animationDone = true
        }
      })
    }

    next()

    return () => {
      cancelled = true
      fx.destroy()
    }
  }, [])

  return <span ref={elRef} className={styles.rotatingText} aria-live="polite" />
}
