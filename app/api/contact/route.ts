import { NextResponse, after } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Contact } from '@/lib/models/Contact'
import { sendContactEmails, getMailConfigStatus } from '@/lib/mail'
import { isRateLimited } from '@/lib/rate-limit'

// Mongoose and Nodemailer both need real Node APIs (TCP sockets, dns),
// so this route must never be pushed onto the edge runtime.
export const runtime = 'nodejs'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isDev = process.env.NODE_ENV !== 'production'

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const website = typeof body.website === 'string' ? body.website : ''

    // Honeypot: bots fill every field, humans never see this one.
    if (website) {
      return NextResponse.json({ error: 'Submission rejected.' }, { status: 400 })
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please provide a valid name.' }, { status: 400 })
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }
    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long.' },
        { status: 400 },
      )
    }
    if (name.length > 100 || email.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: 'Input exceeds maximum length.' }, { status: 400 })
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      ''

    // Best-effort rate limit (per IP, in-memory) to deter spam bursts.
    if (isRateLimited(ip || 'unknown')) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 },
      )
    }

    const userAgent = request.headers.get('user-agent') || ''

    /* ── 1. Persist to MongoDB (best effort) ──────────────────────────
       Storage and delivery are deliberately independent. A misconfigured
       or unreachable database must not stop the email from going out —
       that email is the whole point of the form. Previously a missing
       MONGODB_URI threw here and the request 500'd before Nodemailer was
       ever reached, which is exactly the failure this route hit. */
    let stored = false
    let dbError: string | null = null
    try {
      await connectToDatabase()
      await Contact.create({ name, email, subject, message, ip, userAgent })
      stored = true
      console.log('[contact] Saved submission to MongoDB:', { name, email })
    } catch (err) {
      dbError = describe(err)
      console.error('[contact] Could not store submission in MongoDB:', dbError)
    }

    /* ── 2. Deliver the emails ────────────────────────────────────────
       SMTP is the slow part of this request — a Gmail handshake plus two
       sends is 1-3 seconds, and the visitor was sitting on a spinner for
       all of it. Since the message is already durably stored, delivery no
       longer needs to happen before the response.

       `after()` runs the callback once the response has been flushed, and
       on serverless platforms it holds the function alive via waitUntil —
       so unlike a bare floating promise, the SMTP conversation cannot be
       killed halfway by the instance being frozen. */
    if (stored) {
      after(async () => {
        try {
          const result = await sendContactEmails({ name, email, subject, message })
          if (!result.adminEmailSent) {
            console.warn('[contact] Stored, but the admin notification failed:', result.error)
          }
        } catch (err) {
          console.error('[contact] Background email delivery failed:', describe(err))
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Message received.',
        stored: true,
        // Delivery is still in flight at this point, by design.
        emailQueued: true,
      })
    }

    /* Storage failed, so email is now the only thing standing between this
       message and oblivion. That means it has to be awaited: the visitor
       cannot be told "received" until something actually received it. */
    let adminEmailSent = false
    let userEmailSent = false
    let mailError: string | null = null
    try {
      const result = await sendContactEmails({ name, email, subject, message })
      adminEmailSent = result.adminEmailSent
      userEmailSent = result.userEmailSent
      mailError = result.error
    } catch (err) {
      mailError = describe(err)
      console.error('[contact] Email step failed outright:', mailError)
    }

    if (!adminEmailSent) {
      console.error('[contact] Submission LOST — neither database nor email worked.', {
        dbError,
        mailError,
      })
      return NextResponse.json(
        {
          error:
            'The contact form is temporarily unavailable. Please email me directly at theafzalhussain786@gmail.com.',
          // Surfaced in dev only so the cause is visible in the browser
          // without digging through the terminal.
          ...(isDev ? { detail: { dbError, mailError } } : {}),
        },
        { status: 503 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message received.',
      stored: false,
      adminEmailSent,
      userEmailSent,
    })
  } catch (error) {
    console.error('[contact] Failed to process submission:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 },
    )
  }
}

/**
 * Development-only config check: `GET /api/contact` reports which
 * environment variables are present, never their values. Returns 404 in
 * production so it cannot be used to probe a live deployment.
 */
export async function GET() {
  if (!isDev) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  const db: { configured: boolean; reachable: boolean; error: string | null } = {
    configured: Boolean(process.env.MONGODB_URI),
    reachable: false,
    error: null,
  }

  if (db.configured) {
    try {
      await connectToDatabase()
      db.reachable = true
    } catch (err) {
      db.error = describe(err)
    }
  } else {
    db.error = 'MONGODB_URI is not set in .env.local'
  }

  return NextResponse.json({ db, mail: getMailConfigStatus() })
}
