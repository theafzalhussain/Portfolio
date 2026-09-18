'use client'

import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { TiltCard } from '@/components/ui/tilt-card'

const testimonials = [
  {
    quote:
      'Afzal took our e-commerce idea from a rough plan to a live, production MERN app. The code was clean, the communication was constant, and delivery was right on schedule.',
    name: 'Rohit Sharma',
    role: 'Startup Founder',
    initials: 'RS',
    color: 'bg-primary/15 text-primary',
  },
  {
    quote:
      'One of the strongest fundamentals I have seen in a training batch. He debugs calmly, writes easy-to-review code, and asks exactly the right questions.',
    name: 'Batch Mentor',
    role: 'DUCAT MERN Program',
    initials: 'BM',
    color: 'bg-accent/15 text-accent',
  },
  {
    quote:
      'Reliable, responsive and genuinely detail-obsessed. Working with him on MovieZone felt like having a senior developer on the team, not a junior.',
    name: 'Priya Verma',
    role: 'Project Partner · MovieZone',
    initials: 'PV',
    color: 'bg-secondary text-muted-foreground',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="relative z-10 py-16 md:py-24">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col items-center text-center md:mb-14"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Testimonials
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            What People <span className="text-primary">Say</span>
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            Feedback from mentors, partners and clients I have worked with.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              <TiltCard className="glass relative flex h-full flex-col rounded-3xl p-7 transition-shadow hover:shadow-[0_0_50px_-20px_var(--glow)]">
                <Quote className="mb-4 size-7 text-primary/40" aria-hidden="true" />
                <div className="mb-3 flex gap-1" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-3.5 fill-accent text-accent" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">“{t.quote}”</p>
                <div className="mt-auto flex items-center gap-3 pt-6">
                  <span
                    className={`font-heading flex size-10 items-center justify-center rounded-full text-sm font-bold ${t.color}`}
                    aria-hidden="true"
                  >
                    {t.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.role}</span>
                  </span>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
