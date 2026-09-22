'use client'

import Image from 'next/image'
import { Download, GraduationCap } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { TiltCard } from '@/components/ui/tilt-card'

const FACTS = [
  ['Looking for', 'Frontend / Web Developer internship'],
  ['Location', 'Delhi NCR onsite or fully remote'],
  ['Availability', 'Immediate'],
  ['Languages', 'English, Hindi'],
]

export function About() {
  return (
    <section id="about" className="relative z-10 border-t border-border py-20 md:py-28">
      <div className="mx-auto grid w-[min(72rem,calc(100%-2rem))] gap-12 md:w-[min(72rem,calc(100%-4rem))] lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <Reveal className="relative max-w-[26rem]">
          <TiltCard max={7}>
            <div className="glass-strong rounded-3xl p-2.5 shadow-[0_0_80px_-28px_var(--glow)]">
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <Image
                  src="/images/afzalavatar.png"
                  alt="Portrait illustration of Afzal Hussain"
                  fill
                  sizes="(min-width: 1024px) 26rem, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-baseline justify-between gap-2 px-2 pt-3.5 pb-1">
                <strong className="font-heading text-xl font-semibold">Afzal Hussain</strong>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                  New Delhi, India
                </span>
              </div>
            </div>
          </TiltCard>

          {/* Education badge — matches the resume: MCA at IGNOU, BCA at MDU Rohtak. */}
          <div className="glass-strong ml-auto -mt-5 grid w-max max-w-full gap-0.5 rounded-2xl px-4 py-3">
            <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
              <GraduationCap className="size-3.5 text-primary" aria-hidden="true" />
              Currently
            </span>
            <strong className="text-[0.95rem] font-semibold">MCA · IGNOU</strong>
            <span className="text-[0.78rem] text-muted-foreground">
              BCA · First Division, MDU Rohtak
            </span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <p className="eyebrow mb-4">
            <span aria-hidden="true">04</span> About
          </p>
          <h2 className="text-balance font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Self-taught discipline, production habits.
          </h2>

          <div className="mt-5 grid max-w-[40rem] gap-4 leading-relaxed text-muted-foreground">
            <p>
              I&apos;m a frontend developer based in New Delhi. I learn by shipping things that
              have to stay up — which is why my projects have cache layers, retry logic, worker
              queues and admin screens rather than just a pretty landing page.
            </p>
            <p>
              My strongest work is <strong className="text-foreground">eShopper</strong>: a React
              storefront over an Express API with Razorpay signature verification, 16 Mongoose
              models, Redis caching that degrades gracefully, four BullMQ queues and live order
              updates over Socket.IO. I designed the architecture, wrote the code and run the
              deploys.
            </p>
            <p>
              Outside JavaScript I built <strong className="text-foreground">Saarthi</strong> in
              Python and Kotlin — a Hinglish-first, privacy-first assistant for low-resource
              hardware. I use AI tooling the way working teams do: as acceleration, not
              authorship. Ask me about any file in any repo and I&apos;ll walk you through the
              decision behind it.
            </p>
          </div>

          <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border/40 sm:grid-cols-2">
            {FACTS.map(([k, v]) => (
              <div key={k} className="grid gap-0.5 bg-card/70 p-4 backdrop-blur-sm">
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {k}
                </dt>
                <dd className="text-[0.9rem] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <a
            href="/resume.pdf"
            download
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            <Download className="size-4" />
            Download resume
          </a>
        </Reveal>
      </div>
    </section>
  )
}
