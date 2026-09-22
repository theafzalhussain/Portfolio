'use client'

import { useEffect, useState } from 'react'

/**
 * Brand preloader. The percentage is clamped to 0–100 (the previous build
 * could render a negative value), settles on `load`, and has a hard 2.6s
 * cap so a slow third-party asset can never hold the page hostage.
 */
export function Preloader() {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPct(100)
      setDone(true)
      return
    }

    let value = 0
    let settled = false

    const tick = setInterval(() => {
      value = Math.min(92, value + Math.random() * 16 + 6)
      setPct(Math.max(0, Math.min(100, Math.round(value))))
      if (value >= 92) clearInterval(tick)
    }, 130)

    function settle() {
      if (settled) return
      settled = true
      clearInterval(tick)
      setPct(100)
      setTimeout(() => setDone(true), 260)
    }

    const onLoad = () => setTimeout(settle, 320)
    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad)

    const cap = setTimeout(settle, 2600)

    return () => {
      clearInterval(tick)
      clearTimeout(cap)
      window.removeEventListener('load', onLoad)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[300] grid place-items-center bg-background transition-[opacity,visibility] duration-[600ms] ${
        done ? 'invisible opacity-0' : 'visible opacity-100'
      }`}
    >
      <div className="grid justify-items-center gap-4">
        <span className="font-heading text-4xl font-bold tracking-wide">AH</span>
        <span className="block h-[2px] w-[150px] overflow-hidden rounded-full bg-border">
          <span
            className="block h-full bg-primary transition-[width] duration-200 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground">
          {pct}%
        </span>
      </div>
    </div>
  )
}
