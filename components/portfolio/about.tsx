'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { Code2, GraduationCap, Layers, Sparkles } from 'lucide-react'

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => `${Math.round(v)}${suffix}`)

  if (inView && count.get() === 0 && target > 0) {
    animate(count, target, { duration: 1.8, ease: 'easeOut' })
  }

  return (
    <motion.span ref={ref} className="font-heading text-4xl font-bold text-primary md:text-5xl">
      {rounded}
    </motion.span>
  )
}

const stats = [
  { icon: Code2, target: 3, suffix: '+', label: 'Projects Built' },
  { icon: Layers, target: 5, suffix: '+', label: 'Technologies' },
  { icon: Sparkles, target: 1, suffix: '+', label: 'Year Learning' },
]

function ProfileCard() {
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
    <div className="relative mx-auto w-full max-w-md">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setTransform('')}
        style={{ transform, transition: transform ? 'transform 0.1s ease-out' : 'transform 0.4s ease' }}
        className="glass-strong relative overflow-hidden rounded-3xl p-6 shadow-[0_0_60px_-20px_var(--glow)]"
      >
        {/* Glow accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="glass relative overflow-hidden rounded-2xl">
          <Image
            src="/images/afzal-avatar.png"
            alt="Illustration of Afzal Hussain, MERN stack developer"
            width={640}
            height={640}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="relative mt-6 flex flex-col items-center gap-1.5 pb-2 text-center">
          <h3 className="font-heading text-2xl font-bold">Afzal Hussain</h3>
          <p className="font-mono text-sm text-primary">{'<MERN_Developer />'}</p>
        </div>
      </div>

      {/* Floating education badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-strong absolute -bottom-6 left-1/2 flex w-max -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3.5 shadow-[0_0_40px_-16px_var(--glow)] sm:left-auto sm:-right-6 sm:translate-x-0"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <GraduationCap className="size-5" aria-hidden="true" />
        </span>
        <span className="text-left">
          <span className="block text-xs text-muted-foreground">Education</span>
          <span className="block text-sm font-semibold">BCA from IGNOU</span>
        </span>
      </motion.div>
    </div>
  )
}

export function About() {
  return (
    <section id="about" className="relative z-10 py-16 md:py-24">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 max-w-2xl md:mb-16"
        >
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            About <span className="text-primary">Me</span>
          </h2>
          <div
            aria-hidden="true"
            className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent"
          />
        </motion.div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <ProfileCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 min-w-0 lg:mt-0"
          >
            <p className="text-pretty leading-relaxed text-muted-foreground">
              I&apos;m an aspiring{' '}
              <strong className="font-semibold text-foreground">Full Stack MERN Developer</strong>{' '}
              currently pursuing my BCA from IGNOU. Through professional training and real-world
              projects, I&apos;ve developed strong skills in modern web technologies.
            </p>
            <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
              I&apos;m passionate about creating clean, responsive, and user-focused applications
              while continuously learning and embracing new challenges. My approach combines
              technical proficiency with an eye for detail, ensuring that every project not only
              functions perfectly but provides an exceptional user experience.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass group rounded-2xl p-5 transition-shadow hover:shadow-[0_0_40px_-16px_var(--glow)]"
                >
                  <stat.icon
                    className="mb-3 size-5 text-accent transition-transform group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <CountUp target={stat.target} suffix={stat.suffix} />
                  <p className="mt-1.5 text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
