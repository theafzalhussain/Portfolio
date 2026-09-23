import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Resolves this folder's absolute path and hands it to Turbopack as the
    // project root.
    root: path.resolve('.'),
  },

  // No value to a visitor, one extra header on every response.
  poweredByHeader: false,

  images: {
    // AVIF first: the project screenshots are large flat-colour UI captures,
    // which is exactly the case where AVIF beats WebP by a wide margin.
    formats: ['image/avif', 'image/webp'],
    // Only the widths the layout can actually request — the default list
    // generates several sizes this site never serves.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 128, 256, 384],
    // Next 16 requires every `quality` a component asks for to be declared up
    // front, so the optimizer can't be driven into generating arbitrary
    // variants by a crafted URL. These are exactly the three in use: 75 is the
    // default for any <Image> without the prop, 80 is the project screenshots,
    // 85 is the portrait in About.
    qualities: [75, 80, 85],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  experimental: {
    // Rewrites barrel imports (`lucide-react`) into per-icon paths so only the
    // icons actually rendered end up in the bundle.
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
