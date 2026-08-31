## Live Demo = https://www.afzalhussain.tech/

## 📖 Overview

This repository holds the source of the personal portfolio of **Afzal Hussain**, a MERN stack developer. It is a Next.js App Router application rendered as one continuous scrolling page — hero, about, skills, projects, resume, certifications, contact — over an animated canvas particle background and a glassmorphic, dark-first design system.

It is not a static site. The contact form posts to a real route handler (`POST /api/contact`) that validates the payload, persists every submission to MongoDB Atlas through Mongoose, then sends two transactional emails over SMTP: a notification to the site owner (with the sender set as `Reply-To`) and a confirmation to the person who wrote in. The showcased work, as listed in `components/portfolio/projects.tsx`, is **eShopperr** (featured MERN e-commerce platform), **MovieZone** (TMDB API), **MyNews Web** (GNews API), **Weather App** (OpenWeather API with geolocation) and **REST Countries Explorer**.

## ✨ Key Features

**Sections** — Composed in `app/page.tsx` in a fixed order: `Hero` → `About` → `Skills` → `Projects` → `Resume` → `Certifications` → `Contact`, plus a persistent `Navbar` and `Footer`. The hero pairs an "Available for Work" badge and a typewriter line cycling four specializations with a three-ring orbit of technology badges. About adds a mouse-tracked 3D tilt profile card and scroll-triggered count-up statistics. Skills is a filterable grid (`All` / `Frontend` / `Backend` / `Databases/Tools`) with an animated `layoutId` tab pill and spring enter/exit transitions. Projects renders one featured card plus a two-column grid with `next/image` screenshots, highlight bullets and technology tags. Resume offers highlight cards and a one-click PDF download; Certifications lists six credentials and achievements with hover tilt.

**Contact Pipeline** — Form state lives in `components/portfolio/contact.tsx` with a live character counter, a disabled/loading submit state and `react-hot-toast` success and error toasts. Submissions are validated server-side, stored in MongoDB, then mirrored to two escaped HTML emails. A one-click copy-email button and GitHub / LinkedIn / WhatsApp / Instagram links complete the section.

**Motion & Visuals** — A full-viewport canvas particle field (`components/portfolio/particle-field.tsx`) with a jittered particle grid, pointer-repulsion physics, spring return-to-base, proximity link lines, a lagging glow orb and a custom cursor. Layered on top: drifting ambient mesh blurs, `glass` / `glass-strong` backdrop-blur utilities, and custom keyframes (`orbit`, `float-y`, `mesh-drift`, `pulse-ring`, `caret-blink`, `spin-slow`) defined in `app/globals.css`. The navbar shrinks on scroll and carries a Framer Motion scroll-progress bar, `IntersectionObserver`-driven active-section highlighting and an animated mobile drawer below the `lg` breakpoint.

**Performance & SEO** — Server components by default with client components scoped to interactive sections; `next/font/google` self-hosting for Geist, Geist Mono and Space Grotesk; `next/image` for every project screenshot; light/dark-aware favicons plus an Apple touch icon declared in `app/layout.tsx`; `@vercel/analytics` mounted only when `NODE_ENV === 'production'`; and a global `prefers-reduced-motion` block that disables decorative animations, particle physics and smooth scrolling.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js `16.2.6` (App Router, route handlers, Turbopack root pinned in `next.config.mjs`) |
| UI runtime | React `19` / React DOM `19` |
| Language | TypeScript `5.7.3` (`strict: true`, `@/*` path alias) |
| Styling | Tailwind CSS `v4` via `@tailwindcss/postcss`, `tw-animate-css`, OKLCH tokens in `app/globals.css` |
| Components | shadcn CLI (`base-nova` style) with `@base-ui/react`, `class-variance-authority`, `tailwind-merge`, `clsx` |
| Animation | `framer-motion` `12`, a hand-written canvas particle system, custom CSS keyframes |
| Icons | `lucide-react` plus inline brand SVGs in `components/portfolio/brand-icons.tsx` |
| Database | MongoDB Atlas via `mongoose` `9` |
| Email | `nodemailer` `9` over SMTP |
| Notifications | `react-hot-toast` |
| Fonts & analytics | Geist, Geist Mono, Space Grotesk (`next/font/google`); `@vercel/analytics` in production only |

## 🚀 Getting Started

### Prerequisites

- **Node.js 20.19 or newer** with **npm** — Next.js 16 requires `>=20.9.0`, Mongoose 9 requires `>=20.19.0`
- A **MongoDB Atlas** cluster — the free M0 tier is sufficient
- An **SMTP account** for outbound email: Gmail with an App Password, or any provider such as Brevo, SendGrid, Zoho Mail or Outlook

### Installation

```bash
git clone https://github.com/theafzalhussain/Portfolio.git
cd Portfolio
npm install
```

> `package-lock.json` is committed, so npm is the primary path. A `pnpm-workspace.yaml` is also present — if you prefer pnpm, run `pnpm install` instead and let it generate its own lockfile.

### Environment setup

Create a `.env.local` file in the project root using the values described in [Environment Variables](#-environment-variables):

```bash
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/portfolio?retryWrites=true&w=majority
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=you@example.com
EMAIL_PASS=your-16-char-app-password
ADMIN_EMAIL=you@example.com
```

`.env` and `.env*.local` are already in `.gitignore`, so these values never get committed.

### Run

```bash
npm run dev      # development server on http://localhost:3000
npm run build    # optimized production build
npm run start    # serve the production build
```

Contact-route errors are logged to the same terminal with a `[contact]` prefix. When deploying (for example to Vercel), add every variable from `.env.local` to your host's environment settings and redeploy. Because serverless functions have no fixed IP, the Atlas cluster must allow access from anywhere (`0.0.0.0/0`) — this is covered in `SETUP_CONTACT_FORM.md`.

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string including the database name (e.g. `.../portfolio`). Read in `lib/mongodb.ts`, which throws if it is missing. | Yes |
| `EMAIL_HOST` | SMTP hostname, e.g. `smtp.gmail.com`. | Yes |
| `EMAIL_PORT` | SMTP port. `465` enables the transporter's `secure` flag; `587` / `25` leave it off. | Yes |
| `EMAIL_USER` | SMTP username. Also used verbatim as the `From` address on both outgoing emails. | Yes |
| `EMAIL_PASS` | SMTP password. For Gmail this must be a 16-character **App Password**, not the account password. | Yes |
| `ADMIN_EMAIL` | Recipient of the notification email. Falls back to the owner address hard-coded in `lib/mail.ts` when unset. | No |

> **Gmail users:** `SETUP_CONTACT_FORM.md` states this explicitly — a normal Gmail password will not authenticate. Turn on 2-Step Verification, generate an App Password at `myaccount.google.com/apppasswords`, and paste it without spaces as `EMAIL_PASS`. That document also mentions an `EMAIL_FROM` variable, but the current `lib/mail.ts` builds the `From` header from `EMAIL_USER`, so `EMAIL_FROM` is not read at runtime.

## 📜 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev` | Start the local development server. |
| `npm run build` | `next build` | Create an optimized production build. |
| `npm run start` | `next start` | Serve the production build. |
| `npm run lint` | `eslint .` | Lint the project. No ESLint config file or `eslint` dependency is committed yet, so both must be added before this script will run. |

## 📂 Project Structure

```text
Portfolio/
├── app/
│   ├── api/contact/route.ts     # POST /api/contact — validation, Mongo write, email dispatch
│   ├── globals.css              # Tailwind v4 theme, OKLCH tokens, keyframes, glass utilities
│   ├── layout.tsx               # Root layout: metadata, icons, viewport, Vercel Analytics
│   └── page.tsx                 # Single-page composition + react-hot-toast Toaster
├── components/
│   ├── portfolio/
│   │   ├── about.tsx            # Bio, tilt profile card, scroll-triggered count-up stats
│   │   ├── brand-icons.tsx      # Inline SVGs: GitHub, LinkedIn, WhatsApp, Instagram, Twitter
│   │   ├── certifications.tsx   # Certification cards with hover tilt
│   │   ├── contact.tsx          # Contact form, copy-email button, social links
│   │   ├── footer.tsx           # Dynamic-year footer with social links
│   │   ├── hero.tsx             # Headline, typewriter line, orbiting tech badges
│   │   ├── navbar.tsx           # Glass navbar, scroll progress, mobile drawer
│   │   ├── particle-field.tsx   # Canvas particle background + custom cursor
│   │   ├── projects.tsx         # Featured card + project grid
│   │   ├── resume.tsx           # Resume highlights + PDF download
│   │   └── skills.tsx           # Filterable skills grid
│   └── ui/button.tsx            # Base UI button with CVA variants
├── lib/
│   ├── models/Contact.ts        # Mongoose schema for contact submissions
│   ├── mail.ts                  # Nodemailer transporter + both HTML email templates
│   ├── mongodb.ts               # Globally cached Mongoose connection
│   └── utils.ts                 # cn() — clsx + tailwind-merge helper
├── public/                      # resume.pdf, images/ (project screenshots + avatar), favicons, apple-icon
├── SETUP_CONTACT_FORM.md        # Step-by-step contact backend setup guide
├── components.json              # shadcn CLI config (base-nova style, lucide icons)
├── next.config.mjs              # Turbopack root resolution
└── tsconfig.json                # Strict TS + @/* alias, plus postcss.config.mjs, pnpm-workspace.yaml
```

## 🔌 API Route

### `POST /api/contact`

Implemented in `app/api/contact/route.ts`. Expects `Content-Type: application/json`.

**Request body**

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | Yes | Trimmed; minimum 2 characters, maximum 100 |
| `email` | string | Yes | Trimmed; must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; maximum 200 characters |
| `subject` | string | No | Trimmed; stored as an empty string when omitted (schema max 150) |
| `message` | string | Yes | Trimmed; minimum 10 characters, maximum 5000 |

**Server-side flow**

1. Parse and trim the body, then apply the validation rules above — the first failure returns `400` with a specific message.
2. Open (or reuse) the cached Mongoose connection via `connectToDatabase()`.
3. Capture best-effort metadata: client IP from `x-forwarded-for` (first entry) or `x-real-ip`, plus the `user-agent` header.
4. Insert one document into the `contacts` collection with `name`, `email`, `subject`, `message`, `ip`, `userAgent` and automatic `createdAt` / `updatedAt` timestamps.
5. Await `sendContactEmails()`, which fires both messages concurrently with `Promise.allSettled` — the admin notification (with `Reply-To` set to the sender) and the sender's confirmation. All interpolated values are HTML-escaped.

**Responses**

| Status | Body |
|---|---|
| `200` | `{ "success": true, "message": "Message received." }` |
| `400` | `{ "error": "..." }` — the message names the failed rule, e.g. `Message must be at least 10 characters long.` |
| `500` | `{ "error": "Something went wrong. Please try again later." }` |

Email delivery is deliberately non-fatal: a rejected send is logged to the server console but the request still succeeds, because the submission is already persisted. A database failure, by contrast, reaches the `500` handler so a message is never silently lost.

## 🎨 Customization

### Use this as a template

Every section renders from a plain data array at the top of its own component, so making this portfolio your own is mostly a matter of editing literals:

| What to change | Where |
|---|---|
| Page title, description, favicons, theme color | `app/layout.tsx` |
| Section order, or removing a section entirely | `app/page.tsx` |
| Name, headline, typewriter phrases, orbiting badges, social links | `components/portfolio/hero.tsx` |
| Bio copy, statistics, education badge, avatar image | `components/portfolio/about.tsx` |
| Skill list and categories | `components/portfolio/skills.tsx` |
| Project entries — title, description, tags, images, live and source URLs | `components/portfolio/projects.tsx` |
| Resume highlights and download filename | `components/portfolio/resume.tsx` |
| Certifications and achievements | `components/portfolio/certifications.tsx` |
| Contact email, message length limit, social links | `components/portfolio/contact.tsx` |
| Navigation items | `components/portfolio/navbar.tsx` |
| Footer name and links | `components/portfolio/footer.tsx` |

**Theme colors.** Every color is an OKLCH custom property in the `:root` block of `app/globals.css`. Changing `--primary`, `--accent`, `--glow` and `--background` re-themes the whole site, including glows, badges and the toast styling in `app/page.tsx`; corner rounding derives from a single `--radius` token.

**Assets.** Replace `public/resume.pdf` with your own CV, drop project screenshots into `public/images/`, and swap `public/icon.svg`, `public/icon-light-32x32.png`, `public/icon-dark-32x32.png` and `public/apple-icon.png` for your own icons. In `components/portfolio/particle-field.tsx`, tune `GAP`, `INFLUENCE` and `LINK_DIST` for particle density, pointer-repulsion radius and link distance; that file also sets `document.body.style.cursor = 'none'` for the custom cursor, so remove that line to restore the native cursor.

## 🖼️ Screenshots

| Section | Preview |
|---|---|
| Hero | <!-- Replace with your screenshot: docs/screenshots/hero.png --> |
| Projects | <!-- Replace with your screenshot: docs/screenshots/projects.png --> |
| Skills | <!-- Replace with your screenshot: docs/screenshots/skills.png --> |
| Contact | <!-- Replace with your screenshot: docs/screenshots/contact.png --> |

## 🗺️ Roadmap

- [ ] Commit a `.env.example` template — referenced by `SETUP_CONTACT_FORM.md` but not yet present
- [ ] Add an ESLint config and dependency so `npm run lint` works out of the box
- [ ] Add server-side rate limiting and a spam honeypot to `POST /api/contact`
- [ ] Add Open Graph / Twitter card metadata and a `metadataBase` in `app/layout.tsx`
- [ ] Link real certificate URLs — currently `href: '#'` placeholders in `certifications.tsx`
- [ ] Optional light-theme variant; the app is dark-only today (`<html className="dark">`)
- [ ] Automated tests covering the contact route's validation branches

## 🤝 Contributing

This is a personal portfolio, so feature contributions are not the goal — but bug reports and fixes are genuinely welcome. Fork the repository, branch (`git checkout -b fix/short-description`), verify your change with `npm run build`, then open a pull request describing the problem and the fix. If you find a security issue in the contact pipeline, please reach out privately instead of opening a public issue.

## 📄 License

No license file is currently present in this repository, which means the work stays under exclusive copyright by default. If you would like others to reuse this code, adding an [MIT License](https://choosealicense.com/licenses/mit/) as `LICENSE` is the recommended next step.

## 👤 Author

**Afzal Hussain** — MERN stack developer, BCA student, based in India and open to remote work.

- GitHub: [@theafzalhussain](https://github.com/theafzalhussain)
- LinkedIn: [afzalhussain](https://www.linkedin.com/in/afzalhussain)
- Instagram: [@theafzalhussain](https://www.instagram.com/theafzalhussain)

<p align="center">Built with Next.js, Tailwind CSS and Framer Motion. If this project helped you, consider leaving a ⭐.</p>
