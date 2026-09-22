'use client'

import { useState } from 'react'
import { Reveal } from '@/components/ui/reveal'

/* Inline SVG glyphs — geometry, not brand marks. No icon font request and
   no trademark question, and each inherits its card's accent colour. */
const GLYPH: Record<string, string> = {
  code: '<path d="M9.2 5 3.6 12l5.6 7M14.8 5l5.6 7-5.6 7"/>',
  brush:
    '<path d="M4 20c0-2.2 1.3-3 2.6-3.4M14.8 4.3 19.7 9.2 9.9 19a3.5 3.5 0 0 1-4.9-4.9Z"/><path d="M12.4 6.7l4.9 4.9"/>',
  braces:
    '<path d="M8.4 4.5C6.5 4.5 6.9 8 6.9 9.4c0 1.4-1.3 2.6-2.9 2.6 1.6 0 2.9 1.2 2.9 2.6 0 1.4-.4 4.9 1.5 4.9M15.6 4.5c1.9 0 1.5 3.5 1.5 4.9 0 1.4 1.3 2.6 2.9 2.6-1.6 0-2.9 1.2-2.9 2.6 0 1.4.4 4.9-1.5 4.9"/>',
  atom: '<circle cx="12" cy="12" r="2.1"/><ellipse cx="12" cy="12" rx="9.4" ry="3.9"/><ellipse cx="12" cy="12" rx="9.4" ry="3.9" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.4" ry="3.9" transform="rotate(120 12 12)"/>',
  layers: '<path d="m12 3 8.5 4.6L12 12.2 3.5 7.6 12 3Z"/><path d="m4 12 8 4.4 8-4.4M4 16.4l8 4.4 8-4.4"/>',
  waves:
    '<path d="M3 9.2c1.6-2.4 3.4-3.6 5.4-3.6 3 0 4 3.6 7.2 3.6 1.6 0 3.1-.9 4.4-2.6M3 16.4c1.6-2.4 3.4-3.6 5.4-3.6 3 0 4 3.6 7.2 3.6 1.6 0 3.1-.9 4.4-2.6"/>',
  bolt: '<path d="M13.2 2.5 4.6 13.6h6.2L9.9 21.5l8.6-11.1h-6.2l.9-7.9Z"/>',
  ts: '<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3"/><path d="M7 9.4h5M9.5 9.4v7.2M14 16.3c.6.4 1.3.6 2 .6 1.2 0 2-.6 2-1.5 0-1.9-3.8-1.2-3.8-3.4 0-1 .9-1.6 2-1.6.6 0 1.2.1 1.7.4"/>',
  server:
    '<rect x="3.2" y="4.2" width="17.6" height="6.2" rx="2"/><rect x="3.2" y="13.6" width="17.6" height="6.2" rx="2"/><path d="M7 7.3h.01M7 16.7h.01"/>',
  route:
    '<circle cx="6" cy="6.5" r="2.6"/><circle cx="18" cy="17.5" r="2.6"/><path d="M8.6 6.5h5.1a3.2 3.2 0 0 1 0 6.4h-3.4a3.2 3.2 0 0 0 0 6.4h5.1"/>',
  plug: '<path d="M9 3.2v4.4M15 3.2v4.4M6.4 7.6h11.2v3.6a5.6 5.6 0 0 1-11.2 0V7.6ZM12 16.8v4"/>',
  db: '<ellipse cx="12" cy="6.2" rx="7.6" ry="3"/><path d="M4.4 6.2v11.6c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3V6.2"/><path d="M4.4 12c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3"/>',
  stack: '<path d="M3.6 7.4 12 3.6l8.4 3.8L12 11.2 3.6 7.4Z"/><path d="m3.6 12.2 8.4 3.8 8.4-3.8M3.6 16.6l8.4 3.8 8.4-3.8"/>',
  signal:
    '<path d="M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8M8.6 15.4a4.8 4.8 0 0 1 0-6.8M15.4 8.6a4.8 4.8 0 0 1 0 6.8"/><circle cx="12" cy="12" r="1.5"/>',
  branch:
    '<circle cx="6.5" cy="5.5" r="2.4"/><circle cx="6.5" cy="18.5" r="2.4"/><circle cx="17.5" cy="9.5" r="2.4"/><path d="M6.5 7.9v8.2M8.9 9.5c2.6 0 6.2-.3 6.2 0M15.1 11.9c0 3.4-4 3.9-6.3 3.9"/>',
  rocket:
    '<path d="M12 2.8c3.4 2.4 5.2 6 5.2 10.2L12 17.6 6.8 13C6.8 8.8 8.6 5.2 12 2.8Z"/><circle cx="12" cy="9.6" r="1.8"/><path d="M8.6 17.2c-1.2 1.2-1.4 3-1.2 4 .9.2 2.8 0 4-1.2M15.4 17.2c1.2 1.2 1.4 3 1.2 4-.9.2-2.8 0-4-1.2"/>',
  device:
    '<rect x="6.4" y="2.6" width="11.2" height="18.8" rx="2.6"/><path d="M10.6 5.4h2.8"/><circle cx="12" cy="17.6" r="1.1"/>',
  card: '<rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.4"/><path d="M2.8 10h18.4M6.6 14.6h3.6"/>',
  shield:
    '<path d="M12 2.8 20 5.6v5.6c0 4.6-3.2 8.4-8 9.8-4.8-1.4-8-5.2-8-9.8V5.6L12 2.8Z"/><path d="m8.8 12 2.3 2.3 4.1-4.4"/>',
  key: '<circle cx="8.4" cy="15.6" r="3.6"/><path d="m11 13 8.4-8.4M16.6 7.4l2.4 2.4M14.2 9.8l2.4 2.4"/>',
  cloud:
    '<path d="M7.2 18.4h9.4a4.2 4.2 0 0 0 .5-8.4 5.6 5.6 0 0 0-10.7 1.3 3.6 3.6 0 0 0 .8 7.1Z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.4 2"/>',
  image:
    '<rect x="3.2" y="4.6" width="17.6" height="14.8" rx="2.4"/><circle cx="8.6" cy="10" r="1.6"/><path d="m4.4 17.4 4.8-4.4 3.4 3 3-2.6 4 3.6"/>',
  brain:
    '<path d="M9.6 4.4a2.8 2.8 0 0 0-2.8 2.8 2.6 2.6 0 0 0-1.4 4.6A2.8 2.8 0 0 0 7 16.6a2.6 2.6 0 0 0 4.6 1.6V5.8a2.6 2.6 0 0 0-2-1.4ZM14.4 4.4a2.8 2.8 0 0 1 2.8 2.8 2.6 2.6 0 0 1 1.4 4.6 2.8 2.8 0 0 1-1.6 4.8 2.6 2.6 0 0 1-4.6 1.6"/>',
  python:
    '<path d="M12 3.2c-3 0-3.6 1.2-3.6 2.6V8h5.2v1.2H6.8c-1.8 0-3 1.4-3 3.6s1 3.6 2.6 3.6h1.4v-2.2c0-1.8 1.4-3 3.2-3h3.6c1.6 0 2.8-1.2 2.8-2.8V5.8c0-1.4-1.2-2.6-3.2-2.6H12Z"/><path d="M10.2 5.6h.01"/>',
  mobile:
    '<rect x="5.6" y="2.4" width="12.8" height="19.2" rx="2.8"/><path d="M12 18.4h.01"/>',
}

type Category = 'language' | 'frontend' | 'backend' | 'data' | 'tools'

interface Skill {
  name: string
  cat: Category
  glyph: keyof typeof GLYPH
  color: string
  /** Where it actually shipped — the evidence, not the claim. */
  proof: string
}

/**
 * Everything here appears in at least one deployed project or repository.
 * Nothing is on this list because it looks good on a list.
 */
const SKILLS: Skill[] = [
  // Languages
  { name: 'JavaScript', cat: 'language', glyph: 'braces', color: '#ffb900', proof: 'ES6+ across all 5 apps' },
  { name: 'TypeScript', cat: 'language', glyph: 'ts', color: '#38bdf8', proof: '94–96% of 3 repos' },
  { name: 'HTML5', cat: 'language', glyph: 'code', color: '#ff8904', proof: 'Semantic, accessible markup' },
  { name: 'CSS3 & SCSS', cat: 'language', glyph: 'brush', color: '#22d3ee', proof: 'Design systems, motion' },
  { name: 'Python', cat: 'language', glyph: 'python', color: '#4ade80', proof: 'Saarthi AI agent (95%)' },
  { name: 'Kotlin', cat: 'language', glyph: 'mobile', color: '#a78bfa', proof: 'Saarthi device module' },

  // Frontend
  { name: 'React', cat: 'frontend', glyph: 'atom', color: '#22d3ee', proof: 'Component architecture, hooks' },
  { name: 'Next.js', cat: 'frontend', glyph: 'layers', color: '#e7ecea', proof: 'App Router, SSR, route handlers' },
  { name: 'Tailwind CSS', cat: 'frontend', glyph: 'waves', color: '#22d3ee', proof: 'Mobile-first, token-driven' },
  { name: 'Redux Toolkit', cat: 'frontend', glyph: 'stack', color: '#a78bfa', proof: 'eShopper store + Redux Saga' },
  { name: 'TanStack Query', cat: 'frontend', glyph: 'plug', color: '#fb7185', proof: '~70% fewer requests' },
  { name: 'SWR', cat: 'frontend', glyph: 'signal', color: '#e7ecea', proof: 'The Chronicle revalidation' },
  { name: 'Framer Motion', cat: 'frontend', glyph: 'bolt', color: '#f472b6', proof: 'Purposeful interface motion' },
  { name: 'Three.js / R3F', cat: 'frontend', glyph: 'rocket', color: '#34d399', proof: 'The WebGL hero on this page' },
  { name: 'Material UI', cat: 'frontend', glyph: 'layers', color: '#38bdf8', proof: 'eShopper admin + data grid' },
  { name: 'Bootstrap', cat: 'frontend', glyph: 'brush', color: '#a78bfa', proof: 'Early responsive builds' },
  { name: 'Recharts', cat: 'frontend', glyph: 'chart', color: '#fbbf24', proof: 'eShopper admin analytics' },
  { name: 'PWA', cat: 'frontend', glyph: 'device', color: '#4ade80', proof: 'MovieZone: SW + web push' },

  // Backend
  { name: 'Node.js', cat: 'backend', glyph: 'server', color: '#4ade80', proof: 'APIs, workers, CLI checks' },
  { name: 'Express', cat: 'backend', glyph: 'route', color: '#b9c2be', proof: 'Routing, middleware, validation' },
  { name: 'REST APIs', cat: 'backend', glyph: 'plug', color: '#34d399', proof: '45+ endpoints shipped' },
  { name: 'Socket.IO', cat: 'backend', glyph: 'signal', color: '#a78bfa', proof: 'Live order state, server-derived rooms' },
  { name: 'BullMQ', cat: 'backend', glyph: 'stack', color: '#fb923c', proof: '4 queues: mail, refunds, reports, images' },
  { name: 'JWT & bcrypt', cat: 'backend', glyph: 'key', color: '#fbbf24', proof: 'Auth and password hashing' },
  { name: 'Razorpay', cat: 'backend', glyph: 'card', color: '#3b82f6', proof: 'Server-side signature verification' },
  { name: 'Nodemailer', cat: 'backend', glyph: 'plug', color: '#22d3ee', proof: 'Transactional mail, HTML-escaped' },
  { name: 'node-cron', cat: 'backend', glyph: 'clock', color: '#f472b6', proof: 'Idempotent auto-refund jobs' },
  { name: 'Sharp', cat: 'backend', glyph: 'image', color: '#34d399', proof: 'WebP image proxy pipeline' },
  { name: 'Web Push', cat: 'backend', glyph: 'signal', color: '#4ade80', proof: 'MovieZone notifications' },
  { name: 'Helmet & CORS', cat: 'backend', glyph: 'shield', color: '#fbbf24', proof: 'Headers, origin policy, rate limits' },
  { name: 'Gemini API', cat: 'backend', glyph: 'brain', color: '#a78bfa', proof: 'eShopper catalogue chat' },

  // Database & cache
  { name: 'MongoDB', cat: 'data', glyph: 'db', color: '#34d399', proof: 'Atlas — 16 models in eShopper' },
  { name: 'Mongoose', cat: 'data', glyph: 'db', color: '#4ade80', proof: 'Schemas, indexes, cached connection' },
  { name: 'Redis / ioredis', cat: 'data', glyph: 'stack', color: '#ff6f61', proof: '~60% fewer repeat DB reads' },
  { name: 'node-cache / LRU', cat: 'data', glyph: 'stack', color: '#fb923c', proof: 'TMDB proxy, 24h stale fallback' },
  { name: 'Cloudinary', cat: 'data', glyph: 'cloud', color: '#38bdf8', proof: 'Product media storage' },
  { name: 'Firebase', cat: 'data', glyph: 'cloud', color: '#fbbf24', proof: 'Auth + admin SDK in eShopper' },

  // DevOps & tools
  { name: 'Git & GitHub', cat: 'tools', glyph: 'branch', color: '#ff8904', proof: 'Branches, PRs, Actions' },
  { name: 'Vercel', cat: 'tools', glyph: 'rocket', color: '#e7ecea', proof: 'Preview + production deploys' },
  { name: 'Render', cat: 'tools', glyph: 'cloud', color: '#22d3ee', proof: 'Express API via deploy hook' },
  { name: 'Sentry', cat: 'tools', glyph: 'shield', color: '#f472b6', proof: 'Error tracking, client + server' },
  { name: 'Datadog RUM', cat: 'tools', glyph: 'chart', color: '#a78bfa', proof: 'Real-user monitoring' },
  { name: 'Prometheus', cat: 'tools', glyph: 'chart', color: '#fb923c', proof: 'prom-client metrics endpoint' },
  { name: 'Lighthouse / CWV', cat: 'tools', glyph: 'shield', color: '#fbbf24', proof: '~30 automated perf checks' },
  { name: 'Testing Library', cat: 'tools', glyph: 'shield', color: '#4ade80', proof: 'Component + server suites' },
]

const FILTERS: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'language', label: 'Languages' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'data', label: 'Database' },
  { id: 'tools', label: 'DevOps' },
]

const CAT_LABEL: Record<Category, string> = {
  language: 'Language',
  frontend: 'Frontend',
  backend: 'Backend',
  data: 'Database / Cache',
  tools: 'DevOps / Tools',
}

export function Skills() {
  const [active, setActive] = useState<Category | 'all'>('all')
  const visible = active === 'all' ? SKILLS : SKILLS.filter((s) => s.cat === active)

  const counts = {
    language: SKILLS.filter((s) => s.cat === 'language').length,
    frontend: SKILLS.filter((s) => s.cat === 'frontend').length,
    backend: SKILLS.filter((s) => s.cat === 'backend').length,
    data: SKILLS.filter((s) => s.cat === 'data').length,
    tools: SKILLS.filter((s) => s.cat === 'tools').length,
  }

  return (
    <section id="stack" className="relative z-10 border-t border-border py-20 md:py-28">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))] md:w-[min(72rem,calc(100%-4rem))]">
        <Reveal as="header" className="mb-8 max-w-[46rem]">
          <p className="eyebrow mb-4">
            <span aria-hidden="true">02</span> Technical expertise
          </p>
          <h2 className="text-balance font-heading text-3xl font-bold tracking-tight md:text-4xl">
            The full stack, not just the front of it.
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {SKILLS.length} technologies across {counts.language} languages, {counts.frontend}{' '}
            frontend libraries, {counts.backend} backend tools, {counts.data} data layers and{' '}
            {counts.tools} DevOps services. Each card says where it actually shipped.
          </p>
        </Reveal>

        <Reveal className="mb-6 flex flex-wrap gap-2" delay={80}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="chip"
              data-active={active === f.id}
              aria-pressed={active === f.id}
              onClick={() => setActive(f.id)}
            >
              {f.label}
            </button>
          ))}
        </Reveal>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((s) => (
            <article
              key={s.name}
              className="skill-card"
              style={{ ['--sc' as string]: s.color }}
            >
              <span className="skill-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: GLYPH[s.glyph] }} />
              </span>
              <span className="grid min-w-0 gap-0.5">
                <strong className="truncate text-[0.89rem] font-semibold">{s.name}</strong>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {CAT_LABEL[s.cat]}
                </span>
                <span className="truncate text-[0.76rem] text-muted-foreground">{s.proof}</span>
              </span>
            </article>
          ))}
        </div>

        <Reveal className="mt-10 rounded-2xl border border-border p-6 md:p-7" delay={120}>
          <h3 className="font-heading text-lg font-semibold">Training &amp; certifications</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              ['MERN Stack Development', 'DUCAT, Delhi · 2023'],
              ['Web Development — 6 month program', 'World Class Skill Centre, Delhi · 2023'],
              ['Cybersecurity &amp; AI Basics', 'NIIT Foundation · 2023'],
            ].map(([title, org]) => (
              <li key={title} className="grid gap-1">
                <strong
                  className="text-[0.93rem] font-semibold"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
                <span className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted-foreground">
                  {org}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
