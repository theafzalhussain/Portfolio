# Contact Form — MongoDB Atlas + Nodemailer Setup

This document explains the backend that was added to your contact form.

## What changed / what was added

| File | Purpose |
|---|---|
| `lib/mongodb.ts` | Cached Mongoose connection to MongoDB Atlas (safe for Next.js hot-reload & serverless) |
| `lib/models/Contact.ts` | Mongoose schema/model — one document per submission |
| `lib/mail.ts` | Nodemailer transporter + the two email templates |
| `app/api/contact/route.ts` | Updated: keeps your existing validation, then saves to MongoDB **and** sends both emails |
| `.env.example` | Template listing every environment variable you need to set |
| `package.json` | Added `mongoose` and `nodemailer` (+ `@types/nodemailer`) |

**No changes were needed in `components/portfolio/contact.tsx`** — your form already posts `{ name, email, subject, message }` to `/api/contact`, which is exactly what the new backend expects.

### What happens on submit, step by step
1. Same validation as before (name/email/message required, length limits), plus a honeypot field and a per-IP rate limit.
2. The submission is saved as a document in MongoDB Atlas, in a `contacts` collection.
3. Two emails are sent (in parallel):
   - **To you** (`ADMIN_EMAIL`) — subject, message, and the sender's email set as `Reply-To`, so you can hit reply directly.
   - **To the person who submitted the form** — a confirmation that you received their message.
4. **Storage and delivery are independent.** If MongoDB is down or misconfigured, the emails still go out; if email breaks, the message is still stored in Atlas. The visitor is only shown an error when *both* fail — that is the only case where a message is genuinely lost. Every failure is logged to the server console with a `[contact]` prefix.

### Quick config check (development only)

With `npm run dev` running, open:

```
http://localhost:3000/api/contact
```

It returns which pieces are configured and whether Atlas is actually reachable — values are never included, only presence. This endpoint returns `404` in production.

---

## 1. Install the new dependencies

```bash
pnpm install
```

This reads the `mongoose` / `nodemailer` entries already added to `package.json` and updates `pnpm-lock.yaml` for you.

---

## 2. Create a MongoDB Atlas database

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → sign up / log in.
2. Create a **free (M0) cluster**.
3. **Database Access** (left sidebar) → *Add New Database User* → set a username + password (save these, you'll need them below).
4. **Network Access** (left sidebar) → *Add IP Address* → click **Allow Access From Anywhere** (`0.0.0.0/0`).
   - Needed because Vercel's serverless functions don't have a fixed IP.
5. Go to **Database** → your cluster → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with the real values from step 3, and add a database name right after `.net/`, e.g. `.net/portfolio?retryWrites=true...`. This becomes your `MONGODB_URI`.

Submissions will land in the `portfolio` database, `contacts` collection (Mongoose creates both automatically on the first insert — no manual setup needed).

---

## 3. Create a Gmail App Password (for sending emails)

Your normal Gmail password will **not** work with Nodemailer. You need an **App Password**:

1. Turn on **2-Step Verification** on your Google Account, if it isn't already: [myaccount.google.com/security](https://myaccount.google.com/security)
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create a new app password (name it anything, e.g. "Portfolio Contact Form").
4. Google gives you a 16-character password like `abcd efgh ijkl mnop` — copy it **without spaces**.

> Prefer not to use Gmail? Any SMTP provider works (Brevo, SendGrid, Zoho Mail, Outlook, etc.) — just change `EMAIL_HOST` / `EMAIL_PORT` in the next step to that provider's values.

---

## 4. Set your environment variables

Copy the example file:

```powershell
Copy-Item .env.example .env.local
```

A pre-filled `.env.local` is already in the project root — just open it and fill in the blanks:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=youraddress@gmail.com
EMAIL_PASS=abcdefghijklmnop        # the 16-char App Password (spaces are stripped for you)

ADMIN_EMAIL=theafzalhussain786@gmail.com
# EMAIL_FROM="Afzal Hussain <youraddress@gmail.com>"   # optional override
```

**Restart the dev server after editing this file** — Next.js reads env files at startup, so an edit made while the server is running may not be picked up.

`.env.local` is already in `.gitignore` — it will never get committed.

---

## 5. Run it locally and test

```bash
pnpm dev
```

Open `http://localhost:3000`, scroll to the Contact section, and submit the form with a real email address you can check. You should see:
- A success toast on the page.
- A new document in MongoDB Atlas → your cluster → **Browse Collections** → `portfolio.contacts`.
- A notification email in your `ADMIN_EMAIL` inbox.
- A confirmation email in the inbox of whatever email address you submitted the form with.

If something fails, check your terminal running `pnpm dev` — every error is logged there with a `[contact]` prefix telling you exactly what's missing (e.g. a missing env var).

---

## 6. Deploying (e.g. Vercel)

Add the same variables from `.env.local` to your hosting provider's dashboard:
**Vercel → Project → Settings → Environment Variables** → add `MONGODB_URI`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `ADMIN_EMAIL` → redeploy.

---

## Where to see stored submissions

MongoDB Atlas → your cluster → **Browse Collections** → `portfolio` database → `contacts` collection. Each document has `name`, `email`, `subject`, `message`, `ip`, `userAgent`, and timestamps (`createdAt`, `updatedAt`).

---

## Troubleshooting

| Symptom in the terminal | Cause & fix |
|---|---|
| `Missing MONGODB_URI environment variable` | `.env.local` has no value for it, or the dev server was started before you filled it in. Fill it, then restart the server. |
| `MONGODB_URI still contains the <user>/<password> placeholders` | Replace them with the database user you created in Atlas **Database Access** (not your Atlas login). |
| `Could not connect to any servers in your MongoDB Atlas cluster` / server selection timeout | Your IP isn't allow-listed. Atlas → **Network Access** → add `0.0.0.0/0`. |
| `Authentication failed` from Atlas | Wrong database-user password, or a password with `@ : / ?` in it that needs URL-encoding (`@` → `%40`). |
| `Email is not configured: EMAIL_USER, EMAIL_PASS missing` | Fill those in `.env.local` and restart. |
| `Invalid login: 535-5.7.8 Username and Password not accepted` | You used your normal Gmail password. Create a 16-character **App Password** (step 3). |
| `Connection timeout` on port 465 | Your network or ISP blocks SMTPS. Try `EMAIL_PORT=587`, or a provider like Brevo. |
| Success toast, but no email arrives | Check spam. Then check the terminal — if it says the admin email failed, the message is still safe in Atlas. |
