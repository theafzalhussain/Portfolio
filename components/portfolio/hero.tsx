'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/portfolio/brand-icons'

const specializations = [
  'Building Scalable Web Apps',
  'MERN Stack Specialist',
  'Open Source Enthusiast',
  'API & Database Architect',
]

function TypingLine() {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = specializations[index]
    const delay = deleting ? 35 : text === current ? 1800 : 70

    const timer = setTimeout(() => {
      if (!deleting && text === current) {
        setDeleting(true)
      } else if (deleting && text === '') {
        setDeleting(false)
        setIndex((i) => (i + 1) % specializations.length)
      } else {
        setText(current.slice(0, text.length + (deleting ? -1 : 1)))
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [text, deleting, index])

  return (
    <p className="font-mono text-base text-primary md:text-lg" aria-live="polite">
      {'> '}
      {text}
      <span className="animate-caret ml-0.5 inline-block h-5 w-2.5 translate-y-1 bg-primary" aria-hidden="true" />
    </p>
  )
}

const orbitTech = [
  { label: 'MongoDB', color: 'text-emerald-400', ring: 0, delay: '0s' },
  { label: 'Express', color: 'text-foreground', ring: 0, delay: '-8s' },
  { label: 'React', color: 'text-cyan-400', ring: 1, delay: '0s' },
  { label: 'Node.js', color: 'text-emerald-400', ring: 1, delay: '-7.3s' },
  { label: 'JavaScript', color: 'text-yellow-400', ring: 1, delay: '-14.6s' },
  { label: 'HTML & CSS', color: 'text-orange-400', ring: 2, delay: '0s' },
  { label: 'Tailwind', color: 'text-cyan-300', ring: 2, delay: '-13s' },
]

function TechOrb() {
  const radii = ['5rem', '7.5rem', '10rem']
  const durations = ['16s', '22s', '30s']

  return (
    <div className="animate-float-y relative mx-auto flex size-[18rem] items-center justify-center sm:size-[22rem] lg:size-[28rem]">
      {/* Orbit rings */}
      {radii.map((r, i) => (
        <div
          key={r}
          aria-hidden="true"
          className="absolute rounded-full border border-primary/15"
          style={{ width: `calc(${r} * 2)`, height: `calc(${r} * 2)` }}
        />
      ))}

      {/* Core */}
      <div className="glass-strong relative z-10 flex size-20 flex-col items-center justify-center rounded-full shadow-[0_0_60px_-10px_var(--glow)] sm:size-28 lg:size-36">
        <span className="font-heading text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
          AH
        </span>
        <span className="font-mono text-[9px] text-muted-foreground sm:text-[10px] lg:text-xs">MERN Stack</span>
      </div>

      {/* Orbiting badges */}
      {orbitTech.map((tech) => (
        <div
          key={tech.label}
          className={`absolute ${tech.ring === 1 ? 'animate-orbit-reverse' : 'animate-orbit'}`}
          style={
            {
              '--orbit-radius': radii[tech.ring],
              '--orbit-duration': durations[tech.ring],
              animationDelay: tech.delay,
            } as React.CSSProperties
          }
        >
          <span
            className={`glass block rounded-full px-3 py-1.5 font-mono text-xs font-medium whitespace-nowrap ${tech.color} shadow-lg`}
          >
            {tech.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative z-10 flex min-h-screen items-center pt-24 pb-16 sm:pt-28">
      <div className="mx-auto grid w-[min(72rem,calc(100%-2rem))] items-center gap-10 sm:gap-14 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass animate-pulse-ring inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-accent"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Available for Work
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            Hi, I&apos;m <span className="text-primary">Afzal Hussain</span>
            <br />
            Web Developer
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <TypingLine />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="max-w-xl text-pretty leading-relaxed text-muted-foreground"
          >
            I craft high-performance, production-grade web applications with MongoDB, Express,
            React, and Node.js — turning complex problems into elegant, scalable products.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center gap-4"
          >
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
            >
              View My Work
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/theafzalhussain"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="glass flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-primary"
              >
                <GithubIcon className="size-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/afzalhussain"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="glass flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-primary"
              >
                <LinkedinIcon className="size-5" />
              </a>
              <a
                href="#contact"
                aria-label="Contact me"
                className="glass flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 flex justify-center lg:mt-0"
        >
          <TechOrb />
        </motion.div>
      </div>
    </section>
  )
}
