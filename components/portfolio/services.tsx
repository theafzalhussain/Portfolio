'use client'

import { motion } from 'framer-motion'
import { Code2, Gauge, Palette, Server } from 'lucide-react'
import { TiltCard } from '@/components/ui/tilt-card'

const services = [
  {
    icon: Code2,
    title: 'Web Application Development',
    description:
      'End-to-end MERN applications — from database schema to a deployed, production-grade web app.',
    points: ['Full-stack MERN architecture', 'REST API design', 'Auth, roles & security'],
  },
  {
    icon: Server,
    title: 'Backend & API Engineering',
    description:
      'Scalable, secure APIs with Node.js and Express, wired into MongoDB Atlas with clean, documented endpoints.',
    points: ['Node.js & Express', 'MongoDB data modeling', 'Validation & error handling'],
  },
  {
    icon: Palette,
    title: 'Responsive UI Development',
    description:
      'Pixel-perfect, mobile-first interfaces with modern CSS and smooth, purposeful motion.',
    points: ['Tailwind CSS', 'Mobile-first layouts', 'Framer Motion micro-interactions'],
  },
  {
    icon: Gauge,
    title: 'Performance & SEO',
    description:
      'Fast, accessible, search-friendly builds engineered to score well on Core Web Vitals.',
    points: ['Image & code optimization', 'Lighthouse tuning', 'Semantic, accessible markup'],
  },
]

export function Services() {
  return (
    <section id="services" className="relative z-10 py-16 md:py-24">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 max-w-2xl md:mb-14"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Services
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            What I <span className="text-primary">Do</span>
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Focused, product-minded engineering services — everything you need to take an idea
            from Figma to production.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <TiltCard className="glass group relative h-full overflow-hidden rounded-3xl p-6 transition-shadow hover:shadow-[0_0_50px_-18px_var(--glow)]">
                {/* Ghost index number */}
                <span
                  aria-hidden="true"
                  className="font-heading pointer-events-none absolute -top-3 right-4 text-7xl font-bold text-primary/8"
                >
                  0{i + 1}
                </span>

                <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <service.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="text-base font-semibold leading-snug">{service.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <ul className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-4">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
