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
    body: 'eShopper and MovieZone took me into payments, background workers, real-time state and PWA delivery. Saarthi took me into Python. Now I want code review and a product team around me.',
    now: true,
  },
]

export function Experience() {
  return (
    <section id="journey" className="relative z-10 border-t border-border py-20 md:py-28">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))] md:w-[min(72rem,calc(100%-4rem))]">
        <Reveal as="header" className="mb-10 max-w-[46rem]">
          <p className="eyebrow mb-4">
            <span aria-hidden="true">03</span> Journey
          </p>
          <h2 className="text-balance font-heading text-3xl font-bold tracking-tight md:text-4xl">
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
              className="relative pb-8 pl-8 last:pb-0 md:grid md:grid-cols-[90px_1fr] md:gap-6 md:pl-9"
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
                <h3 className="mt-1 font-heading text-lg font-semibold md:mt-0">{e.title}</h3>
                <p className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted-foreground">
                  {e.org}
                </p>
                <p className="max-w-[42rem] leading-relaxed text-muted-foreground">{e.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
