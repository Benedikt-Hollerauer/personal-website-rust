import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage'
import { RoutePlaceholderPage } from './pages/RoutePlaceholderPage'

type CanvasPoint = {
  x: number
  y: number
}

type TransitionDirection = {
  x: number
  y: number
}

const pageVariants = {
  enter: ({ x, y }: TransitionDirection) => ({
    x: `${x * 100}%`,
    y: `${y * 100}%`,
  }),
  center: {
    x: '0%',
    y: '0%',
  },
  exit: ({ x, y }: TransitionDirection) => ({
    x: `${x * -100}%`,
    y: `${y * -100}%`,
  }),
}

const ROUTE_POINTS: Record<string, CanvasPoint> = {
  '/': { x: 0, y: 0 },
  '/about': { x: -1, y: 0 },
  '/resources': { x: 0, y: -1 },
  '/projects': { x: 1, y: 0 },
  '/contact': { x: 0, y: 1 },
}

function getDirection(fromPath: string, toPath: string): TransitionDirection {
  const from = ROUTE_POINTS[fromPath]
  const to = ROUTE_POINTS[toPath]

  if (!from || !to) {
    return { x: 0, y: 0 }
  }

  return {
    x: to.x - from.x,
    y: to.y - from.y,
  }
}

function App() {
  const location = useLocation()
  const previousPathRef = useRef(location.pathname)

  const direction = useMemo(
    () => getDirection(previousPathRef.current, location.pathname),
    [location.pathname],
  )

  useEffect(() => {
    previousPathRef.current = location.pathname
  }, [location.pathname])

  const [message, setMessage] = useState<string>("Loading...")

  useEffect(() => {
    // This hits http://localhost:5173/api/projects 
    // Vite proxies it to http://localhost:5150/api/projects
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setMessage(data))
      .catch((err) => setMessage("Error connecting to backend: " + err));
  }, [])

  // Backend test
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Portfolio Test</h1>
      <p>Backend says: <strong>{message}</strong></p>
    </div>
  )

  return (
    <div className="app-canvas">
      <AnimatePresence mode="sync" initial={false} custom={direction}>
        <motion.div
          key={location.pathname}
          className="page-shell"
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<RoutePlaceholderPage title="About" returnDirection="right" />} />
            <Route
              path="/resources"
              element={<RoutePlaceholderPage title="Resources" returnDirection="bottom" />}
            />
            <Route
              path="/projects"
              element={<RoutePlaceholderPage title="Projects" returnDirection="left" />}
            />
            <Route
              path="/contact"
              element={<RoutePlaceholderPage title="Contact" returnDirection="top" />}
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
