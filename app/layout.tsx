import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
// Self-hosted fonts (Fontsource): no build-time network dependency and the
// woff2 files are served from our own origin — faster than Google Fonts and
// no third-party request at runtime. The family names ('Geist', 'Geist Mono',
// 'Space Grotesk') match the tokens used in app/globals.css.
import '@fontsource/geist/400.css'
import '@fontsource/geist/500.css'
import '@fontsource/geist/600.css'
import '@fontsource/geist/700.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const SITE_URL = 'https://www.afzalhussain.tech'
const SITE_TITLE = 'Afzal Hussain — MERN Stack Developer'
const SITE_DESCRIPTION =
  'Portfolio of Afzal Hussain, a MERN stack developer building scalable, high-performance web applications with React, Node.js, Express, and MongoDB.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s — Afzal Hussain',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Afzal Hussain',
    'MERN Stack Developer',
    'React Developer',
    'Node.js Developer',
    'Full Stack Developer',
    'Portfolio',
  ],
  authors: [{ name: 'Afzal Hussain', url: 'https://github.com/theafzalhussain' }],
  creator: 'Afzal Hussain',
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Afzal Hussain — Portfolio',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Afzal Hussain — MERN Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@theafzalhussain',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
    { media: '(prefers-color-scheme: light)', color: '#f6f8fa' },
  ],
}

// Runs before first paint: if the visitor previously chose the light
// theme, swap the root class immediately so there is no dark-theme flash.
const themeInitScript = `(function(){try{if(localStorage.getItem('theme')==='light'){var c=document.documentElement.classList;c.remove('dark');c.add('light')}}catch(e){}})()`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
