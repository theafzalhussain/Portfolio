'use client'

import { useEffect, useState } from 'react'

/** Hard ceiling. Nothing holds the page behind the curtain longer than this. */
const MAX_WAIT = 1100

/**
 * Brand preloader.
 *
 * The previous version settled on the window `load` event — which does not
 * fire until *every* image has arrived, including all five below-the-fold
 * project screenshots. On a slow connection that meant an opaque overlay sat
 * on top of fully-rendered content for seconds, and it was the overlay, not
 * the hero, that Chrome measured as the largest contentful paint.
 *
 * Now it settles on `document.fonts.ready` (the only asset that would cause a
 * visible reflow if it landed late), with a 1.1s hard cap, and it unmounts
 * itself once the fade is done so nothing is left compositing on top of the
 * page.
 */
export function Preloader() {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPct(100)
      setDone(true)
      setGone(true)
      return
    }

    let value = 0
    let settled = false

    const tick = setInterval(() => {
      value = Math.min(92, value + Math.random() * 18 + 8)
      setPct(Math.max(0, Math.min(100, Math.round(value))))
      if (value >= 92) clearInterval(tick)
    }, 90)

    let fade: ReturnType<typeof setTimeout>
    let unmount: ReturnType<typeof setTimeout>

    function settle() {
      if (settled) return
      settled = true
      clearInterval(tick)
      setPct(100)
      fade = setTimeout(() => setDone(true), 180)
      // Matches the CSS fade duration below; after that the overlay is dead
      // weight in the layer tree.
      unmount = setTimeout(() => setGone(true), 180 + 500)
    }

    // Fonts are the one late asset that shifts layout. Images are lazy and
    // below the fold, so they are not worth waiting for.
    if (document.fonts?.status === 'loaded') {
      settle()
    } else {
      document.fonts?.ready.then(settle).catch(settle)
    }

    const cap = setTimeout(settle, MAX_WAIT)

    return () => {
      clearInterval(tick)
      clearTimeout(cap)
      clearTimeout(fade)
      clearTimeout(unmount)
    }
  }, [])

  if (gone) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[300] grid place-items-center bg-background transition-[opacity,visibility] duration-500 ${
        done ? 'invisible opacity-0' : 'visible opacity-100'
      }`}
    >
      <div className="grid justify-items-center gap-4">
        <span className="font-heading text-4xl font-bold tracking-wide">AH</span>
        <span className="block h-[2px] w-[130px] overflow-hidden rounded-full bg-border sm:w-[150px]">
          <span
            className="block h-full origin-left bg-primary transition-transform duration-200 ease-linear"
            style={{ transform: `scaleX(${pct / 100})` }}
          />
        </span>
        <span className="font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground">
          {pct}%
        </span>
      </div>
    </div>
  )
}
