import nodemailer, { type Transporter } from 'nodemailer'
import { RESUME_URL, SITE_URL } from '@/lib/site'

export interface ContactMailPayload {
  name: string
  email: string
  subject?: string
  message: string
}

/* ─────────────────────────────────────────────
   Brand constants — mirrored from the portfolio
   ───────────────────────────────────────────── */

const SITE_OWNER_NAME = 'Afzal Hussain'
const SITE_OWNER_ROLE = 'Frontend Developer · New Delhi'
const GITHUB_URL = 'https://github.com/theafzalhussain'
const LINKEDIN_URL = 'https://www.linkedin.com/in/theafzalhussain/'
const WHATSAPP_URL = 'https://wa.me/918447859784'

// Falls back to the address already shown on the portfolio's contact
// section if ADMIN_EMAIL isn't set.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'theafzalhussain786@gmail.com'

/* Palette lifted from app/globals.css so the emails read as the same product
   as the site: near-black slate page, raised card, cyan primary, emerald
   accent. Email clients get no CSS variables, so these are literal hex. */
const C = {
  page: '#090c10',
  card: '#12171e',
  inset: '#0e141b',
  border: '#232b35',
  text: '#e9edf2',
  muted: '#98a3ae',
  faint: '#6b7682',
  cyan: '#22d3ee',
  emerald: '#34d399',
  onCyan: '#08131a',
}

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace"

const REQUIRED_VARS = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'] as const

let transporter: Transporter | null = null
/** The config the cached transporter was built from, so an .env edit during
 *  a dev session rebuilds it instead of silently reusing stale credentials. */
let transporterKey = ''

function readConfig() {
  const host = process.env.EMAIL_HOST?.trim() ?? ''
  const port = Number(process.env.EMAIL_PORT?.trim() || 0)
  const user = process.env.EMAIL_USER?.trim() ?? ''
  // Google displays app passwords as "abcd efgh ijkl mnop". Pasting them with
  // the spaces is the single most common reason auth fails here, so strip all
  // whitespace rather than making the user debug a 535 from Gmail.
  const pass = (process.env.EMAIL_PASS ?? '').replace(/\s+/g, '')
  return { host, port, user, pass }
}

function missingVars(): string[] {
  return REQUIRED_VARS.filter((key) => !process.env[key]?.trim())
}

/** Non-secret view of the mail config, for the dev-only diagnostics route. */
export function getMailConfigStatus() {
  const missing = missingVars()
  const { host, port, user } = readConfig()
  return {
    configured: missing.length === 0,
    missing,
    host: host || null,
    port: port || null,
    // Masked: enough to confirm the right mailbox, not enough to reuse.
    user: user ? user.replace(/^(.).*(@.*)$/, '$1***$2') : null,
    adminEmail: ADMIN_EMAIL,
  }
}

function getTransporter(): Transporter {
  const missing = missingVars()
  if (missing.length > 0) {
    throw new Error(
      `Email is not configured: ${missing.join(', ')} missing from .env.local. See SETUP_CONTACT_FORM.md step 3-4.`,
    )
  }

  const { host, port, user, pass } = readConfig()

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`EMAIL_PORT is not a valid port number (got "${process.env.EMAIL_PORT}").`)
  }

  const key = `${host}:${port}:${user}:${pass.length}`
  if (transporter && transporterKey === key) return transporter

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false for 587/25
    // 587 negotiates TLS with STARTTLS; without this a provider that allows
    // plaintext would happily send the credentials unencrypted.
    requireTLS: port !== 465,
    auth: { user, pass },
    // Pooling keeps the authenticated connection warm between the two emails
    // (and across submissions on a long-lived server), so the second send
    // skips the TCP + TLS + AUTH round trips entirely.
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    // Without these a firewalled SMTP port leaves the request hanging until
    // the platform kills it, and the visitor just watches a spinner.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  })
  transporterKey = key

  return transporter
}

/** `from` header. EMAIL_FROM wins if set, otherwise built from EMAIL_USER. */
function fromHeader(displayName: string): string {
  const override = process.env.EMAIL_FROM?.trim()
  if (override) return override
  return `"${displayName}" <${readConfig().user}>`
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function nl2br(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br />')
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || full
}

function initials(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Human timestamp in IST, since that's the timezone he actually works in. */
function istTimestamp(): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date())
}

/* ─────────────────────────────────────────────
   Layout primitives

   Everything below is table-based with inline styles. Email clients strip
   <style> blocks, ignore flexbox/grid, and Outlook renders through Word —
   so semantic divs and modern CSS are not an option here.
   ───────────────────────────────────────────── */

interface ShellOptions {
  title: string
  /** Hidden line Gmail/Apple Mail show next to the subject in the list view. */
  preheader: string
  eyebrow: string
  body: string
  footerNote: string
}

function shell({ title, preheader, eyebrow, body, footerNote }: ShellOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.page};-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:${C.page};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.page};">
    <tr>
      <td align="center" style="padding:36px 14px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

          <!-- Brand bar -->
          <tr>
            <td style="padding:0 4px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="42" valign="middle">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="42" height="42" align="center" valign="middle" bgcolor="${C.inset}" style="width:42px;height:42px;border:1px solid ${C.border};border-radius:12px;font-family:${MONO};font-size:14px;font-weight:700;letter-spacing:0.06em;color:${C.emerald};">AH</td>
                      </tr>
                    </table>
                  </td>
                  <td valign="middle" style="padding-left:12px;">
                    <div style="font-family:${SANS};font-size:15px;font-weight:700;color:${C.text};letter-spacing:-0.01em;">${SITE_OWNER_NAME}</div>
                    <div style="font-family:${MONO};font-size:10.5px;text-transform:uppercase;letter-spacing:0.14em;color:${C.faint};padding-top:3px;">${SITE_OWNER_ROLE}</div>
                  </td>
                  <td valign="middle" align="right">
                    <a href="${SITE_URL}" style="font-family:${MONO};font-size:10.5px;text-transform:uppercase;letter-spacing:0.12em;color:${C.muted};text-decoration:none;">afzalhussain.tech&nbsp;&rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td bgcolor="${C.card}" style="background-color:${C.card};border:1px solid ${C.border};border-radius:18px;overflow:hidden;">
              <!-- Accent hairline -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td height="3" bgcolor="${C.emerald}" style="height:3px;line-height:3px;font-size:0;background-color:${C.emerald};background-image:linear-gradient(90deg,${C.emerald},${C.cyan});">&nbsp;</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 30px 30px;">
                    <div style="font-family:${MONO};font-size:10.5px;text-transform:uppercase;letter-spacing:0.16em;color:${C.emerald};padding-bottom:14px;">${escapeHtml(eyebrow)}</div>
                    ${body}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 6px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="font-family:${SANS};font-size:12px;line-height:1.7;color:${C.faint};">
                    <a href="${SITE_URL}" style="color:${C.muted};text-decoration:none;">Portfolio</a>
                    <span style="color:${C.border};">&nbsp;·&nbsp;</span>
                    <a href="${GITHUB_URL}" style="color:${C.muted};text-decoration:none;">GitHub</a>
                    <span style="color:${C.border};">&nbsp;·&nbsp;</span>
                    <a href="${LINKEDIN_URL}" style="color:${C.muted};text-decoration:none;">LinkedIn</a>
                    <span style="color:${C.border};">&nbsp;·&nbsp;</span>
                    <a href="${WHATSAPP_URL}" style="color:${C.muted};text-decoration:none;">WhatsApp</a>
                    <div style="padding-top:12px;color:${C.faint};font-size:11.5px;">${escapeHtml(footerNote)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Bulletproof pill button — bgcolor on the cell so Outlook fills it too. */
function button(href: string, label: string, kind: 'primary' | 'ghost' = 'primary'): string {
  if (kind === 'ghost') {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;">
      <tr><td align="center" style="border:1px solid ${C.border};border-radius:999px;">
        <a href="${href}" style="display:inline-block;padding:11px 22px;font-family:${SANS};font-size:13.5px;font-weight:600;color:${C.text};text-decoration:none;">${escapeHtml(label)}</a>
      </td></tr></table>`
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;">
    <tr><td align="center" bgcolor="${C.cyan}" style="background-color:${C.cyan};border-radius:999px;">
      <a href="${href}" style="display:inline-block;padding:12px 24px;font-family:${SANS};font-size:13.5px;font-weight:700;color:${C.onCyan};text-decoration:none;">${escapeHtml(label)}</a>
    </td></tr></table>`
}

/** Mono label above a value — the "eyebrow" pattern used across the site. */
function metaRow(label: string, valueHtml: string): string {
  return `<tr>
    <td style="padding:0 0 14px;">
      <div style="font-family:${MONO};font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:${C.faint};padding-bottom:4px;">${escapeHtml(label)}</div>
      <div style="font-family:${SANS};font-size:14.5px;line-height:1.5;color:${C.text};">${valueHtml}</div>
    </td>
  </tr>`
}

/** Quoted message body with an emerald spine. */
function quoteBlock(label: string, bodyHtml: string): string {
  return `<div style="font-family:${MONO};font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:${C.faint};padding-bottom:8px;">${escapeHtml(label)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.inset}" style="background-color:${C.inset};border:1px solid ${C.border};border-left:3px solid ${C.emerald};border-radius:12px;">
    <tr><td style="padding:18px 20px;font-family:${SANS};font-size:14.5px;line-height:1.75;color:#dbe2e9;">${bodyHtml}</td></tr>
  </table>`
}

/** A unique header per message so Gmail never collapses two submissions
 *  into one thread with a "..." trim. */
function refHeaders() {
  return {
    'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  }
}

/* ─────────────────────────────────────────────
   1. Admin notification
   ───────────────────────────────────────────── */

export async function sendAdminNotificationEmail(data: ContactMailPayload) {
  const t = getTransporter()
  const safeName = escapeHtml(data.name)
  const safeEmail = escapeHtml(data.email)
  const rawSubject = data.subject?.trim() || ''
  const safeSubject = rawSubject ? escapeHtml(rawSubject) : 'No subject provided'
  const stamp = istTimestamp()
  const replyHref = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(
    rawSubject ? `Re: ${rawSubject}` : `Re: your message on afzalhussain.tech`,
  )}`

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td valign="middle" width="46">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="46" height="46" align="center" valign="middle" bgcolor="${C.inset}" style="width:46px;height:46px;border:1px solid ${C.border};border-radius:50%;font-family:${SANS};font-size:15px;font-weight:700;color:${C.cyan};">${escapeHtml(initials(data.name))}</td>
            </tr>
          </table>
        </td>
        <td valign="middle" style="padding-left:14px;">
          <div style="font-family:${SANS};font-size:21px;font-weight:700;line-height:1.25;color:${C.text};letter-spacing:-0.02em;">${safeName}</div>
          <div style="font-family:${SANS};font-size:13px;color:${C.muted};padding-top:3px;">wants to get in touch</div>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td height="22" style="height:22px;line-height:22px;font-size:0;">&nbsp;</td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${metaRow('Email', `<a href="mailto:${safeEmail}" style="color:${C.cyan};text-decoration:none;">${safeEmail}</a>`)}
      ${metaRow('Role &amp; company', safeSubject)}
      ${metaRow('Received', `${escapeHtml(stamp)} IST`)}
    </table>

    ${quoteBlock('Message', nl2br(data.message))}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td height="26" style="height:26px;line-height:26px;font-size:0;">&nbsp;</td></tr>
      <tr>
        <td>
          ${button(replyHref, `Reply to ${firstName(data.name)}`)}
        </td>
      </tr>
      <tr><td height="16" style="height:16px;line-height:16px;font-size:0;">&nbsp;</td></tr>
      <tr>
        <td style="font-family:${SANS};font-size:12.5px;line-height:1.6;color:${C.faint};">
          Reply-To is already set to their address — hitting reply in any mail client goes straight to them.
        </td>
      </tr>
    </table>`

  return t.sendMail({
    from: fromHeader(`${SITE_OWNER_NAME} · Portfolio`),
    to: ADMIN_EMAIL,
    replyTo: `"${data.name}" <${data.email}>`,
    subject: rawSubject
      ? `New inquiry — ${data.name} · ${rawSubject}`
      : `New inquiry — ${data.name}`,
    headers: refHeaders(),
    text: [
      `NEW INQUIRY — afzalhussain.tech`,
      ''.padEnd(46, '-'),
      `Name     : ${data.name}`,
      `Email    : ${data.email}`,
      `Subject  : ${rawSubject || 'No subject provided'}`,
      `Received : ${stamp} IST`,
      ''.padEnd(46, '-'),
      '',
      'MESSAGE',
      data.message,
      '',
      ''.padEnd(46, '-'),
      `Reply directly to this email to reach ${firstName(data.name)}.`,
    ].join('\n'),
    html: shell({
      title: `New inquiry from ${data.name}`,
      preheader: rawSubject
        ? `${data.name} · ${rawSubject}`
        : `${data.name} sent a message through your portfolio.`,
      eyebrow: 'New inquiry · Contact form',
      body,
      footerNote: 'Sent automatically by the contact form on afzalhussain.tech',
    }),
  })
}

/* ─────────────────────────────────────────────
   2. Confirmation to the visitor
   ───────────────────────────────────────────── */

export async function sendUserConfirmationEmail(data: ContactMailPayload) {
  const t = getTransporter()
  const first = firstName(data.name)
  const safeFirst = escapeHtml(first)

  const step = (n: string, text: string) => `
    <tr>
      <td valign="top" width="26" style="padding:0 0 12px;">
        <div style="font-family:${MONO};font-size:11px;font-weight:600;color:${C.emerald};line-height:1.6;">${n}</div>
      </td>
      <td valign="top" style="padding:0 0 12px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.muted};">${text}</td>
    </tr>`

  const body = `
    <div style="font-family:${SANS};font-size:23px;font-weight:700;line-height:1.3;color:${C.text};letter-spacing:-0.02em;">
      Thanks for reaching out, ${safeFirst}.
    </div>

    <div style="font-family:${SANS};font-size:15px;line-height:1.75;color:${C.muted};padding-top:12px;">
      Your message reached me — this is an automatic confirmation so you know it didn&rsquo;t vanish
      into a void. I read every message myself.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td height="24" style="height:24px;line-height:24px;font-size:0;">&nbsp;</td></tr>
    </table>

    <div style="font-family:${MONO};font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:${C.faint};padding-bottom:10px;">What happens next</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${step('01', 'I read your message and check the details you sent.')}
      ${step('02', 'You get a personal reply within 24 hours, usually sooner.')}
      ${step('03', `If it&rsquo;s about a role, I&rsquo;ll include my resume and availability.`)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td height="14" style="height:14px;line-height:14px;font-size:0;">&nbsp;</td></tr>
    </table>

    ${quoteBlock('Your message', nl2br(data.message))}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td height="26" style="height:26px;line-height:26px;font-size:0;">&nbsp;</td></tr>
      <tr>
        <td>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>${button(SITE_URL, 'View portfolio')}</td>
              <td width="10">&nbsp;</td>
              <td>${button(RESUME_URL, 'Download resume', 'ghost')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td height="28" style="height:28px;line-height:28px;font-size:0;">&nbsp;</td></tr>
      <tr><td height="1" bgcolor="${C.border}" style="height:1px;line-height:1px;font-size:0;background-color:${C.border};">&nbsp;</td></tr>
      <tr><td height="18" style="height:18px;line-height:18px;font-size:0;">&nbsp;</td></tr>
      <tr>
        <td style="font-family:${SANS};font-size:14px;line-height:1.6;color:${C.muted};">
          Talk soon,<br />
          <strong style="color:${C.text};font-weight:700;">${SITE_OWNER_NAME}</strong><br />
          <span style="font-family:${MONO};font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:${C.faint};">${SITE_OWNER_ROLE}</span>
        </td>
      </tr>
    </table>`

  return t.sendMail({
    from: fromHeader(SITE_OWNER_NAME),
    to: data.email,
    replyTo: ADMIN_EMAIL,
    subject: `Got your message, ${first} — I'll reply within 24 hours`,
    headers: refHeaders(),
    text: [
      `Hi ${first},`,
      '',
      "Your message reached me. This is an automatic confirmation so you know it didn't vanish into a void — I read every message myself.",
      '',
      'WHAT HAPPENS NEXT',
      '01  I read your message and check the details you sent.',
      '02  You get a personal reply within 24 hours, usually sooner.',
      "03  If it's about a role, I'll include my resume and availability.",
      '',
      'YOUR MESSAGE',
      data.message,
      '',
      ''.padEnd(46, '-'),
      `Portfolio : ${SITE_URL}`,
      `Resume    : ${RESUME_URL}`,
      `GitHub    : ${GITHUB_URL}`,
      `LinkedIn  : ${LINKEDIN_URL}`,
      '',
      'Talk soon,',
      SITE_OWNER_NAME,
      SITE_OWNER_ROLE,
    ].join('\n'),
    html: shell({
      title: `Thanks for reaching out, ${first}`,
      preheader: `Got your message — a personal reply is on the way within 24 hours.`,
      eyebrow: 'Message received',
      body,
      footerNote: `You received this because you used the contact form on afzalhussain.tech.`,
    }),
  })
}

/** Addresses SMTP confirmed it took, flattened for the log line. */
function accepted(info: { accepted?: Array<string | { address: string }> }): string {
  const list = info.accepted ?? []
  if (list.length === 0) return 'none'
  return list.map((a) => (typeof a === 'string' ? a : a.address)).join(', ')
}

/**
 * Sends both emails concurrently. Neither failure throws — each is caught and
 * logged independently so one bad address (e.g. a mistyped sender email) never
 * blocks the other. The reason for the *admin* failure is returned, because
 * that is the one the caller needs in order to decide whether the submission
 * actually reached anyone.
 *
 * Both outcomes are logged with the address SMTP actually accepted. Without
 * that line the visitor confirmation was invisible: it is fire-and-forget by
 * design, so a silent success and a silent failure looked identical from the
 * terminal, and the only way to tell them apart was to check an inbox.
 */
export async function sendContactEmails(
  data: ContactMailPayload,
): Promise<{ adminEmailSent: boolean; userEmailSent: boolean; error: string | null }> {
  const [adminResult, userResult] = await Promise.allSettled([
    sendAdminNotificationEmail(data),
    sendUserConfirmationEmail(data),
  ])

  let error: string | null = null

  if (adminResult.status === 'rejected') {
    error =
      adminResult.reason instanceof Error
        ? adminResult.reason.message
        : String(adminResult.reason)
    console.error('[contact] Failed to send admin notification email:', adminResult.reason)
  } else {
    console.log(
      `[contact] Admin notification accepted by SMTP for: ${accepted(adminResult.value)}`,
    )
  }

  if (userResult.status === 'rejected') {
    console.error('[contact] Failed to send user confirmation email:', userResult.reason)
  } else {
    console.log(
      `[contact] Visitor confirmation accepted by SMTP for: ${accepted(userResult.value)}`,
    )
  }

  return {
    adminEmailSent: adminResult.status === 'fulfilled',
    userEmailSent: userResult.status === 'fulfilled',
    error,
  }
}
