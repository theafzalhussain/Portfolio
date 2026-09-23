'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Floating "back to top" button — appears after scrolling past 600px.
 *
 * This used to be the page's only consumer of framer-motion, which meant the
 * whole animation runtime shipped in the main bundle to fade one 44px circle.
 * A CSS transition on opacity + transform does the same job for nothing, and
 * the button stays mounted so there is no layout work on either transition.
 */
export function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let ticking = false
    let raf = 0

    function update() {
      setShow(window.scrollY > 600)
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(() => {
        ticking = false
        update()
      })
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`glass-strong fixed bottom-4 left-4 z-40 flex size-11 items-center justify-center rounded-full text-muted-foreground shadow-[0_0_30px_-12px_var(--glow)] transition-[opacity,transform,color] duration-[250ms] ease-out hover:text-primary sm:bottom-6 sm:left-6 ${
        show
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ArrowUp className="size-5" />
    </button>
  )
}
