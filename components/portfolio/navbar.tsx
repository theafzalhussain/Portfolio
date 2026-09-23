'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { RESUME_FILENAME, RESUME_PATH } from '@/lib/site'

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#stack', label: 'Stack' },
  { href: '#journey', label: 'Journey' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

export function Navbar() {
  const { theme, toggle } = useTheme()
  const [stuck, setStuck] = useState(false)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const barRef = useRef<HTMLSpanElement>(null)

  /**
   * One rAF-throttled scroll handler.
   *
   * The previous version ran on every scroll event and read
   * `document.documentElement.scrollHeight` plus five `getElementById`
   * lookups *and* `offsetTop` for each — that is a forced synchronous layout
   * several times per scroll event, which is exactly what makes a page feel
   * sticky. Now the geometry is measured once (and on resize), the handler
   * runs at most once per frame, and the progress bar is driven by a
   * transform so it never triggers layout at all.
   */
  useEffect(() => {
    let raf = 0
    let ticking = false
    let maxScroll = 1
    // Cached [href, offsetTop] pairs, tallest-first at measure time.
    let marks: { href: string; top: number }[] = []

    function measure() {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      marks = LINKS.map((l) => {
        const el = document.getElementById(l.href.slice(1))
        return { href: l.href, top: el ? el.getBoundingClientRect().top + window.scrollY : Infinity }
      })
      update()
    }

    function update() {
      const y = window.scrollY
      const progress = Math.min(1, Math.max(0, y / maxScroll))

      // scaleX on a full-width bar: composited, no layout, no repaint of the
      // header. Animating `width` did all three, 60 times a second.
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`
      }

      setStuck(y > 12)

      const mid = y + window.innerHeight * 0.32
      let current = ''
      for (const m of marks) {
        if (m.top <= mid) current = m.href
      }
      setActive(current)
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(() => {
        ticking = false
        update()
      })
    }

    let resizeTimer: ReturnType<typeof setTimeout>
    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(measure, 150)
    }

    measure()
    // Images and fonts settling change every offset, so re-measure on load.
    window.addEventListener('load', measure)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      window.removeEventListener('load', measure)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  /** Mobile menu: lock the page behind it, close on Escape, close at lg. */
  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    const mql = window.matchMedia('(min-width: 1024px)')
    function onWide(e: MediaQueryListEvent) {
      if (e.matches) setOpen(false)
    }

    window.addEventListener('keydown', onKey)
    mql.addEventListener('change', onWide)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
      mql.removeEventListener('change', onWide)
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[90] border-b backdrop-blur-xl transition-colors ${
        stuck ? 'border-border' : 'border-transparent'
      }`}
      style={{ background: 'color-mix(in oklch, var(--background) 82%, transparent)' }}
    >
      <span
        ref={barRef}
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-[1.5px] origin-left bg-primary"
        style={{ transform: 'scaleX(0)' }}
      />

      <div className="shell flex items-center justify-between gap-3 py-2.5 sm:gap-4">
        <a href="#hero" className="flex items-center gap-2.5" aria-label="Afzal Hussain, home">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-heading text-sm font-bold text-primary-foreground">
            AH
          </span>
          <span className="hidden leading-tight sm:block">
            <strong className="block text-[0.86rem] font-semibold">Afzal Hussain</strong>
            <em className="block font-mono text-[0.6rem] uppercase not-italic tracking-[0.12em] text-muted-foreground">
              Frontend Developer
            </em>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-7" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={active === l.href ? 'true' : undefined}
              className={`relative text-[0.84rem] font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-[1.5px] after:bg-primary after:transition-all ${
                active === l.href
                  ? 'text-foreground after:right-0'
                  : 'text-muted-foreground after:right-full hover:text-foreground'
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border transition-colors hover:border-primary hover:text-primary"
          >
            {theme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>

          {/* Resume sits outside the anchor nav on purpose: it's the one
              action a recruiter wants without scrolling, and it stays
              secondary so "Hire me" remains the single primary CTA.
              It appears from md up — at sm there is not enough room for
              both it and the primary CTA without crowding the brand. */}
          <a
            href={RESUME_PATH}
            download={RESUME_FILENAME}
            className="hidden items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary md:inline-flex"
          >
            <FileText className="size-3.5" aria-hidden="true" />
            Resume
          </a>

          <a
            href="#contact"
            className="hidden rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            Hire me
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="max-h-[calc(100svh-3.75rem)] overflow-y-auto overscroll-contain border-t border-border lg:hidden"
          style={{ background: 'color-mix(in oklch, var(--background) 96%, transparent)' }}
        >
          <div className="shell grid pt-2 pb-5">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-border/50 py-3.5 text-[0.95rem]"
              >
                {l.label}
              </a>
            ))}
            <a
              href={RESUME_PATH}
              download={RESUME_FILENAME}
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold"
            >
              <FileText className="size-4" aria-hidden="true" />
              Download resume
            </a>
            <a
              href="mailto:theafzalhussain786@gmail.com"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Email me
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
