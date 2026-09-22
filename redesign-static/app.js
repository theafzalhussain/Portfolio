/* ══════════════════════════════════════════
   app.js — content + interactions
   ══════════════════════════════════════════ */

var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Primary: jsDelivr CDN in front of the Portfolio repo (fast, cached, stable).
   Fallback: the live site's Next.js image optimiser (q=75 is the only
   quality its config allows — other values return 400). */
var CDN = 'https://cdn.jsdelivr.net/gh/theafzalhussain/Portfolio@main/public/images/';
var NEXT = 'https://www.afzalhussain.tech/_next/image?url=%2Fimages%2F';

function shot(file) {
  return CDN + file;
}

function shotFallback(file, w) {
  return NEXT + encodeURIComponent(file) + '&w=' + (w || 1920) + '&q=75';
}

/* ── skills ─────────────────────────────── */
var I = {
  code: '<path d="M9.2 5 3.6 12l5.6 7M14.8 5l5.6 7-5.6 7"/>',
  brush: '<path d="M4 20c0-2.2 1.3-3 2.6-3.4M14.8 4.3 19.7 9.2 9.9 19a3.5 3.5 0 0 1-4.9-4.9Z"/><path d="M12.4 6.7l4.9 4.9"/>',
  braces: '<path d="M8.4 4.5C6.5 4.5 6.9 8 6.9 9.4c0 1.4-1.3 2.6-2.9 2.6 1.6 0 2.9 1.2 2.9 2.6 0 1.4-.4 4.9 1.5 4.9M15.6 4.5c1.9 0 1.5 3.5 1.5 4.9 0 1.4 1.3 2.6 2.9 2.6-1.6 0-2.9 1.2-2.9 2.6 0 1.4.4 4.9-1.5 4.9"/>',
  atom: '<circle cx="12" cy="12" r="2.1"/><ellipse cx="12" cy="12" rx="9.4" ry="3.9"/><ellipse cx="12" cy="12" rx="9.4" ry="3.9" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.4" ry="3.9" transform="rotate(120 12 12)"/>',
  layers: '<path d="m12 3 8.5 4.6L12 12.2 3.5 7.6 12 3Z"/><path d="m4 12 8 4.4 8-4.4M4 16.4l8 4.4 8-4.4"/>',
  waves: '<path d="M3 9.2c1.6-2.4 3.4-3.6 5.4-3.6 3 0 4 3.6 7.2 3.6 1.6 0 3.1-.9 4.4-2.6M3 16.4c1.6-2.4 3.4-3.6 5.4-3.6 3 0 4 3.6 7.2 3.6 1.6 0 3.1-.9 4.4-2.6"/>',
  bolt: '<path d="M13.2 2.5 4.6 13.6h6.2L9.9 21.5l8.6-11.1h-6.2l.9-7.9Z"/>',
  ts: '<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3"/><path d="M7 9.4h5M9.5 9.4v7.2M14 16.3c.6.4 1.3.6 2 .6 1.2 0 2-.6 2-1.5 0-1.9-3.8-1.2-3.8-3.4 0-1 .9-1.6 2-1.6.6 0 1.2.1 1.7.4"/>',
  server: '<rect x="3.2" y="4.2" width="17.6" height="6.2" rx="2"/><rect x="3.2" y="13.6" width="17.6" height="6.2" rx="2"/><path d="M7 7.3h.01M7 16.7h.01"/>',
  route: '<circle cx="6" cy="6.5" r="2.6"/><circle cx="18" cy="17.5" r="2.6"/><path d="M8.6 6.5h5.1a3.2 3.2 0 0 1 0 6.4h-3.4a3.2 3.2 0 0 0 0 6.4h5.1"/>',
  plug: '<path d="M9 3.2v4.4M15 3.2v4.4M6.4 7.6h11.2v3.6a5.6 5.6 0 0 1-11.2 0V7.6ZM12 16.8v4"/>',
  db: '<ellipse cx="12" cy="6.2" rx="7.6" ry="3"/><path d="M4.4 6.2v11.6c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3V6.2"/><path d="M4.4 12c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3"/>',
  stack: '<path d="M3.6 7.4 12 3.6l8.4 3.8L12 11.2 3.6 7.4Z"/><path d="m3.6 12.2 8.4 3.8 8.4-3.8M3.6 16.6l8.4 3.8 8.4-3.8"/>',
  signal: '<path d="M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8M8.6 15.4a4.8 4.8 0 0 1 0-6.8M15.4 8.6a4.8 4.8 0 0 1 0 6.8"/><circle cx="12" cy="12" r="1.5"/>',
  branch: '<circle cx="6.5" cy="5.5" r="2.4"/><circle cx="6.5" cy="18.5" r="2.4"/><circle cx="17.5" cy="9.5" r="2.4"/><path d="M6.5 7.9v8.2M8.9 9.5c2.6 0 6.2-.3 6.2 0M15.1 11.9c0 3.4-4 3.9-6.3 3.9"/>',
  rocket: '<path d="M12 2.8c3.4 2.4 5.2 6 5.2 10.2L12 17.6 6.8 13C6.8 8.8 8.6 5.2 12 2.8Z"/><circle cx="12" cy="9.6" r="1.8"/><path d="M8.6 17.2c-1.2 1.2-1.4 3-1.2 4 .9.2 2.8 0 4-1.2M15.4 17.2c1.2 1.2 1.4 3 1.2 4-.9.2-2.8 0-4-1.2"/>',
  device: '<rect x="6.4" y="2.6" width="11.2" height="18.8" rx="2.6"/><path d="M10.6 5.4h2.8"/><circle cx="12" cy="17.6" r="1.1"/>',
  card: '<rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.4"/><path d="M2.8 10h18.4M6.6 14.6h3.6"/>',
  shield: '<path d="M12 2.8 20 5.6v5.6c0 4.6-3.2 8.4-8 9.8-4.8-1.4-8-5.2-8-9.8V5.6L12 2.8Z"/><path d="m8.8 12 2.3 2.3 4.1-4.4"/>'
};

var SKILLS = [
  { n: 'HTML5',        c: 'frontend', i: 'code',   col: '#ff8904', note: 'Semantic, accessible markup' },
  { n: 'CSS3',         c: 'frontend', i: 'brush',  col: '#00d3f2', note: 'Layout, motion, design systems' },
  { n: 'JavaScript',   c: 'frontend', i: 'braces', col: '#ffb900', note: 'ES6+, async, DOM' },
  { n: 'TypeScript',   c: 'frontend', i: 'ts',     col: '#00d3f2', note: 'Typed props, safe refactors' },
  { n: 'React.js',     c: 'frontend', i: 'atom',   col: '#00e0e0', note: 'Component architecture, hooks' },
  { n: 'Next.js',      c: 'frontend', i: 'layers', col: '#e7ecea', note: 'App Router, SSR, route handlers' },
  { n: 'Tailwind CSS', c: 'frontend', i: 'waves',  col: '#38bdf8', note: 'Utility-first, mobile-first' },
  { n: 'Framer Motion',c: 'frontend', i: 'bolt',   col: '#f472b6', note: 'Purposeful interface motion' },
  { n: 'Node.js',      c: 'backend',  i: 'server', col: '#05df72', note: 'Runtime, scripts, workers' },
  { n: 'Express.js',   c: 'backend',  i: 'route',  col: '#b9c2be', note: 'Routing, middleware, validation' },
  { n: 'REST APIs',    c: 'backend',  i: 'plug',   col: '#00d492', note: '45+ endpoints shipped' },
  { n: 'Socket.IO',    c: 'backend',  i: 'signal', col: '#a78bfa', note: 'Real-time order state' },
  { n: 'BullMQ',       c: 'backend',  i: 'stack',  col: '#ff6f61', note: 'Background job queues' },
  { n: 'Razorpay',     c: 'backend',  i: 'card',   col: '#3b82f6', note: 'Payments + signature checks' },
  { n: 'MongoDB',      c: 'data',     i: 'db',     col: '#00d492', note: 'Atlas, Mongoose, 16 models' },
  { n: 'Redis',        c: 'data',     i: 'stack',  col: '#ff6f61', note: 'Caching with safe fallback' },
  { n: 'Git & GitHub', c: 'data',     i: 'branch', col: '#ff8904', note: 'Branching, PRs, Actions' },
  { n: 'Vercel',       c: 'data',     i: 'rocket', col: '#e7ecea', note: 'Preview + production deploys' },
  { n: 'PWA',          c: 'data',     i: 'device', col: '#4ade9f', note: 'Service workers, web push' },
  { n: 'Lighthouse',   c: 'data',     i: 'shield', col: '#ffb900', note: 'Core Web Vitals budgets' }
];

var CAT_LABEL = { frontend: 'Frontend', backend: 'Backend', data: 'Databases / Tools' };

function skillHTML(s) {
  return '' +
    '<article class="skill" data-cat="' + s.c + '" style="--sc:' + s.col + '">' +
      '<span class="skill-ico" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24">' + I[s.i] + '</svg>' +
      '</span>' +
      '<span class="skill-txt">' +
        '<strong>' + s.n + '</strong>' +
        '<span class="skill-cat">' + CAT_LABEL[s.c] + '</span>' +
        '<span class="skill-note">' + s.note + '</span>' +
      '</span>' +
    '</article>';
}

function renderSkills() {
  var grid = document.getElementById('skill-grid');
  if (!grid) return;
  grid.innerHTML = SKILLS.map(skillHTML).join('');
}

function initSkillFilters() {
  var chips = document.querySelectorAll('.chip[data-skill]');
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener('click', function () {
      Array.prototype.forEach.call(chips, function (c) {
        c.classList.remove('is-on');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('is-on');
      chip.setAttribute('aria-selected', 'true');

      var f = chip.getAttribute('data-skill');
      Array.prototype.forEach.call(document.querySelectorAll('.skill'), function (card) {
        var show = f === 'all' || card.getAttribute('data-cat') === f;
        if (show) {
          card.classList.remove('is-hidden');
          card.classList.add('is-fading');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { card.classList.remove('is-fading'); });
          });
        } else {
          card.classList.add('is-fading');
          window.setTimeout(function () {
            if (card.classList.contains('is-fading')) card.classList.add('is-hidden');
          }, REDUCED ? 0 : 220);
        }
      });
    });
  });
}

/* ── project data ───────────────────────── */
var PROJECTS = [
  {
    id: 'eshopper',
    name: 'eShopper',
    type: 'Full-stack commerce platform',
    year: '2026',
    tagsFilter: ['fullstack'],
    featured: true,
    image: 'eshopper.png',
    live: 'https://eshopperr.me',
    code: 'https://github.com/theafzalhussain/eshopper',
    summary:
      'A production fashion retail platform covering the entire commercial lifecycle — catalogue discovery, cart and coupon pricing, Razorpay checkout, fulfilment with delivery OTP, customer-initiated returns with automated refunds, and a membership tier system.',
    metrics: [
      { v: '30+', k: 'REST endpoints' },
      { v: '16', k: 'Data models' },
      { v: '~60%', k: 'Fewer DB reads' },
      { v: '90+', k: 'Lighthouse perf' }
    ],
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'Redis', 'BullMQ', 'Razorpay', 'Socket.IO', 'Sharp'],
    problem:
      'Most portfolio e-commerce demos stop at "add to cart". I wanted the parts that actually break in production: money movement, refunds, stale cache, image weight, and admin operations. The brief I set myself was a store a real operator could run.',
    built: [
      '<strong>Storefront and admin in one React app</strong> — category-scoped shop pages, product detail, faceted search with pagination, persistent cart and wishlist.',
      '<strong>Razorpay checkout with server-side signature verification</strong>, so a tampered client payload can never mark an order paid.',
      '<strong>Returns and refunds pipeline</strong> — customer-initiated returns, cron-driven auto-refunds, and idempotent refund jobs that are safe to retry.',
      '<strong>Membership tiers and a coupon engine</strong> that price the cart server-side rather than trusting client totals.',
      '<strong>Admin analytics dashboard</strong> with order, revenue and fulfilment views.'
    ],
    architecture:
      'One Node project produces three runnable processes from a single dependency tree: a React SPA storefront, an Express REST API, and a BullMQ worker. The frontend deploys to Vercel; the API deploys to Render via a GitHub Actions deploy hook. Sixteen Mongoose models back the domain, and a Vercel Edge middleware injects per-route canonical tags and JSON-LD into the SPA shell before crawlers see it.',
    decisions: [
      '<strong>Redis with an in-memory fallback.</strong> Caching cut repeat database reads by roughly 60%, but a managed Redis quota can run out. The cache layer degrades to process memory instead of taking the store down.',
      '<strong>Server-derived Socket.IO identity.</strong> Room membership is resolved on the server from the session, so no client can join the admin room by claiming to be an admin.',
      '<strong>Four worker queues</strong> for email, refunds, reports and image jobs — so a slow SMTP provider never blocks a checkout response.',
      '<strong>A sharp-powered WebP image proxy</strong> to keep product imagery off the critical path and inside the performance budget.'
    ],
    outcome:
      'Lighthouse Performance and SEO both land 90+ on the live storefront while serving a full catalogue, and the checkout path survives payment-provider and cache failures without data loss.'
  },
  {
    id: 'moviezone',
    name: 'MovieZone',
    type: 'Installable PWA · performance',
    year: '2026',
    tagsFilter: ['pwa', 'frontend'],
    image: 'moviezone.png',
    live: 'https://moviezone.dev',
    code: 'https://github.com/theafzalhussain/Moviezonne',
    summary:
      'A movie and TV discovery platform on the TMDB API, shipped as an installable PWA with a dedicated Smart TV interface, server-side SEO rendering, web push, and an automated performance test suite.',
    metrics: [
      { v: '~30', k: 'Automated checks' },
      { v: '24h', k: 'Stale fallback' },
      { v: '90+', k: 'Lighthouse PWA' },
      { v: '0', k: 'Framework deps' }
    ],
    stack: ['JavaScript', 'Express', 'TMDB API', 'Service Worker', 'Web Push', 'SSR', 'PWA'],
    problem:
      'Third-party media APIs are slow, rate-limited and occasionally down. A discovery UI that reads TMDB directly from the browser feels broken the moment the upstream hiccups — and a hash-routed SPA is invisible to search crawlers.',
    built: [
      '<strong>A hardened proxy layer</strong> — the browser never talks to TMDB. Every upstream call passes through an in-memory cache with request coalescing, retry with backoff, dual-hostname failover, and a 24-hour stale fallback.',
      '<strong>A second server-rendered layer</strong> that generates real crawlable URLs for every title, category and A–Z hub, on top of the hash-routed client.',
      '<strong>Installable PWA</strong> with a service worker, asset cache invalidation and web push notifications.',
      '<strong>A separate TV module</strong> that takes over D-pad navigation for Smart TV browsers.',
      '<strong>Around thirty standalone Node checks</strong> gating Core Web Vitals, SSR output, sitemap sharding, feed pagination, TV layout parity and upstream resilience.'
    ],
    architecture:
      'Vanilla JavaScript client — no framework, no bundler — served alongside an Express proxy and a dedicated SSR entry point. Sitemaps are sharded and rebuilt on a schedule through GitHub Actions, and the performance suite runs as a gate rather than a manual audit.',
    decisions: [
      '<strong>No framework, on purpose.</strong> The app is content-heavy and render-light; shipping zero framework bytes was the cheapest route to the Core Web Vitals target.',
      '<strong>Request coalescing</strong> so a burst of identical requests collapses into one upstream call instead of hammering a rate-limited API.',
      '<strong>Stale-while-broken</strong> — serving 24-hour-old data beats serving an error page when the provider is unreachable.',
      '<strong>Performance as a test, not a vibe.</strong> If a change regresses a Core Web Vital or SSR output, a check fails.'
    ],
    outcome:
      'Lighthouse PWA and SEO audits both score 90+, the app stays usable when TMDB is throttled, and every title has a crawlable server-rendered URL.'
  },
  {
    id: 'chronicle',
    name: 'The Chronicle',
    type: 'Bilingual news application',
    year: '2025',
    tagsFilter: ['frontend', 'next'],
    image: 'news.png',
    live: 'https://mynews-web.vercel.app',
    code: 'https://github.com/theafzalhussain/News-Web',
    summary:
      'English and Hindi news discovery across eight categories, aggregating the GNews API and RSS feeds into a single normalised, deduplicated timeline with search and infinite scrolling.',
    metrics: [
      { v: '8', k: 'Categories' },
      { v: '2', k: 'Languages' },
      { v: '~50%', k: 'Fewer API calls' },
      { v: '2', k: 'Feed sources' }
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'SWR', 'GNews API', 'RSS'],
    problem:
      'News APIs have tight free-tier quotas, inconsistent payload shapes and duplicate stories across sources. Naive fetching burns the quota by lunchtime and shows the same headline four times.',
    built: [
      '<strong>A normalisation layer</strong> that maps GNews items and raw RSS entries into one internal article shape.',
      '<strong>Deduplication</strong> across sources so the same story from two publishers collapses into one card.',
      '<strong>Caching with stale-data fallback</strong> that cut outbound API calls by roughly 50% and keeps the feed populated when the quota is exhausted.',
      '<strong>Bilingual routing</strong> for English and Hindi across eight categories, with search and infinite scrolling.'
    ],
    architecture:
      'Next.js App Router with TypeScript, SWR for client-side revalidation, and server routes that fan out to GNews and RSS in parallel before normalising, deduplicating and caching the merged result.',
    decisions: [
      '<strong>Normalise at the boundary.</strong> Components never see a provider-specific field, so adding a third source is a mapper, not a refactor.',
      '<strong>SWR over manual state.</strong> Revalidation, focus refetch and cache sharing came free and removed a class of loading bugs.',
      '<strong>Cache before quota, not after.</strong> The fallback path is the default read path, so quota exhaustion degrades quality rather than breaking the page.'
    ],
    outcome:
      'A bilingual feed that stays fast and populated on a free API tier, with roughly half the outbound requests of the naive implementation.'
  },
  {
    id: 'explorer',
    name: 'World Explorer',
    type: 'Typed full-stack data explorer',
    year: '2025',
    tagsFilter: ['fullstack', 'frontend'],
    image: 'restcountry.png',
    live: 'https://myrest-country.vercel.app',
    code: 'https://github.com/theafzalhussain/New-RestCountry',
    summary:
      'An explorer for 250 countries with debounced search, region filters, sorting, border navigation and detailed country views over a typed Express API.',
    metrics: [
      { v: '250', k: 'Countries' },
      { v: '300ms', k: 'Search debounce' },
      { v: '~70%', k: 'Fewer requests' },
      { v: '100%', k: 'Typed API layer' }
    ],
    stack: ['React', 'TypeScript', 'Express', 'Tailwind CSS', 'TanStack Query'],
    problem:
      'Search-as-you-type over a large dataset is where junior implementations fall apart — a request per keystroke, race conditions that render stale results, and no caching between navigations.',
    built: [
      '<strong>300ms debounced search</strong> so a typed query costs one request, not twelve.',
      '<strong>TanStack Query caching</strong> that cut redundant network requests by roughly 70% across filter and navigation changes.',
      '<strong>Region filters, sorting and border navigation</strong> — clicking a neighbouring country jumps straight into its detail view.',
      '<strong>A typed Express API with request validation</strong>, so malformed query parameters fail at the boundary with a clear error.'
    ],
    architecture:
      'React and TypeScript on the client, TanStack Query as the cache and request layer, and a typed Express API that validates and shapes upstream country data before it reaches the UI.',
    decisions: [
      '<strong>Query cache as the source of truth</strong> rather than local component state — navigating back is instant and stale results cannot win a race.',
      '<strong>Validate at the API boundary</strong> so the client never has to defend against malformed upstream payloads.',
      '<strong>Debounce tuned to 300ms</strong> — fast enough to feel live, slow enough to collapse a typed word into one request.'
    ],
    outcome:
      'Instant-feeling search and navigation across 250 records with roughly 70% fewer network requests than an uncached implementation.'
  },
  {
    id: 'portfolio',
    name: 'This portfolio',
    type: 'Next.js site with contact pipeline',
    year: '2026',
    tagsFilter: ['frontend', 'next'],
    image: 'afzalavatar.png',
    live: 'https://www.afzalhussain.tech',
    code: 'https://github.com/theafzalhussain/Portfolio',
    summary:
      'A recruiter-facing site built from reusable TypeScript components, with a real server-side contact pipeline rather than a decorative form.',
    metrics: [
      { v: '20+', k: 'Components' },
      { v: '95+', k: 'Accessibility' },
      { v: '5/min', k: 'Rate limit' },
      { v: '2', k: 'Emails per send' }
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'MongoDB', 'Mongoose', 'Nodemailer'],
    problem:
      'A portfolio contact form that opens a mail client is a dead end — and an unprotected API route is a spam magnet. I wanted a submission path that persists the message even if email delivery fails.',
    built: [
      '<strong>A real route handler</strong> that validates the payload server-side and returns specific field errors.',
      '<strong>A hidden honeypot field plus per-IP sliding-window rate limiting</strong> — filled honeypot returns 400, excess traffic returns 429.',
      '<strong>MongoDB persistence through Mongoose</strong>, capturing message, IP, user agent and timestamps.',
      '<strong>Two transactional emails</strong> fired concurrently — an owner notification with the sender set as Reply-To, and a confirmation to the sender, with every interpolated value HTML-escaped.'
    ],
    architecture:
      'Next.js App Router, a cached Mongoose connection reused across invocations, and a POST handler that persists before it sends. Email delivery is deliberately non-fatal: a rejected send is logged but the request still succeeds, because the message is already stored. A database failure, by contrast, returns a 500 so a message is never silently lost.',
    decisions: [
      '<strong>Persist first, notify second.</strong> Storage is the source of truth; email is a notification channel that is allowed to fail.',
      '<strong>Escape everything.</strong> Every user-supplied value is HTML-escaped before it enters an email template.',
      '<strong>Honeypot plus rate limit, not CAPTCHA.</strong> Two cheap deterrents beat a friction-heavy widget on a hiring page.'
    ],
    outcome:
      '95+ Lighthouse Accessibility with a mobile-first layout, and a contact path where a submission survives an email outage.'
  }
];

/* ── render project cards ───────────────── */
function metricHTML(m) {
  return '<div><b>' + m.v + '</b><span>' + m.k + '</span></div>';
}

function tagHTML(t) {
  return '<li>' + t + '</li>';
}

function cardHTML(p) {
  var isF = !!p.featured;
  var inner =
    '<div class="proj-shot">' +
      '<span class="shot-badge is-live"><span class="dot"></span>Live</span>' +
      '<img src="' + shot(p.image) + '" alt="Screenshot of ' + p.name + '" ' +
        'loading="lazy" decoding="async" ' +
        'onerror="this.onerror=null;this.src=\'' + shotFallback(p.image, 1920) + '\'">' +
    '</div>' +
    '<div class="proj-body">' +
      '<p class="proj-kicker">' +
        (isF ? '<b>Featured</b><span aria-hidden="true">·</span>' : '') +
        '<span>' + p.type + '</span><span aria-hidden="true">·</span><span>' + p.year + '</span>' +
      '</p>' +
      '<h3 class="proj-title">' + p.name + '</h3>' +
      '<p class="proj-sum">' + p.summary + '</p>' +
      '<div class="proj-metrics">' + p.metrics.map(metricHTML).join('') + '</div>' +
      '<ul class="tags">' + p.stack.slice(0, isF ? 10 : 6).map(tagHTML).join('') + '</ul>' +
      '<div class="proj-links">' +
        '<button class="solid-btn" type="button" data-case="' + p.id + '">Read case study' +
          '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
        '</button>' +
        '<a class="ghost-btn" href="' + p.live + '" target="_blank" rel="noreferrer noopener">Live site</a>' +
        '<a class="ghost-btn" href="' + p.code + '" target="_blank" rel="noreferrer noopener">Source</a>' +
      '</div>' +
    '</div>';

  return '<article class="proj' + (isF ? ' is-featured' : '') + '" data-cat="' + p.tagsFilter.join(' ') + '" data-reveal' + (isF ? '' : ' data-tilt') + '>' +
    (isF ? '<div class="proj-split">' + inner + '</div>' : inner) +
    '</article>';
}

function renderProjects() {
  var grid = document.getElementById('project-grid');
  if (!grid) return;
  grid.innerHTML = PROJECTS.map(cardHTML).join('');
}

/* ── case study modal ───────────────────── */
function listHTML(items) {
  return '<ul>' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
}

function caseHTML(p) {
  return '' +
    '<div class="cs-head">' +
      '<p class="proj-kicker"><b>Case study</b><span aria-hidden="true">·</span><span>' + p.type + '</span><span aria-hidden="true">·</span><span>' + p.year + '</span></p>' +
      '<h3 id="modal-title">' + p.name + '</h3>' +
      '<p class="cs-sum">' + p.summary + '</p>' +
    '</div>' +
    '<div class="cs-shot">' +
      '<img src="' + shot(p.image) + '" alt="Screenshot of ' + p.name + '" loading="lazy" decoding="async" ' +
      'onerror="this.onerror=null;this.src=\'' + shotFallback(p.image, 1920) + '\'">' +
    '</div>' +
    '<div class="cs-body">' +
      '<div class="cs-metrics">' + p.metrics.map(metricHTML).join('') + '</div>' +
      '<div class="cs-block"><h4>The problem</h4><p>' + p.problem + '</p></div>' +
      '<div class="cs-block"><h4>What I built</h4>' + listHTML(p.built) + '</div>' +
      '<div class="cs-two">' +
        '<div class="cs-block"><h4>Architecture</h4><p>' + p.architecture + '</p></div>' +
        '<div class="cs-block"><h4>Engineering decisions</h4>' + listHTML(p.decisions) + '</div>' +
      '</div>' +
      '<div class="cs-block"><h4>Outcome</h4><p>' + p.outcome + '</p></div>' +
      '<div class="cs-block"><h4>Full stack</h4><ul class="tags">' + p.stack.map(tagHTML).join('') + '</ul></div>' +
      '<div class="cs-foot">' +
        '<a class="solid-btn lg" href="' + p.live + '" target="_blank" rel="noreferrer noopener">Open live site</a>' +
        '<a class="ghost-btn lg" href="' + p.code + '" target="_blank" rel="noreferrer noopener">View source</a>' +
      '</div>' +
    '</div>';
}

var lastFocus = null;

function openCase(id) {
  var p = PROJECTS.filter(function (x) { return x.id === id; })[0];
  var modal = document.getElementById('modal');
  var body = document.getElementById('modal-body');
  if (!p || !modal || !body) return;

  lastFocus = document.activeElement;
  body.innerHTML = caseHTML(p);
  modal.hidden = false;
  document.body.classList.add('is-locked');
  var x = modal.querySelector('.modal-x');
  if (x) x.focus();
}

function closeCase() {
  var modal = document.getElementById('modal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('is-locked');
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

/* ── filters ────────────────────────────── */
function initFilters() {
  var chips = document.querySelectorAll('.chip[data-filter]');
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener('click', function () {
      Array.prototype.forEach.call(chips, function (c) {
        c.classList.remove('is-on');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('is-on');
      chip.setAttribute('aria-selected', 'true');

      var f = chip.getAttribute('data-filter');
      var cards = document.querySelectorAll('.proj');

      Array.prototype.forEach.call(cards, function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(' ');
        var show = f === 'all' || cats.indexOf(f) !== -1;

        if (show) {
          card.classList.remove('is-hidden');
          card.classList.add('is-fading');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { card.classList.remove('is-fading'); });
          });
        } else {
          card.classList.add('is-fading');
          window.setTimeout(function () {
            if (card.classList.contains('is-fading')) card.classList.add('is-hidden');
          }, REDUCED ? 0 : 260);
        }
      });
    });
  });
}

/* ── typewriter ─────────────────────────── */
function initTypewriter() {
  var el = document.getElementById('typewriter');
  if (!el) return;
  var words = ['"Frontend Developer"', '"React Engineer"', '"Next.js Developer"', '"Web Developer"'];

  if (REDUCED) { el.textContent = words[0]; return; }

  var wi = 0, ci = 0, del = false;

  function tick() {
    var w = words[wi];
    el.textContent = w.slice(0, ci);

    if (!del && ci < w.length) { ci++; window.setTimeout(tick, 72); }
    else if (!del && ci === w.length) { del = true; window.setTimeout(tick, 1700); }
    else if (del && ci > 0) { ci--; window.setTimeout(tick, 34); }
    else { del = false; wi = (wi + 1) % words.length; window.setTimeout(tick, 320); }
  }
  tick();
}

/* ── counters ───────────────────────────── */
function initCounters() {
  var nodes = document.querySelectorAll('[data-count]');
  if (!nodes.length) return;

  function run(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (REDUCED) { el.textContent = target + suffix; return; }

    var start = null;
    var dur = 1250;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(nodes, run);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });

  Array.prototype.forEach.call(nodes, function (n) { io.observe(n); });
}

/* ── reveal on scroll ───────────────────── */
function initReveal() {
  var nodes = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || REDUCED) {
    Array.prototype.forEach.call(nodes, function (n) { n.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e, i) {
      if (!e.isIntersecting) return;
      var el = e.target;
      window.setTimeout(function () { el.classList.add('is-in'); }, Math.min(i * 70, 280));
      io.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
  Array.prototype.forEach.call(nodes, function (n) { io.observe(n); });
}

/* ── 3D tilt on cards ───────────────────── */
function initTilt() {
  if (REDUCED || window.matchMedia('(hover: none)').matches) return;
  var nodes = document.querySelectorAll('[data-tilt]');

  Array.prototype.forEach.call(nodes, function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        'perspective(1000px) rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' +
        (py * -7).toFixed(2) + 'deg) translateY(-4px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });
}

/* ── nav: progress, stuck, active link ──── */
function initNav() {
  var nav = document.getElementById('nav');
  var fill = document.getElementById('nav-fill');
  var top = document.getElementById('to-top');
  var links = document.querySelectorAll('.nav-links a[data-nav]');
  var sections = [];

  Array.prototype.forEach.call(links, function (a) {
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) sections.push({ link: a, el: el });
  });

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? Math.min(100, Math.max(0, (y / h) * 100)) : 0;

    if (fill) fill.style.width = pct + '%';
    if (nav) nav.classList.toggle('is-stuck', y > 12);
    if (top) top.hidden = y < 700;

    var mid = y + window.innerHeight * 0.32;
    var current = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= mid) current = s;
    });
    sections.forEach(function (s) {
      s.link.classList.toggle('is-active', s === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (top) {
    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }
}

/* ── theme + drawer ─────────────────────── */
function initChrome() {
  var btn = document.getElementById('theme-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      var next = !document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark', next);
      try { localStorage.setItem('ah-theme', next ? 'dark' : 'light'); } catch (e) {}
    });
  }

  var menu = document.getElementById('menu-btn');
  var drawer = document.getElementById('drawer');
  if (menu && drawer) {
    menu.addEventListener('click', function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () {
        drawer.hidden = true;
        menu.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ── contact form ───────────────────────── */
function initForm() {
  var form = document.getElementById('contact-form');
  var note = document.getElementById('form-note');
  if (!form || !note) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var name = String(d.get('name') || '').trim();
    var email = String(d.get('email') || '').trim();
    var subject = String(d.get('subject') || '').trim() || 'Frontend role — enquiry';
    var message = String(d.get('message') || '').trim();

    note.classList.remove('is-err');

    if (!name || !email || message.length < 10) {
      note.classList.add('is-err');
      note.textContent = 'Please add your name, a valid email, and a message of at least 10 characters.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.classList.add('is-err');
      note.textContent = 'That email address does not look right.';
      return;
    }

    var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
    window.location.href =
      'mailto:theafzalhussain786@gmail.com?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    note.textContent = 'Opening your email app — if nothing happens, write directly to theafzalhussain786@gmail.com.';
  });
}

/* ── preloader ──────────────────────────── */
function initPreloader() {
  var pre = document.getElementById('preloader');
  var fill = document.getElementById('pre-fill');
  var pct = document.getElementById('pre-pct');
  if (!pre) return;

  function finish() {
    if (fill) fill.style.width = '100%';
    if (pct) pct.textContent = '100';
    window.setTimeout(function () { pre.classList.add('is-done'); }, 260);
  }

  if (REDUCED) { finish(); return; }

  var v = 0;
  var timer = window.setInterval(function () {
    v = Math.min(92, v + Math.random() * 16 + 6);
    var clamped = Math.max(0, Math.min(100, Math.round(v)));
    if (fill) fill.style.width = clamped + '%';
    if (pct) pct.textContent = String(clamped);
    if (v >= 92) window.clearInterval(timer);
  }, 130);

  var done = false;
  function settle() {
    if (done) return;
    done = true;
    window.clearInterval(timer);
    finish();
  }

  window.addEventListener('load', function () { window.setTimeout(settle, 320); });
  window.setTimeout(settle, 2600);
}

/* ── boot ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initPreloader();
  renderProjects();
  renderSkills();
  initFilters();
  initSkillFilters();
  initTypewriter();
  initCounters();
  initReveal();
  initTilt();
  initNav();
  initChrome();
  initForm();

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('[data-case]') : null;
    if (trigger) { openCase(trigger.getAttribute('data-case')); return; }
    if (e.target.closest && e.target.closest('[data-close]')) { closeCase(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCase();
  });
});
