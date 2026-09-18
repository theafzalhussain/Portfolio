'use client'

import { motion } from 'framer-motion'
import { Briefcase, Code2, GraduationCap, Rocket, ShieldCheck } from 'lucide-react'

const timeline = [
  {
    icon: GraduationCap,
    period: '2023',
    title: 'Web Development Foundation',
    org: 'World Class Skill Centre',
    description:
      'Six-month intensive program — HTML5, CSS3, JavaScript, Bootstrap 5 and project-based learning with a strong focus on responsive design.',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5'],
  },
  {
    icon: Code2,
    period: '2023',
    title: 'MERN Stack Development',
    org: 'DUCAT',
    description:
      'Full-stack training across MongoDB, Express, React and Node.js — data modeling, REST APIs, authentication and first full-stack applications deployed to production.',
    tags: ['MERN', 'REST APIs', 'MongoDB Atlas'],
  },
  {
    icon: Briefcase,
    period: '2024',
    title: 'Front-End Web Development',
    org: 'Mind Luster',
    description:
      'Advanced front-end engineering — React component architecture, state management, responsive UI systems and polished, animated interfaces.',
    tags: ['React', 'UI Engineering', 'Responsive Design'],
  },
  {
    icon: ShieldCheck,
    period: '2025',
    title: 'Cybersecurity & AI Foundations',
    org: 'NIIT Foundation',
    description:
      'Security fundamentals for modern web applications — common attack vectors, safe API design, and an introduction to applied AI workflows.',
    tags: ['Security', 'API Design', 'AI Basics'],
  },
  {
    icon: Rocket,
    period: '2026 — Present',
    title: 'Independent MERN Development',
    org: 'Self-driven · Open to opportunities',
    description:
      'Shipping production MERN and front-end applications end-to-end (eShopperr, MovieZone and more), with an AI-assisted workflow using GitHub Copilot. Currently open to full-time roles and freelance projects.',
    tags: ['MERN', 'Next.js', 'GitHub Copilot'],
  },
]

export function Experience() {
  return (
    <section id="experience" className="relative z-10 py-16 md:py-24">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col items-center text-center md:mb-16"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Experience
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            My <span className="text-primary">Journey</span>
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            A timeline of the training, certifications and shipped work that shaped my engineering
            practice.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-4xl">
          {/* Center line */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-primary/60 via-border to-transparent md:left-1/2"
          />

          <ol className="flex flex-col gap-10">
            {timeline.map((item, i) => {
              const left = i % 2 === 0
              return (
                <li key={item.title} className="relative md:grid md:grid-cols-2 md:gap-12">
                  {/* Node dot */}
                  <span
                    aria-hidden="true"
                    className="absolute top-7 left-4 z-10 flex size-4 -translate-x-1/2 items-center justify-center md:left-1/2"
                  >
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/40" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
                  </span>

                  {/* Card — alternates sides on desktop */}
                  <motion.div
                    initial={{ opacity: 0, x: left ? -32 : 32, y: 12 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.55, delay: 0.05 }}
                    className={`pl-12 md:pl-0 ${
                      left ? 'md:col-start-1 md:pr-14' : 'md:col-start-2 md:pl-14'
                    }`}
                  >
                    <div className="glass group rounded-3xl p-6 transition-shadow hover:shadow-[0_0_50px_-20px_var(--glow)]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <item.icon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="font-mono text-xs font-semibold tracking-widest text-accent">
                          {item.period}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-0.5 text-sm font-medium text-primary">{item.org}</p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[11px] text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
