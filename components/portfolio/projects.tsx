'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, X } from 'lucide-react'
import { GithubIcon } from '@/components/portfolio/brand-icons'
import { Reveal } from '@/components/ui/reveal'
import { TiltCard } from '@/components/ui/tilt-card'

type Tag = 'fullstack' | 'frontend' | 'backend' | 'pwa'

interface Project {
  id: string
  name: string
  type: string
  year: string
  tags: Tag[]
  featured?: boolean
  image?: string
  live?: string
  code: string
  summary: string
  metrics: { v: string; k: string }[]
  stack: string[]
  problem: string
  built: string[]
  architecture: string
  decisions: string[]
  outcome: string
}

const PROJECTS: Project[] = [
  {
    id: 'eshopper',
    name: 'eShopper',
    type: 'Full-stack commerce platform',
    year: '2026',
    tags: ['fullstack', 'backend', 'frontend'],
    featured: true,
    image: '/images/eshopper.png',
    live: 'https://eshopperr.me',
    code: 'https://github.com/theafzalhussain/eshopper',
    summary:
      'A production fashion retail platform covering the whole commercial lifecycle — catalogue discovery, cart and coupon pricing, Razorpay checkout, fulfilment with delivery OTP, customer-initiated returns with automated refunds, and a membership tier system.',
    metrics: [
      { v: '30+', k: 'REST endpoints' },
      { v: '16', k: 'Data models' },
      { v: '~60%', k: 'Fewer DB reads' },
      { v: '90+', k: 'Lighthouse perf' },
    ],
    stack: [
      'React', 'Redux Toolkit', 'Redux Saga', 'Material UI', 'Node.js', 'Express',
      'MongoDB', 'Mongoose', 'Redis', 'BullMQ', 'Socket.IO', 'Razorpay', 'Cloudinary',
      'Firebase Admin', 'JWT', 'Sharp', 'node-cron', 'Recharts', 'Sentry', 'Prometheus',
    ],
    problem:
      'Most portfolio e-commerce demos stop at "add to cart". I wanted the parts that actually break in production: money movement, refunds, stale cache, image weight and admin operations. The brief I set myself was a store a real operator could run.',
    built: [
      '<strong>Storefront and admin in one React app</strong> — category-scoped shop pages, product detail, faceted search with pagination, persistent cart and wishlist.',
      '<strong>Razorpay checkout with server-side signature verification</strong>, so a tampered client payload can never mark an order paid.',
      '<strong>Returns and refunds pipeline</strong> — customer-initiated returns, cron-driven auto-refunds, and idempotent refund jobs that are safe to retry.',
      '<strong>Coupon engine and membership tiers</strong> that price the cart server-side rather than trusting client totals.',
      '<strong>Admin analytics</strong> over MUI data grid and Recharts, with Sentry and Prometheus wired in.',
    ],
    architecture:
      'One Node project produces three runnable processes from a single dependency tree: a React SPA storefront, an Express REST API, and a BullMQ worker. The frontend deploys to Vercel; the API deploys to Render through a GitHub Actions deploy hook. Sixteen Mongoose models back the domain, and a Vercel Edge middleware injects per-route canonical tags and JSON-LD into the SPA shell before crawlers see it.',
    decisions: [
      '<strong>Redis with an in-memory fallback.</strong> Caching cut repeat database reads by roughly 60%, but a managed Redis quota can run out — so the cache layer degrades to process memory instead of taking the store down.',
      '<strong>Server-derived Socket.IO identity.</strong> Room membership is resolved on the server from the session, so no client can join the admin room by claiming to be an admin.',
      '<strong>Four worker queues</strong> for email, refunds, reports and images, so a slow SMTP provider never blocks a checkout response.',
      '<strong>A Sharp-powered WebP image proxy</strong> to keep product imagery off the critical path and inside the performance budget.',
    ],
    outcome:
      'Lighthouse Performance and SEO both land 90+ on the live storefront while serving a full catalogue, and the checkout path survives payment-provider and cache failures without losing data.',
  },
  {
    id: 'moviezone',
    name: 'MovieZone',
    type: 'Installable PWA · performance',
    year: '2026',
    tags: ['pwa', 'frontend', 'backend'],
    image: '/images/moviezone.png',
    live: 'https://moviezone.dev',
    code: 'https://github.com/theafzalhussain/Moviezonne',
    summary:
      'A movie and TV discovery platform on the TMDB API, shipped as an installable PWA with a dedicated Smart TV interface, server-side SEO rendering, web push and an automated performance test suite.',
    metrics: [
      { v: '~30', k: 'Automated checks' },
      { v: '24h', k: 'Stale fallback' },
      { v: '90+', k: 'Lighthouse PWA' },
      { v: '0', k: 'Framework deps' },
    ],
    stack: [
      'JavaScript', 'Express', 'TMDB API', 'Service Worker', 'Web Push', 'node-cache',
      'undici', 'axios-retry', 'Helmet', 'compression', 'PM2', 'Datadog RUM', 'Sentry',
    ],
    problem:
      'Third-party media APIs are slow, rate-limited and occasionally down. A discovery UI that reads TMDB directly from the browser feels broken the moment the upstream hiccups — and a hash-routed SPA is invisible to search crawlers.',
    built: [
      '<strong>A hardened proxy layer</strong> — the browser never talks to TMDB. Every upstream call passes through an in-memory cache with request coalescing, retry with backoff, dual-hostname failover and a 24-hour stale fallback.',
      '<strong>A second server-rendered layer</strong> generating real crawlable URLs for every title, category and A–Z hub on top of the hash-routed client.',
      '<strong>Installable PWA</strong> with a service worker, asset cache invalidation and web push notifications.',
      '<strong>A separate TV module</strong> that takes over D-pad navigation for Smart TV browsers.',
      '<strong>Around thirty standalone Node checks</strong> gating Core Web Vitals, SSR output, sitemap sharding, feed pagination, TV layout parity and upstream resilience.',
    ],
    architecture:
      'Vanilla JavaScript client — no framework, no bundler — served alongside an Express proxy and a dedicated SSR entry point. Sitemaps are sharded and rebuilt on a schedule through GitHub Actions, and the performance suite runs as a gate rather than a manual audit.',
    decisions: [
      '<strong>No framework, on purpose.</strong> The app is content-heavy and render-light; shipping zero framework bytes was the cheapest route to the Core Web Vitals target.',
      '<strong>Request coalescing</strong> so a burst of identical requests collapses into one upstream call instead of hammering a rate-limited API.',
      '<strong>Stale-while-broken</strong> — serving 24-hour-old data beats serving an error page when the provider is unreachable.',
      '<strong>Performance as a test, not a vibe.</strong> If a change regresses a Core Web Vital or the SSR output, a check fails.',
    ],
    outcome:
      'Lighthouse PWA and SEO audits both score 90+, the app stays usable when TMDB is throttled, and every title has a crawlable server-rendered URL.',
  },
  {
    id: 'chronicle',
    name: 'The Chronicle',
    type: 'Bilingual news application',
    year: '2025',
    tags: ['frontend'],
    image: '/images/news.png',
    live: 'https://mynews-web.vercel.app',
    code: 'https://github.com/theafzalhussain/News-Web',
    summary:
      'English and Hindi news discovery across eight categories, aggregating the GNews API and RSS feeds into a single normalised, deduplicated timeline with search and infinite scrolling.',
    metrics: [
      { v: '8', k: 'Categories' },
      { v: '2', k: 'Languages' },
      { v: '~50%', k: 'Fewer API calls' },
      { v: '94%', k: 'TypeScript' },
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'SWR', 'GNews API', 'RSS'],
    problem:
      'News APIs have tight free-tier quotas, inconsistent payload shapes and duplicate stories across sources. Naive fetching burns the quota by lunchtime and shows the same headline four times.',
    built: [
      '<strong>A normalisation layer</strong> mapping GNews items and raw RSS entries into one internal article shape.',
      '<strong>Deduplication</strong> across sources, so the same story from two publishers collapses into one card.',
      '<strong>Caching with stale-data fallback</strong> that cut outbound API calls by roughly 50% and keeps the feed populated when the quota is exhausted.',
      '<strong>Bilingual routing</strong> for English and Hindi across eight categories, with search and infinite scrolling.',
    ],
    architecture:
      'Next.js App Router with TypeScript, SWR for client-side revalidation, and server routes that fan out to GNews and RSS in parallel before normalising, deduplicating and caching the merged result.',
    decisions: [
      '<strong>Normalise at the boundary.</strong> Components never see a provider-specific field, so adding a third source is a mapper, not a refactor.',
      '<strong>SWR over manual state.</strong> Revalidation, focus refetch and cache sharing came free and removed a class of loading bugs.',
      '<strong>Cache before quota, not after.</strong> The fallback path is the default read path, so quota exhaustion degrades quality rather than breaking the page.',
    ],
    outcome:
      'A bilingual feed that stays fast and populated on a free API tier, with roughly half the outbound requests of the naive implementation.',
  },
  {
    id: 'explorer',
    name: 'World Explorer',
    type: 'Typed full-stack data explorer',
    year: '2025',
    tags: ['fullstack', 'frontend'],
    image: '/images/restcountry.png',
    live: 'https://myrest-country.vercel.app',
    code: 'https://github.com/theafzalhussain/New-RestCountry',
    summary:
      'An explorer for 250 countries with debounced search, region filters, sorting, border navigation and detailed country views over a typed Express API.',
    metrics: [
      { v: '250', k: 'Countries' },
      { v: '300ms', k: 'Search debounce' },
      { v: '~70%', k: 'Fewer requests' },
      { v: '96%', k: 'TypeScript' },
    ],
    stack: ['React', 'TypeScript', 'Express', 'Tailwind CSS', 'TanStack Query'],
    problem:
      'Search-as-you-type over a large dataset is where junior implementations fall apart — a request per keystroke, race conditions that render stale results, and no caching between navigations.',
    built: [
      '<strong>300ms debounced search</strong>, so a typed query costs one request instead of twelve.',
      '<strong>TanStack Query caching</strong> that cut redundant network requests by roughly 70% across filter and navigation changes.',
      '<strong>Region filters, sorting and border navigation</strong> — clicking a neighbouring country jumps straight into its detail view.',
      '<strong>A typed Express API with request validation</strong>, so malformed query parameters fail at the boundary with a clear error.',
    ],
    architecture:
      'React and TypeScript on the client, TanStack Query as the cache and request layer, and a typed Express API that validates and shapes upstream country data before it reaches the UI.',
    decisions: [
      '<strong>Query cache as the source of truth</strong> rather than local component state — navigating back is instant and a stale result cannot win a race.',
      '<strong>Validate at the API boundary</strong> so the client never has to defend against malformed upstream payloads.',
      '<strong>Debounce tuned to 300ms</strong> — fast enough to feel live, slow enough to collapse a typed word into one request.',
    ],
    outcome:
      'Instant-feeling search and navigation across 250 records with roughly 70% fewer network requests than an uncached implementation.',
  },
  {
    id: 'portfolio',
    name: 'This portfolio',
    type: 'Next.js site with contact pipeline',
    year: '2026',
    tags: ['frontend', 'fullstack'],
    image: '/images/afzalavatar.png',
    live: 'https://www.afzalhussain.tech',
    code: 'https://github.com/theafzalhussain/Portfolio',
    summary:
      'The site you are reading: a Next.js App Router build with a WebGL hero, and a real server-side contact pipeline rather than a decorative form.',
    metrics: [
      { v: '20+', k: 'Components' },
      { v: '95+', k: 'Accessibility' },
      { v: '5/min', k: 'Rate limit' },
      { v: '2', k: 'Emails per send' },
    ],
    stack: [
      'Next.js', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Three.js', 'React Three Fiber',
      'Framer Motion', 'MongoDB', 'Mongoose', 'Nodemailer',
    ],
    problem:
      'A portfolio contact form that opens a mail client is a dead end — and an unprotected API route is a spam magnet. I wanted a submission path that persists the message even if email delivery fails.',
    built: [
      '<strong>A real route handler</strong> that validates the payload server-side and returns specific field errors.',
      '<strong>A hidden honeypot field plus per-IP sliding-window rate limiting</strong> — a filled honeypot returns 400, excess traffic returns 429.',
      '<strong>MongoDB persistence through Mongoose</strong>, capturing message, IP, user agent and timestamps.',
      '<strong>Two transactional emails</strong> fired concurrently — an owner notification with the sender set as Reply-To, and a confirmation to the sender, with every interpolated value HTML-escaped.',
      '<strong>A WebGL hero</strong> in React Three Fiber with skill labels orbiting the core, projected from 3D to DOM each frame.',
    ],
    architecture:
      'Next.js App Router, a cached Mongoose connection reused across invocations, and a POST handler that persists before it sends. Email delivery is deliberately non-fatal: a rejected send is logged but the request still succeeds, because the message is already stored. A database failure, by contrast, returns a 500 so a message is never silently lost.',
    decisions: [
      '<strong>Persist first, notify second.</strong> Storage is the source of truth; email is a notification channel that is allowed to fail.',
      '<strong>Escape everything.</strong> Every user-supplied value is HTML-escaped before it enters an email template.',
      '<strong>Honeypot plus rate limit, not CAPTCHA.</strong> Two cheap deterrents beat a friction-heavy widget on a hiring page.',
      '<strong>The 3D scene pauses off-screen</strong> and freezes under reduced motion, so the decoration never costs the reader battery.',
    ],
    outcome:
      '95+ Lighthouse Accessibility with a mobile-first layout, and a contact path where a submission survives an email outage.',
  },
]

const FILTERS: { id: Tag | 'all'; label: string }[] = [
  { id: 'all', label: 'All work' },
  { id: 'fullstack', label: 'Full-stack' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'pwa', label: 'PWA' },
]

function Metrics({ items, className }: { items: { v: string; k: string }[]; className?: string }) {
  return (
    <div className={className}>
      {items.map((m) => (
        <div key={m.k}>
          <b className="block font-heading text-xl leading-tight text-primary md:text-2xl">
            {m.v}
          </b>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.11em] text-muted-foreground">
            {m.k}
          </span>
        </div>
      ))}
    </div>
  )
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li
          key={t}
          className="rounded-md border border-border bg-background/60 px-2 py-0.5 font-mono text-[0.62rem] text-muted-foreground"
        >
          {t}
        </li>
      ))}
    </ul>
  )
}

function Shot({ project, priority }: { project: Project; priority?: boolean }) {
  return (
    <div className="proj-shot relative aspect-[16/10] overflow-hidden border-b border-border bg-secondary md:aspect-auto md:h-full md:min-h-[430px]">
      <span className="glass absolute top-3 left-3 z-[2] inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.13em] text-accent">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
        {project.live ? 'Live' : 'Source'}
      </span>

      {project.image ? (
        <Image
          src={project.image}
          alt={`Screenshot of ${project.name}`}
          fill
          sizes="(min-width: 880px) 50vw, 100vw"
          className="object-cover object-top"
          priority={priority}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-secondary to-card">
          <span className="font-heading text-6xl text-primary/30">{project.name.charAt(0)}</span>
        </div>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, color-mix(in oklch, var(--card) 92%, transparent) 0%, transparent 45%)',
        }}
      />
    </div>
  )
}

function CaseStudy({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[150]">
      <button
        type="button"
        aria-label="Close case study"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        className="modal-card absolute bottom-0 left-1/2 max-h-[92svh] w-[min(62rem,100%)] -translate-x-1/2 overflow-y-auto rounded-t-3xl border border-border bg-background md:top-1/2 md:bottom-auto md:max-h-[88svh] md:-translate-y-1/2 md:rounded-3xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close case study"
          className="glass sticky top-3 float-right mt-3 mr-3 z-[3] grid size-9 place-items-center rounded-full transition-colors hover:text-primary"
        >
          <X className="size-4" />
        </button>

        <div className="px-5 pt-6 md:px-9 md:pt-8">
          <p className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            <b className="font-medium text-primary">Case study</b>
            <span aria-hidden="true">·</span>
            <span>{project.type}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
          </p>
          <h3
            id="case-title"
            className="font-heading text-2xl font-bold tracking-tight md:text-4xl"
          >
            {project.name}
          </h3>
          <p className="mt-3 max-w-[44rem] leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
        </div>

        {project.image && (
          <div className="relative mt-6 aspect-[16/9] border-y border-border bg-secondary">
            <Image
              src={project.image}
              alt={`Screenshot of ${project.name}`}
              fill
              sizes="62rem"
              className="object-cover object-top"
            />
          </div>
        )}

        <div className="grid gap-7 px-5 py-7 md:px-9 md:py-9">
          <Metrics
            items={project.metrics}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/40 sm:grid-cols-4 [&>div]:bg-card [&>div]:p-4"
          />

          <div>
            <h4 className="mb-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.15em] text-primary">
              The problem
            </h4>
            <p className="max-w-[46rem] leading-relaxed text-muted-foreground">
              {project.problem}
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.15em] text-primary">
              What I built
            </h4>
            <ul className="grid max-w-[46rem] gap-2 pl-5 leading-relaxed text-muted-foreground [&_li]:list-disc [&_strong]:text-foreground">
              {project.built.map((b, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
              ))}
            </ul>
          </div>

          <div className="grid gap-7 md:grid-cols-2 md:gap-8">
            <div>
              <h4 className="mb-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.15em] text-primary">
                Architecture
              </h4>
              <p className="leading-relaxed text-muted-foreground">{project.architecture}</p>
            </div>
            <div>
              <h4 className="mb-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.15em] text-primary">
                Engineering decisions
              </h4>
              <ul className="grid gap-2 pl-5 leading-relaxed text-muted-foreground [&_li]:list-disc [&_strong]:text-foreground">
                {project.decisions.map((d, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: d }} />
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.15em] text-primary">
              Outcome
            </h4>
            <p className="max-w-[46rem] leading-relaxed text-muted-foreground">
              {project.outcome}
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.15em] text-primary">
              Full stack
            </h4>
            <Tags items={project.stack} />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Open live site
                <ArrowUpRight className="size-4" />
              </a>
            )}
            <a
              href={project.code}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-all hover:border-primary hover:text-primary"
            >
              <GithubIcon className="size-4" />
              View source
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Card({ project, onOpen }: { project: Project; onOpen: (id: string) => void }) {
  const body = (
    <>
      <Shot project={project} priority={project.featured} />
      <div className="flex flex-col justify-center p-5 md:p-7">
        <p className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          {project.featured && (
            <>
              <b className="font-medium text-primary">Featured</b>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{project.type}</span>
          <span aria-hidden="true">·</span>
          <span>{project.year}</span>
        </p>

        <h3 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
          {project.name}
        </h3>
        <p className="mt-2.5 leading-relaxed text-muted-foreground">{project.summary}</p>

        <Metrics
          items={project.metrics}
          className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border/60 pt-4 sm:grid-cols-4"
        />

        <Tags items={project.stack.slice(0, project.featured ? 10 : 6)} />

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onOpen(project.id)}
            className="group/btn inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[0.82rem] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Read case study
            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[0.82rem] font-semibold transition-all hover:border-primary hover:text-primary"
            >
              Live site
            </a>
          )}
          <a
            href={project.code}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[0.82rem] font-semibold transition-all hover:border-primary hover:text-primary"
          >
            Source
          </a>
        </div>
      </div>
    </>
  )

  return (
    <article
      className={`group/proj overflow-hidden rounded-3xl border border-border bg-card/85 backdrop-blur-md transition-colors hover:border-primary/45 ${
        project.featured ? 'lg:col-span-2' : ''
      }`}
    >
      {project.featured ? (
        <div className="grid lg:grid-cols-[1.08fr_1fr]">{body}</div>
      ) : (
        <TiltCard max={5}>{body}</TiltCard>
      )}
    </article>
  )
}

export function Projects() {
  const [active, setActive] = useState<Tag | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const visible = active === 'all' ? PROJECTS : PROJECTS.filter((p) => p.tags.includes(active))
  const open = PROJECTS.find((p) => p.id === openId) ?? null

  const close = useCallback(() => setOpenId(null), [])

  return (
    <section id="work" className="relative z-10 border-t border-border py-20 md:py-28">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))] md:w-[min(72rem,calc(100%-4rem))]">
        <Reveal as="header" className="mb-8 max-w-[46rem]">
          <p className="eyebrow mb-4">
            <span aria-hidden="true">01</span> Selected work
          </p>
          <h2 className="text-balance font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Five products. Every one of them clickable.
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Not tutorial clones. Each runs with real APIs, real failure handling and measured
            performance. Open a case study to see the architecture and the trade-offs behind it.
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

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          {visible.map((p) => (
            <Card key={p.id} project={p} onOpen={setOpenId} />
          ))}
        </div>

        <p className="mt-8 font-mono text-xs tracking-wide text-muted-foreground">
          More on{' '}
          <a
            href="https://github.com/theafzalhussain"
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary underline underline-offset-4"
          >
            github.com/theafzalhussain
          </a>
        </p>
      </div>

      {open && <CaseStudy project={open} onClose={close} />}
    </section>
  )
}
