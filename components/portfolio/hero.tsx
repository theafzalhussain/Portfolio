'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowRight, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/portfolio/brand-icons'

// three.js cannot render on the server, and a WebGL failure must never take
// the hero down — so the scene is client-only and purely decorative.
const HeroScene = dynamic(
  () => import('@/components/three/hero-scene').then((m) => m.HeroScene),
  { ssr: false },
)

const ROLES = [
  '"Frontend Developer"',
  '"React Engineer"',
  '"Next.js Developer"',
  '"Full-Stack (MERN)"',
]

const STATS = [
  { label: 'Production apps', value: 5, suffix: '' },
  { label: 'REST endpoints shipped', value: 45, suffix: '+' },
  { label: 'Lighthouse on shipped work', value: 90, suffix: '+' },
  { label: 'Reusable components', value: 60, suffix: '+' },
]

function Typewriter() {
  const [text, setText] = useState('')
  const state = useRef({ word: 0, char: 0, deleting: false })

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(ROLES[0])
      return
    }

    let timer: ReturnType<typeof setTimeout>

    function tick() {
      const s = state.current
      const word = ROLES[s.word]
      setText(word.slice(0, s.char))

      let delay = 72
      if (!s.deleting && s.char < word.length) {
        s.char += 1
      } else if (!s.deleting && s.char === word.length) {
        s.deleting = true
        delay = 1700
      } else if (s.deleting && s.char > 0) {
        s.char -= 1
        delay = 34
      } else {
        s.deleting = false
        s.word = (s.word + 1) % ROLES.length
        delay = 320
      }
      timer = setTimeout(tick, delay)
    }

    tick()
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <span className="text-primary">{text}</span>
      <span
        aria-hidden="true"
        className="ml-[-0.2rem] inline-block h-[1.05em] w-[8px] translate-y-[2px] bg-primary animate-caret-blink"
      />
    </>
  )
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLElement>(null)
  // Seeded with the real number, so a visitor never sees a static "0+"
  // if the observer has not fired yet (the old site shipped that bug).
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplay(value)
      return
    }

    let raf = 0
    let start: number | null = null

    function step(ts: number) {
      if (start === null) start = ts
      const t = Math.min(1, (ts - start) / 1250)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(value * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        setDisplay(0)
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return (
    <dd
      ref={ref as React.RefObject<HTMLElement>}
      className="mt-1.5 font-heading text-3xl leading-none text-foreground md:text-4xl"
    >
      {display}
      {suffix}
    </dd>
  )
}

export function Hero() {
  return (
    <section
      id="hero"
      data-hero-stage
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pt-28 pb-8 md:pt-32"
    >
      <HeroScene />

      {/* Vignette: keeps the copy readable over the scene without hiding it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(85% 55% at 78% 30%, transparent 0%, color-mix(in oklch, var(--background) 72%, transparent) 80%), linear-gradient(to bottom, color-mix(in oklch, var(--background) 35%, transparent) 0%, transparent 22%, transparent 68%, color-mix(in oklch, var(--background) 90%, transparent) 100%)',
        }}
      />

      <div className="relative z-[3] mx-auto grid w-[min(72rem,calc(100%-2rem))] gap-12 md:w-[min(72rem,calc(100%-4rem))]">
        <div data-hero-copy className="max-w-[44rem]">
          <p className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.13em] text-muted-foreground">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-accent animate-pulse-ring"
            />
            Available for internships · Delhi NCR &amp; Remote
          </p>

          <h1 className="text-balance font-heading text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            I build <span className="text-primary">production</span> interfaces
            <br className="hidden sm:block" /> for the modern web.
          </h1>

          <p className="mt-6 flex flex-wrap items-center gap-2 font-mono text-sm">
            <span className="text-muted-foreground">const role =</span>
            <span aria-live="polite">
              <Typewriter />
            </span>
          </p>

          <p className="mt-6 max-w-[34rem] leading-relaxed text-muted-foreground md:text-lg">
            Frontend developer in New Delhi working across React, Next.js, TypeScript and the
            MERN stack. Five deployed applications — including a payments-ready commerce
            platform with Redis caching, background workers and real-time order state.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#work"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              View selected work
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              <Mail className="size-4" />
              Start a conversation
            </a>
          </div>

          <div className="mt-8 flex items-center gap-4 text-muted-foreground">
            <a
              href="https://github.com/theafzalhussain"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub profile"
              className="transition-all hover:-translate-y-0.5 hover:text-primary"
            >
              <GithubIcon className="size-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/theafzalhussain/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn profile"
              className="transition-all hover:-translate-y-0.5 hover:text-primary"
            >
              <LinkedinIcon className="size-5" />
            </a>
            <span aria-hidden="true" className="h-px w-16 bg-border" />
            <a
              href="mailto:theafzalhussain786@gmail.com"
              className="font-mono text-xs tracking-wide underline decoration-border underline-offset-4 transition-colors hover:text-primary"
            >
              theafzalhussain786@gmail.com
            </a>
          </div>
        </div>

        <dl className="stat-grid grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/40 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.13em] text-muted-foreground">
                {s.label}
              </dt>
              <Counter value={s.value} suffix={s.suffix} />
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
