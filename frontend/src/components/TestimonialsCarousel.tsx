import { useState, useEffect } from 'react'
import styles from './TestimonialsCarousel.module.css'

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  active: boolean
  order: number
}

export function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials?active=true')
        if (!response.ok) throw new Error('Failed to load testimonials')
        const data = await response.json()
        const active = Array.isArray(data) ? data.filter((t: Testimonial) => t.active).sort((a, b) => a.order - b.order) : []
        setTestimonials(active)
      } catch (error) {
        console.error('Failed to load testimonials:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTestimonials()
  }, [])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  if (isLoading) {
    return (
      <section className={styles.testimonialsSection}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Loading testimonials...
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return (
      <section className={styles.testimonialsSection}>
        <div className={styles.emptySection}>
          <h3>Testimonials Coming Soon</h3>
          <p>I'm gathering testimonials. Check back soon!</p>
        </div>
      </section>
    )
  }

  const current = testimonials[currentIndex]

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.carousel}>
        <div className={styles.carouselContainer}>
          <div className={styles.testimonialContent}>
            <blockquote className={styles.quote}>
              "{current.content}"
            </blockquote>
          </div>
          <div className={styles.attribution}>
            <div className={styles.name}>{current.name}</div>
            <div className={styles.role}>{current.role}</div>
          </div>
        </div>

        {testimonials.length > 1 && (
          <>
            <div className={styles.controls}>
              <button
                className={styles.button}
                onClick={handlePrevious}
                disabled={testimonials.length <= 1}
              >
                ← Previous
              </button>
              <button
                className={styles.button}
                onClick={handleNext}
                disabled={testimonials.length <= 1}
              >
                Next →
              </button>
            </div>
            <div className={styles.indicator}>
              {currentIndex + 1} / {testimonials.length}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
