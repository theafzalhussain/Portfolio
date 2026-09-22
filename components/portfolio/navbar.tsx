'use client'

import { useEffect, useState } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#stack', label: 'Stack' },
  { href: '#journey', label: 'Journey' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

export function Navbar() {
  const { theme, toggle } = useTheme()
  const [progress, setProgress] = useState(0)
  const [stuck, setStuck] = useState(false)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0)
      setStuck(y > 12)

      const mid = y + window.innerHeight * 0.32
      let current = ''
      for (const l of LINKS) {
        const el = document.getElementById(l.href.slice(1))
        if (el && el.offsetTop <= mid) current = l.href
      }
      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[90] border-b backdrop-blur-xl transition-colors ${
        stuck ? 'border-border' : 'border-transparent'
      }`}
      style={{ background: 'color-mix(in oklch, var(--background) 82%, transparent)' }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-[1.5px] bg-primary transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />

      <div className="mx-auto flex w-[min(72rem,calc(100%-1.6rem))] items-center justify-between gap-4 py-2.5 md:w-[min(72rem,calc(100%-4rem))]">
        <a href="#hero" className="flex items-center gap-2.5" aria-label="Afzal Hussain, home">
          <span className="grid size-9 place-items-center rounded-xl bg-primary font-heading text-sm font-bold text-primary-foreground">
            AH
          </span>
          <span className="hidden leading-tight xs:block sm:block">
            <strong className="block text-[0.86rem] font-semibold">Afzal Hussain</strong>
            <em className="block font-mono text-[0.6rem] uppercase not-italic tracking-[0.12em] text-muted-foreground">
              Frontend Developer
            </em>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
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
            className="grid size-9 place-items-center rounded-xl border border-border transition-colors hover:border-primary hover:text-primary"
          >
            {theme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>

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
            className="grid size-9 place-items-center rounded-xl border border-border lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="grid border-t border-border px-4 pt-2 pb-4 lg:hidden"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-border/50 py-3 text-[0.95rem]"
            >
              {l.label}
            </a>
          ))}
          <a
            href="mailto:theafzalhussain786@gmail.com"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            Email me
          </a>
        </nav>
      )}
    </header>
  )
}
