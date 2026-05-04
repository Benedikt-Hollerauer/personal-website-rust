import { useEffect, useRef } from 'react'
import styles from './ParticleBackground.module.css'

const MAX_DIST = 150
const SPEED = 0.4

function getCount() {
  const w = window.innerWidth
  if (w < 640) return 25
  if (w < 1024) return 65
  return 120
}

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

function isDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let dots: Dot[] = []
    let W = 0
    let H = 0

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    const spawn = () => {
      dots = Array.from({ length: getCount() }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 1.5 + 0.6,
      }))
    }

    const frame = () => {
      ctx.clearRect(0, 0, W, H)

      const dark = isDark()
      const rgb = dark ? '139,92,246' : '124,58,237'
      const dotAlpha = dark ? 0.43 : 0.33
      const lineMaxAlpha = dark ? 0.30 : 0.23

      for (const d of dots) {
        d.x = (d.x + d.vx + W) % W
        d.y = (d.y + d.vy + H) % H

        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb},${dotAlpha})`
        ctx.fill()
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x
          const dy = dots[i].y - dots[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const a = lineMaxAlpha * (1 - dist / MAX_DIST)
            ctx.beginPath()
            ctx.moveTo(dots[i].x, dots[i].y)
            ctx.lineTo(dots[j].x, dots[j].y)
            ctx.strokeStyle = `rgba(${rgb},${a})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(frame)
    }

    const onResize = () => {
      resize()
      spawn()
    }

    resize()
    spawn()
    frame()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
