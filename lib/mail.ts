import nodemailer, { type Transporter } from 'nodemailer'

export interface ContactMailPayload {
  name: string
  email: string
  subject?: string
  message: string
}

const SITE_OWNER_NAME = 'Afzal Hussain'
// Falls back to the address already shown on the portfolio's contact
// section if ADMIN_EMAIL isn't set.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'theafzalhussain786@gmail.com'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) return transporter

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      'Missing email environment variables. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER and EMAIL_PASS in .env.local',
    )
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465, // true for port 465, false for 587/25
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  })

  return transporter
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const emailWrapper = (inner: string) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#ffffff;">
    ${inner}
    <hr style="margin-top:32px;border:none;border-top:1px solid #eaeaea;" />
    <p style="font-size:12px;color:#999;margin-top:16px;">Sent automatically from the contact form on your portfolio.</p>
  </div>
`

/** Notifies the site owner that someone submitted the contact form. */
export async function sendAdminNotificationEmail(data: ContactMailPayload): Promise<void> {
  const t = getTransporter()
  const safeName = escapeHtml(data.name)
  const safeEmail = escapeHtml(data.email)
  const safeSubject = escapeHtml(data.subject?.trim() || 'No subject')
  const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br/>')

  await t.sendMail({
    from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `New message from ${data.name} — Portfolio Contact Form`,
    text: [
      'New contact form submission',
      '',
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Subject: ${data.subject?.trim() || 'No subject'}`,
      '',
      'Message:',
      data.message,
    ].join('\n'),
    html: emailWrapper(`
      <h2 style="margin:0 0 20px;font-size:18px;">📬 New Contact Form Submission</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:6px 0;color:#666;width:90px;vertical-align:top;">Name</td>
          <td style="padding:6px 0;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#666;vertical-align:top;">Email</td>
          <td style="padding:6px 0;"><a href="mailto:${safeEmail}" style="color:#4f46e5;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#666;vertical-align:top;">Subject</td>
          <td style="padding:6px 0;">${safeSubject}</td>
        </tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#f6f6f8;border-radius:8px;font-size:14px;line-height:1.6;">
        ${safeMessage}
      </div>
      <p style="margin-top:20px;font-size:12px;color:#999;">Tip: just hit reply — it'll go straight to ${safeEmail}.</p>
    `),
  })
}

/** Sends the person who filled the form a confirmation that it was received. */
export async function sendUserConfirmationEmail(data: ContactMailPayload): Promise<void> {
  const t = getTransporter()
  const safeName = escapeHtml(data.name)
  const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br/>')

  await t.sendMail({
    from: `"${SITE_OWNER_NAME}" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: `Thanks for reaching out, ${data.name}!`,
    text: [
      `Hi ${data.name},`,
      '',
      "Thanks for reaching out! I've received your message and will get back to you within 24 hours.",
      '',
      'Your message:',
      data.message,
      '',
      `— ${SITE_OWNER_NAME}`,
    ].join('\n'),
    html: emailWrapper(`
      <h2 style="margin:0 0 12px;font-size:18px;">Hi ${safeName}, thanks for reaching out! 👋</h2>
      <p style="font-size:14px;line-height:1.6;color:#333;">
        I've received your message and will get back to you within 24 hours.
      </p>
      <div style="margin-top:16px;padding:16px;background:#f6f6f8;border-radius:8px;font-size:14px;line-height:1.6;">
        <p style="margin:0 0 8px;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:.05em;">Your message</p>
        ${safeMessage}
      </div>
      <p style="margin-top:24px;font-size:14px;color:#333;">
        Best,<br/>${SITE_OWNER_NAME}
      </p>
    `),
  })
}

/**
 * Sends both emails concurrently. Neither failure throws — each is
 * caught and logged independently so one bad email (e.g. a mistyped
 * user address) never breaks the other, and the caller can still treat
 * the overall form submission as successful since it's already saved
 * to the database by this point.
 */
export async function sendContactEmails(
  data: ContactMailPayload,
): Promise<{ adminEmailSent: boolean; userEmailSent: boolean }> {
  const [adminResult, userResult] = await Promise.allSettled([
    sendAdminNotificationEmail(data),
    sendUserConfirmationEmail(data),
  ])

  if (adminResult.status === 'rejected') {
    console.error('[contact] Failed to send admin notification email:', adminResult.reason)
  }
  if (userResult.status === 'rejected') {
    console.error('[contact] Failed to send user confirmation email:', userResult.reason)
  }

  return {
    adminEmailSent: adminResult.status === 'fulfilled',
    userEmailSent: userResult.status === 'fulfilled',
  }
}
