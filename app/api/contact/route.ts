import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Contact } from '@/lib/models/Contact'
import { sendContactEmails } from '@/lib/mail'
import { isRateLimited } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

    // 1. Persist the submission to MongoDB Atlas.
    await connectToDatabase()

    const userAgent = request.headers.get('user-agent') || ''

    await Contact.create({ name, email, subject, message, ip, userAgent })
    console.log('[v0] Contact form submission saved to MongoDB:', { name, email })

    // 2. Send the two notification emails (to the admin, and a confirmation
    // to the user). This is awaited so the emails actually get a chance to
    // send before a serverless function instance is frozen/torn down —
    // fire-and-forget here would risk emails silently never going out on
    // platforms like Vercel. A failure here is logged but does NOT fail the
    // request, since the submission is already safely stored above.
    await sendContactEmails({ name, email, subject, message })

    return NextResponse.json({ success: true, message: 'Message received.' })
  } catch (error) {
    console.error('[contact] Failed to process submission:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 },
    )
  }
}
