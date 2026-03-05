import { EdgeArrowNav } from '../components/EdgeArrowNav'

export function HomePage() {
  return (
    <main className="home-page">
      <EdgeArrowNav />
      <section className="home-page__content" aria-label="Homepage content">
        <h1>Homepage</h1>
        <p>Use the edge arrows to navigate.</p>
      </section>
    </main>
  )
}
