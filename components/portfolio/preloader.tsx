'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const DURATION_MS = 1500
const EXIT_MS = 450

/**
 * Full-screen brand preloader: monogram + eased progress counter.
 * Unmounts itself after the run; body scroll is locked while it shows.
 */
export function Preloader() {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const start = performance.now()
    let raf = 0
    let exitTimer = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.round(eased * 100))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setDone(true)
        exitTimer = window.setTimeout(() => {
          setHidden(true)
          document.body.style.overflow = ''
        }, EXIT_MS)
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(exitTimer)
      document.body.style.overflow = ''
    }
  }, [])

  if (hidden) return null

  return (
    <motion.div
      initial={false}
      animate={{ opacity: done ? 0 : 1, scale: done ? 1.03 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background"
    >
      {/* Monogram */}
      <div className="relative flex size-24 items-center justify-center">
        <span className="absolute inset-0 animate-spin-slow rounded-full border border-primary/20 border-t-primary/70" />
        <span className="glass-strong absolute inset-2 rounded-full" />
        <span className="font-heading relative text-3xl font-bold text-primary">AH</span>
      </div>

      {/* Progress */}
      <div className="flex w-56 flex-col items-center gap-3">
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          {progress < 100 ? 'LOADING' : 'WELCOME'} · {progress}%
        </p>
      </div>
    </motion.div>
  )
}
