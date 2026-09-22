# Premium redesign — static build

A self-contained, dependency-free build of the portfolio redesign. Nothing here touches the
Next.js app in the repository root, so `main` keeps deploying exactly as it does today.

**Files**

| File | Role |
| --- | --- |
| `index.html` | Markup and section order |
| `styles.css` | Design system (tokens, glass surfaces, responsive rules, dark/light) |
| `app.js` | Project data, case study modals, skills grid, filters, nav, counters, form |
| `scene.js` | WebGL hero — three.js core, orbit system, orbiting skill labels |
| `constellation.js` | Page-wide constellation network background (2D canvas) |

## Preview it locally

```bash
cd redesign-static
python3 -m http.server 8080
# open http://127.0.0.1:8080
```

No build step and no `npm install` — Tailwind loads from a pinned CDN and three.js is
imported as an ES module at runtime.

## What's inside

**Projects section** — each project carries a screenshot, three to four hard metrics, stack
chips, and a full case study modal covering the problem, what was built, the architecture,
the engineering decisions and the measured outcome. Filter chips switch between
All / Full-stack / Frontend / PWA / Next.js. Every "Source" button points at its real
repository.

**Skills section** — twenty entries across Frontend / Backend / Databases & tools, each with
a one-line proof rather than a bare logo ("Atlas, Mongoose, 16 models" instead of just
"MongoDB").

**Hero 3D** — a distorted liquid-metal icosahedron inside a counter-rotating wireframe cage,
with four tilted orbit planes carrying rings, satellites and DOM-rendered skill labels that
are projected from 3D space each frame. Labels are real HTML, so the text stays crisp.

**Constellation background** — a fixed 2D canvas behind the whole page: drifting nodes,
proximity links and a glow that lags the pointer.

## Behaviour worth preserving if you port this

- **The 3D scene pauses when the hero scrolls out of view** (`IntersectionObserver`), so the
  GPU stops working while someone reads the rest of the page.
- **Materials react to the theme.** A metallic mint body reflects to white on a light
  background and disappears, so light mode switches to a dark, diffuse body with softer
  lights.
- **It fails silently.** WebGL is probed on a throwaway canvas and the three.js `import()` is
  wrapped in try/catch. No WebGL, a blocked CDN, or `prefers-reduced-motion` all leave the
  canvas transparent and the hero reads as a normal typographic layout.
- **The orbit labels are guarded against the headline.** The fade boundary is measured from
  the live bounding box of `.hero-copy` each layout pass, not a hardcoded percentage, so a
  label dims as it swings over the text instead of colliding with it. Verified across
  1200–1920px with no collisions, no overlaps and no clipped labels.
- **`prefers-reduced-motion`** stops the typewriter, marquee, vertex distortion, reveals,
  orbit motion and smooth scrolling.

## Content accuracy

Education reads **MCA · IGNOU (in progress)** and **BCA · First Division, Maharshi Dayanand
University, Rohtak**. The root app currently states "pursuing BCA from IGNOU", which
contradicts the resume — that is fixed here.

Also corrected: animated counters instead of `0+`, a clamped preloader percentage, one
canonical LinkedIn URL (`/in/theafzalhussain`), no placeholder certificate links, and no
unverifiable testimonials.

## Deploying it

Two options:

1. **Vercel project with root directory `redesign-static`** — deploys as a static site, no
   framework preset needed.
2. **Port into the Next.js app** — see `PORTFOLIO_REDESIGN_GUIDE.md` for the
   section-to-component mapping and the React Three Fiber notes.

## Known follow-ups

- `public/images/moviezone.png` (1.86 MB) and `news.png` (1.16 MB) should be converted to
  WebP. Screenshots in this build load from jsDelivr in front of the repo; inside the Next.js
  app, use `next/image` with local paths instead.
- The live World Explorer demo currently renders "Showing 0 results". Worth fixing before
  sharing the portfolio with recruiters, since the card links straight to it.
