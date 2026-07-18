'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, BadgeCheck, ExternalLink, GraduationCap, Medal } from 'lucide-react'

const certifications = [
  {
    icon: GraduationCap,
    title: 'MERN Stack Development',
    issuer: 'DUCAT · 2023',
    tag: 'Full Stack',
    href: '#',
  },
  {
    icon: Award,
    title: 'Web Development Course (6 Months)',
    issuer: 'World Class Skill Centre · 2023',
    tag: 'Web Dev',
    href: '#',
  },
  {
    icon: Medal,
    title: 'Cybersecurity AI Basic',
    issuer: 'NIIT Foundation',
    tag: 'AI / Security',
    href: '#',
  },
]

function CertCard({
  cert,
  index,
}: {
  cert: (typeof certifications)[number]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTransform(`perspective(900px) rotateY(${px * 8}deg) rotateX(${py * -8}deg) scale(1.02)`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setTransform('')}
        style={{ transform, transition: transform ? 'transform 0.1s ease-out' : 'transform 0.4s ease' }}
        className="glass group relative flex h-full flex-col items-center overflow-hidden rounded-3xl p-8 text-center shadow-[0_0_40px_-24px_var(--glow)]"
      >
        {/* Top glow line */}
        <div
          aria-hidden="true"
          className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <span className="relative mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
          <cert.icon className="size-7" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl border border-primary/20"
          />
        </span>

        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
          <BadgeCheck className="size-3.5" aria-hidden="true" />
          {cert.tag}
        </span>

        <h3 className="font-heading text-xl font-bold">{cert.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{cert.issuer}</p>

        <div className="mt-auto w-full pt-7">
          <a
            href={cert.href}
            className="glass inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
          >
            View Certificate
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

export function Certifications() {
  return (
    <section id="certifications" className="relative z-10 py-24">
      <div className="mx-auto w-[min(72rem,calc(100%-2.5rem))]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 flex flex-col items-center text-center"
        >
          <p className="mb-3 font-mono text-sm text-primary">{'// credentials'}</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Certifications & <span className="text-primary">Achievements</span>
          </h2>
          <div
            aria-hidden="true"
            className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent"
          />
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {certifications.map((cert, i) => (
            <CertCard key={cert.title} cert={cert} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
