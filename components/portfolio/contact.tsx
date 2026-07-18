'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Check,
  Clock,
  Copy,
  Loader2,
  Mail as MailIcon,
  MapPin,
  MessageSquare,
  Send,
} from 'lucide-react'
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
} from '@/components/portfolio/brand-icons'

const EMAIL = 'theafzalhussain786@gmail.com'
const MESSAGE_LIMIT = 1000

function FloatingField({
  id,
  label,
  type = 'text',
  textarea = false,
  required = true,
  value,
  onChange,
  maxLength,
}: {
  id: string
  label: string
  type?: string
  textarea?: boolean
  required?: boolean
  value: string
  onChange: (v: string) => void
  maxLength?: number
}) {
  const shared =
    'peer w-full rounded-xl border border-input bg-secondary/40 px-4 pt-6 pb-2 text-sm text-foreground outline-none transition-colors focus:border-primary placeholder-transparent'

  return (
    <div className="relative">
      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={5}
          required={required}
          maxLength={maxLength}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${shared} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          maxLength={maxLength}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
        />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 text-xs text-primary transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
      >
        {label}
      </label>
    </div>
  )
}

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      toast.success('Email copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy email')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setSending(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      toast.success('Message sent successfully! I will get back to you soon.')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="relative z-10 py-20 md:py-24">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))]">
        <div className="glass-strong grid grid-cols-1 gap-10 rounded-3xl p-6 sm:p-8 md:grid-cols-2 md:p-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="flex min-w-0 flex-col justify-center"
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <MessageSquare className="size-3.5" aria-hidden="true" />
              Contact
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Get In <span className="text-primary">Touch</span>
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              I&apos;m currently looking for new opportunities. Whether you have a question, a
              project idea, or just want to say hi, I&apos;ll try my best to get back to you!
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
                Available for work
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-3.5" aria-hidden="true" />
                Replies within 24 hours
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="glass group flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-primary/40">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <MailIcon className="size-5" aria-hidden="true" />
                </span>
                <a href={`mailto:${EMAIL}`} className="min-w-0 flex-1">
                  <span className="block text-xs text-muted-foreground">Email</span>
                  <span className="block truncate text-sm font-semibold">{EMAIL}</span>
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label="Copy email address"
                  className="glass flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
                >
                  {copied ? (
                    <Check className="size-4 text-accent" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
              <div className="glass flex items-center gap-4 rounded-2xl p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-muted-foreground">Location</span>
                  <span className="block text-sm font-semibold">India · Open to remote</span>
                </span>
              </div>
            </div>

            <div className="mt-8 md:mt-10">
              <p className="mb-3 text-sm text-muted-foreground">Connect with me</p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/theafzalhussain"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="glass flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-all hover:-translate-y-1 hover:text-primary"
                >
                  <GithubIcon className="size-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/afzalhussain"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="glass flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-all hover:-translate-y-1 hover:text-primary"
                >
                  <LinkedinIcon className="size-5" />
                </a>
                <a
                  href="https://wa.me/918447859784"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="glass flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-all hover:-translate-y-1 hover:text-primary"
                >
                  <WhatsappIcon className="size-5" />
                </a>
                <a
                  href="https://www.instagram.com/theafzalhussain"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram profile"
                  className="glass flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-all hover:-translate-y-1 hover:text-primary"
                >
                  <InstagramIcon className="size-5" />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="flex min-w-0 flex-col gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingField id="name" label="Your Name" value={name} onChange={setName} />
              <FloatingField
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
              />
            </div>
            <FloatingField
              id="subject"
              label="Subject"
              required={false}
              value={subject}
              onChange={setSubject}
            />
            <div>
              <FloatingField
                id="message"
                label="Your Message"
                textarea
                value={message}
                onChange={setMessage}
                maxLength={MESSAGE_LIMIT}
              />
              <p
                className={`mt-1.5 text-right font-mono text-xs ${
                  message.length > MESSAGE_LIMIT - 50 ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                {message.length}/{MESSAGE_LIMIT}
              </p>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_28px_-8px_var(--glow)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_-6px_var(--glow)] active:scale-95 disabled:opacity-60"
            >
              {sending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="size-4" /> Send Message
                </>
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
