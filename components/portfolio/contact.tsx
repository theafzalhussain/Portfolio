'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Check, Copy, Send } from 'lucide-react'
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
} from '@/components/portfolio/brand-icons'
import { Reveal } from '@/components/ui/reveal'

const EMAIL = 'theafzalhussain786@gmail.com'
const MAX_MESSAGE = 1000

/**
 * Shared field styling.
 *
 * `text-base` on mobile is not cosmetic: iOS Safari auto-zooms the viewport
 * whenever a focused input's font-size is below 16px, and the previous
 * 0.92rem (≈14.7px) triggered it on every tap — the page jumped in, and the
 * user had to pinch back out to see the rest of the form.
 */
const FIELD =
  'w-full rounded-xl border border-border bg-background px-3.5 py-3 text-base outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-primary focus:ring-[3px] focus:ring-primary/25 sm:py-2.5 sm:text-[0.92rem]'

const CHANNELS = [
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
  { label: 'Phone / WhatsApp', value: '+91 84478 59784', href: 'https://wa.me/918447859784' },
  {
    label: 'GitHub',
    value: 'github.com/theafzalhussain',
    href: 'https://github.com/theafzalhussain',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/theafzalhussain',
    href: 'https://www.linkedin.com/in/theafzalhussain/',
  },
]

const SOCIALS = [
  { Icon: GithubIcon, href: 'https://github.com/theafzalhussain', label: 'GitHub' },
  {
    Icon: LinkedinIcon,
    href: 'https://www.linkedin.com/in/theafzalhussain/',
    label: 'LinkedIn',
  },
  { Icon: WhatsappIcon, href: 'https://wa.me/918447859784', label: 'WhatsApp' },
  {
    Icon: InstagramIcon,
    href: 'https://www.instagram.com/theafzal_hussain_786',
    label: 'Instagram',
  },
]

export function Contact() {
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      subject: String(data.get('subject') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      // Honeypot: real visitors never see this field.
      website: String(data.get('website') ?? ''),
    }

    if (payload.message.length < 10) {
      toast.error('Please write at least 10 characters.')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(body?.error ?? 'Something went wrong. Please try again.', { duration: 6000 })
        // Dev-only cause, logged as a warning on purpose: console.error trips
        // the Next.js dev error overlay, and a config problem the terminal
        // already explains in full doesn't deserve a full-screen modal.
        if (body?.detail) console.warn('[contact] server detail:', body.detail)
        return
      }

      // Stored but the notification email did not go out: the message is not
      // lost, so don't alarm the visitor — just flag it for the developer.
      if (body?.adminEmailSent === false) {
        console.warn('[contact] Saved, but the notification email failed to send.')
      }

      toast.success('Message received — I usually reply within a day.')
      form.reset()
      setMessage('')
    } catch {
      toast.error('Network error. Please email me directly instead.')
    } finally {
      setSending(false)
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      toast.success('Email copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy — please select it manually.')
    }
  }

  return (
    <section id="contact" className="section-y relative z-10 border-t border-border">
      <div className="shell grid gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="eyebrow mb-4">
            <span aria-hidden="true">05</span> Contact
          </p>
          <h2 className="text-balance font-heading text-[1.65rem] font-bold tracking-tight sm:text-3xl md:text-4xl">
            Let&apos;s talk about your frontend roster.
          </h2>
          <p className="mt-4 max-w-[34rem] text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
            Send a role description, a take-home, or a 20-minute call invite. Messages are stored
            server-side and mailed to me, so nothing gets lost.
          </p>

          <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border/40">
            {CHANNELS.map((c) => (
              <div
                key={c.label}
                className="grid gap-0.5 bg-card/80 p-4 md:bg-card/70 md:backdrop-blur-sm"
              >
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {c.label}
                </dt>
                <dd className="min-w-0">
                  <a
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel={c.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                    className="block truncate text-[0.88rem] transition-colors hover:text-primary sm:text-[0.92rem]"
                  >
                    {c.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[0.82rem] font-semibold transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy email'}
            </button>

            <div className="flex items-center gap-4 text-muted-foreground">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid size-9 place-items-center transition-all hover:-translate-y-0.5 hover:text-primary"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <form
            onSubmit={onSubmit}
            className="relative grid gap-3.5 rounded-2xl border border-border bg-card/90 p-4 sm:rounded-3xl sm:p-5 md:bg-card/85 md:p-7 md:backdrop-blur-md"
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Your name
                </span>
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Priya Sharma"
                  className={FIELD}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={FIELD}
                />
              </label>
            </div>

            <label className="grid gap-1.5">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                Role &amp; company
              </span>
              <input
                name="subject"
                maxLength={150}
                placeholder="Frontend Intern — Acme Technologies"
                className={FIELD}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="flex items-center justify-between gap-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                Message
                <span>
                  {message.length}/{MAX_MESSAGE}
                </span>
              </span>
              <textarea
                name="message"
                required
                rows={5}
                minLength={10}
                maxLength={MAX_MESSAGE}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about the team, the stack and the timeline."
                className={`${FIELD} resize-y`}
              />
            </label>

            {/* Honeypot — hidden from humans, filled by bots. The form is
                `relative` so this is positioned against the form rather than
                the section, which is what kept it reliably off-screen. */}
            <div className="absolute -left-[9999px] top-0" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
            >
              {sending ? 'Sending…' : 'Send message'}
              {!sending && <Send className="size-4" />}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
