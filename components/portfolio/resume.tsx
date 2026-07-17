'use client'

import { motion } from 'framer-motion'
import { Braces, Download, FileText, GraduationCap, Rocket } from 'lucide-react'

const highlights = [
  {
    icon: GraduationCap,
    title: 'Education',
    desc: 'BCA from IGNOU — building a strong computer science foundation.',
  },
  {
    icon: Braces,
    title: 'Technical Skills',
    desc: 'MERN stack — MongoDB, Express, React, Node.js, plus modern tooling.',
  },
  {
    icon: Rocket,
    title: 'Projects',
    desc: 'Real-world applications built with clean, production-grade code.',
  },
]

export function Resume() {
  return (
    <section id="resume" className="relative z-10 py-24">
      <div className="mx-auto w-[min(72rem,calc(100%-2.5rem))]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 flex flex-col items-center text-center"
        >
          <p className="mb-3 font-mono text-sm text-primary">{'// resume'}</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            My <span className="text-primary">Resume</span>
          </h2>
          <div
            aria-hidden="true"
            className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-strong relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-8 text-center shadow-[0_0_80px_-32px_var(--glow)] md:p-14"
        >
          {/* Ambient glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/2 size-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-16 size-56 rounded-full bg-accent/10 blur-3xl"
          />

          <span className="glass relative mx-auto mb-7 flex size-16 items-center justify-center rounded-2xl text-primary">
            <FileText className="size-7" aria-hidden="true" />
          </span>

          <h3 className="relative text-balance font-heading text-2xl font-bold md:text-3xl">
            Ready to create an impact?
          </h3>
          <p className="relative mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Check out my resume for a comprehensive overview of my technical skills, educational
            background, and the projects I&apos;ve built. Let&apos;s build something amazing
            together.
          </p>

          <div className="relative mt-9 grid gap-4 text-left sm:grid-cols-3">
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }}
                className="glass rounded-2xl p-5"
              >
                <item.icon className="mb-3 size-5 text-accent" aria-hidden="true" />
                <h4 className="text-sm font-semibold">{item.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="relative mt-10 flex flex-col items-center gap-3">
            <a
              href="/resume.pdf"
              download="Afzal-Hussain-Resume.pdf"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_40px_-8px_var(--glow)] transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
              Download Full Resume
            </a>
            <p className="font-mono text-xs text-muted-foreground">
              {'// add resume.pdf to the public directory'}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
