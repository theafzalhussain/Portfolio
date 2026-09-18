'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Mail } from 'lucide-react'

const faqs = [
  {
    q: 'How can I hire you for a project?',
    a: 'The fastest way is the contact form right below, or my email / WhatsApp. Tell me about your idea, timeline and budget — I usually reply within 24 hours with the next steps.',
  },
  {
    q: 'What is your core stack?',
    a: 'MERN — MongoDB, Express, React and Node.js — plus Next.js, TypeScript, Tailwind CSS and Framer Motion. I also work with REST APIs from TMDB, GNews, OpenWeather and similar providers.',
  },
  {
    q: 'Can you work with an existing codebase?',
    a: 'Yes. I am comfortable onboarding into existing projects — reading the code, writing tests where it matters, and shipping incremental improvements without breaking what already works.',
  },
  {
    q: 'What does your process look like?',
    a: 'A typical engagement: discovery & scoping → architecture and API design → iterative build with regular demos → deployment, monitoring and a handover with documentation. Most small-to-medium projects take 2–6 weeks.',
  },
  {
    q: 'Are you open to internships or remote work?',
    a: 'Absolutely — I am based in India and fully set up for remote collaboration. I am currently looking for full-time MERN roles and select freelance projects.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative z-10 py-16 md:py-24">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          {/* Left: heading */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              FAQ
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              Everything you might want to know before we start working together. Something else
              on your mind?
            </p>
            <a
              href="#contact"
              className="group mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary"
            >
              <Mail className="size-4 transition-transform group-hover:-translate-y-0.5" />
              Ask me directly
            </a>
          </motion.div>

          {/* Right: accordion */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-3"
          >
            {faqs.map((faq, i) => {
              const isOpen = open === i
              return (
                <div
                  key={faq.q}
                  className={`glass overflow-hidden rounded-2xl transition-colors ${
                    isOpen ? 'border-primary/40' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className={`text-sm font-semibold ${isOpen ? 'text-primary' : ''}`}>
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
