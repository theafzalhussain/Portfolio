'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowRight, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/portfolio/brand-icons'
import { useActive, useDeviceTier, useIdleReady, useReducedMotion } from '@/lib/device'

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

/**
 * Cycling role text.
 *
 * `active` matters more than it looks: this component sets state every 34–72ms
 * forever. Left unguarded it kept re-rendering — and kept the tab awake —
 * while the visitor was reading a case study five sections away.
 */
function Typewriter({ active }: { active: boolean }) {
  // Seeded with the first role fully typed, so the server HTML and the first
  // paint both show real text instead of an empty line that pops in.
  const [text, setText] = useState(ROLES[0])
  const state = useRef({ word: 0, char: ROLES[0].length, deleting: false })
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !active) return

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
  }, [active, reduced])

  return (
    <>
      <span className="text-primary">{text}</span>
      <span
        aria-hidden="true"
        className="ml-[-0.2rem] inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-primary animate-caret-blink sm:w-[8px]"
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
      className="mt-1.5 font-heading text-[1.65rem] leading-none text-foreground sm:text-3xl md:text-4xl"
    >
      {display}
      {suffix}
    </dd>
  )
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const tier = useDeviceTier()
  const reduced = useReducedMotion()

  // Two independent gates on the 3D scene:
  //   `idle`   — never let three.js compete with the first paint or the LCP
  //              text. The bundle and the WebGL context are both deferred
  //              until the browser has nothing better to do.
  //   `active` — the hero is on (or near) screen and the tab is visible.
  const idle = useIdleReady()
  const active = useActive(sectionRef, '300px 0px')
  const showScene = idle && !reduced

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-hero-stage
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pt-24 pb-10 sm:pt-28 md:pt-32 md:pb-12"
    >
      {/* Static gradient stand-in. It is the first paint, and it stays as the
          permanent visual under prefers-reduced-motion. */}
      {!showScene && <div aria-hidden="true" className="hero-orb z-[1]" />}
      {showScene && <HeroScene tier={tier} active={active} reduced={reduced} />}

      {/* Vignette: keeps the copy readable over the scene without hiding it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(85% 55% at 78% 30%, transparent 0%, color-mix(in oklch, var(--background) 72%, transparent) 80%), linear-gradient(to bottom, color-mix(in oklch, var(--background) 35%, transparent) 0%, transparent 22%, transparent 68%, color-mix(in oklch, var(--background) 90%, transparent) 100%)',
        }}
      />

      <div className="shell relative z-[3] grid gap-8 sm:gap-10 md:gap-12">
        <div data-hero-copy className="max-w-[44rem]">
          <p className="glass mb-5 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full px-3 py-1.5 font-mono text-[0.6rem] leading-relaxed uppercase tracking-[0.1em] text-muted-foreground sm:mb-6 sm:text-[0.66rem] sm:tracking-[0.13em]">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-accent animate-pulse-ring"
            />
            Available for internships · Delhi NCR &amp; Remote
          </p>

          {/* The name is the h1: it is the personal brand and the strongest
              SEO signal on the page. The pitch line sits under it.
              Fluid size, because "Afzal Hussain" at a fixed 2.75rem was
              wider than a 320px viewport. */}
          <h1 className="font-heading text-[clamp(2.2rem,11.5vw,3rem)] leading-[1.02] font-bold tracking-[-0.03em] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            Afzal Hussain
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-primary sm:w-14" />
            <p className="font-mono text-[0.74rem] tracking-[0.06em] text-primary sm:text-sm">
              Frontend Developer
              <span className="hidden text-muted-foreground sm:inline">
                {' '}· React · Next.js · TypeScript
              </span>
            </p>
          </div>

          <p className="mt-5 max-w-[30rem] text-balance font-heading text-[1.35rem] leading-snug font-semibold tracking-tight sm:text-2xl md:mt-6 md:max-w-[34rem] md:text-3xl">
            I build <span className="text-primary">production</span> interfaces for the modern
            web.
          </p>

          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.75rem] sm:text-sm">
            <span className="text-muted-foreground">const role =</span>
            <span aria-live="polite">
              <Typewriter active={active} />
            </span>
          </p>

          <p className="mt-5 max-w-[34rem] text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base md:text-lg">
            Based in New Delhi, working across React, Next.js, TypeScript and the MERN stack.
            Five deployed applications — including a payments-ready commerce platform with
            Redis caching, background workers and real-time order state.
          </p>

          {/* Full-bleed buttons on a phone: a 44px-tall target that spans the
              column is far easier to hit than two shrink-wrapped pills. */}
          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <a
              href="#work"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:justify-start sm:py-3"
            >
              View selected work
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary active:scale-[0.98] sm:justify-start sm:py-3"
            >
              <Mail className="size-4" />
              Start a conversation
            </a>
          </div>

          {/* Wraps instead of overflowing: the email alone is wider than the
              icon row plus rule on a 320px screen. */}
          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 text-muted-foreground sm:mt-8">
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
            <span aria-hidden="true" className="hidden h-px w-16 bg-border sm:block" />
            <a
              href="mailto:theafzalhussain786@gmail.com"
              className="font-mono text-[0.7rem] tracking-wide underline decoration-border underline-offset-4 transition-colors hover:text-primary sm:text-xs"
            >
              theafzalhussain786@gmail.com
            </a>
          </div>
        </div>

        <dl className="stat-grid grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/40 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-muted-foreground sm:text-[0.6rem] sm:tracking-[0.13em]">
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
