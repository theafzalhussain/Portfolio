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
1. Same validation as before (name/email/message required, length limits).
2. The submission is saved as a document in MongoDB Atlas, in a `contacts` collection.
3. Two emails are sent (in parallel):
   - **To you** (`ADMIN_EMAIL`) — subject, message, and the sender's email set as `Reply-To`, so you can hit reply directly.
   - **To the person who submitted the form** — a confirmation that you received their message.
4. If saving to MongoDB fails, the request fails with an error (so you never silently lose a message). If only the *email* step fails, it's logged to the server console but the form still reports success to the user, since their message is already safely stored in the database — you'll still see it in Atlas.

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

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in the real values:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=youraddress@gmail.com
EMAIL_PASS=abcdefghijklmnop        # the 16-char App Password, no spaces

EMAIL_FROM="Afzal Hussain <youraddress@gmail.com>"
ADMIN_EMAIL=theafzalhussain786@gmail.com
```

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
