'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'

const links = [
  { href: '#top', id: 'top', label: 'Home' },
  { href: '#about', id: 'about', label: 'About' },
  { href: '#skills', id: 'skills', label: 'Skills' },
  { href: '#projects', id: 'projects', label: 'Projects' },
  { href: '#resume', id: 'resume', label: 'Resume' },
  { href: '#certifications', id: 'certifications', label: 'Certifications' },
  { href: '#contact', id: 'contact', label: 'Contact' },
]

export function Navbar() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('top')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach((s) => observer.observe(s))

    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Scroll progress indicator */}
      <motion.div
        aria-hidden="true"
        className="h-0.5 origin-left bg-gradient-to-r from-primary via-accent to-primary"
        style={{ scaleX: progress }}
      />
      <nav
        className={`glass-strong mx-auto flex items-center justify-between rounded-2xl px-4 transition-all duration-300 sm:px-5 ${
          scrolled
            ? 'mt-2 w-[min(60rem,calc(100%-1.5rem))] py-2 shadow-[0_8px_40px_-12px_var(--glow)]'
            : 'mt-3 w-[min(64rem,calc(100%-1.5rem))] py-3'
        }`}
      >
        <a
          href="#top"
          className="group flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight text-foreground"
        >
          <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-sm text-primary ring-1 ring-primary/30 transition-all group-hover:ring-primary/60">
            <span className="relative z-10">AH</span>
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
          </span>
          <span className="hidden sm:block">
            Afzal<span className="text-primary">.</span>
          </span>
        </a>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => {
            const isActive = active === link.id
            return (
              <li key={link.href} className="relative">
                <a
                  href={link.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative z-10 block rounded-full px-3.5 py-2 text-sm transition-colors xl:px-4 ${
                    isActive
                      ? 'font-semibold text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </a>
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-primary/10 ring-1 ring-primary/25"
                  />
                )}
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="group hidden items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-6px_var(--glow)] transition-all hover:scale-[1.03] hover:shadow-[0_0_36px_-4px_var(--glow)] active:scale-95 lg:inline-flex"
          >
            Hire Me
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>

          <button
            type="button"
            className="glass rounded-xl p-2.5 text-foreground transition-colors hover:text-primary lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="glass-strong mx-auto mt-2 w-[min(64rem,calc(100%-1.5rem))] rounded-2xl p-3 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {links.map((link, i) => {
                const isActive = active === link.id
                return (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors ${
                        isActive
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
                      )}
                    </a>
                  </motion.li>
                )
              })}
              <li>
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Hire Me <ArrowRight className="size-3.5" />
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
