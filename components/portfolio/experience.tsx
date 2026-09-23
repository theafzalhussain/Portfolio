'use client'

import { Reveal } from '@/components/ui/reveal'

interface Entry {
  year: string
  title: string
  org: string
  body: string
  now?: boolean
}

const TIMELINE: Entry[] = [
  {
    year: '2023',
    title: 'Web development foundations',
    org: 'World Class Skill Centre, Delhi',
    body: 'Six-month intensive: HTML5, CSS3, JavaScript and responsive layout discipline. Where the fundamentals got fixed.',
  },
  {
    year: '2023',
    title: 'MERN stack development',
    org: 'DUCAT, Delhi',
    body: 'MongoDB, Express, React and Node — data modelling, REST APIs, authentication and the first full-stack deploys.',
  },
  {
    year: '2024',
    title: 'MCA — Computer Applications',
    org: 'IGNOU, New Delhi · in progress',
    body: 'Studying alongside full-time building, after a First Division BCA from Maharshi Dayanand University, Rohtak.',
  },
  {
    year: '2025',
    title: 'Independent product work',
    org: 'Self-directed · New Delhi',
    body: 'World Explorer and The Chronicle shipped — typed APIs, caching strategy, bilingual UI and measurable request reduction.',
  },
  {
    year: '2026',
    title: 'Production scale, and looking for a team',
    org: 'Open to frontend internships',
    body: 'eShopper and MovieZone took me into payments, background workers, real-time state and PWA delivery. Now I want code review and a product team around me.',
    now: true,
  },
]

export function Experience() {
  return (
    <section id="journey" className="section-y relative z-10 border-t border-border">
      <div className="shell">
        <Reveal as="header" className="mb-10 max-w-[46rem]">
          <p className="eyebrow mb-4">
            <span aria-hidden="true">03</span> Journey
          </p>
          <h2 className="text-balance font-heading text-[1.65rem] font-bold tracking-tight sm:text-3xl md:text-4xl">
            Foundations first, then shipping.
          </h2>
        </Reveal>

        <ol className="relative">
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[5px] w-px bg-border"
          />
          {TIMELINE.map((e, i) => (
            <Reveal
              as="li"
              key={`${e.year}-${e.title}`}
              delay={i * 60}
              className="relative pb-8 pl-7 last:pb-0 sm:pl-8 md:grid md:grid-cols-[90px_1fr] md:gap-6 md:pl-9"
            >
              <span
                aria-hidden="true"
                className={`absolute top-[7px] left-0 size-[11px] rounded-full border-[1.5px] ${
                  e.now
                    ? 'border-accent bg-accent'
                    : 'border-border bg-background'
                }`}
                style={{ boxShadow: '0 0 0 4px var(--background)' }}
              />
              <span className="font-mono text-[0.64rem] tracking-[0.14em] text-primary md:pt-1">
                {e.year}
              </span>
              <div>
                <h3 className="mt-1 font-heading text-base font-semibold sm:text-lg md:mt-0">
                  {e.title}
                </h3>
                <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground sm:text-[0.64rem]">
                  {e.org}
                </p>
                <p className="max-w-[42rem] text-[0.92rem] leading-relaxed text-muted-foreground sm:text-base">
                  {e.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
