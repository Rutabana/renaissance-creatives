
# CLAUDE.md - Renaissance Edition Portfolio

## Project Overview
"The Renaissance Edition" is a high-end, cinematic creative portfolio for Rutabana. It features immersive scroll-based animations, a bento-grid layout for multidisciplinary works, and a sophisticated editorial aesthetic.

## Tech Stack
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS 4 (using `@import "tailwindcss";` in `index.css`)
- **Animations:** Framer Motion (`motion/react`)
- **3D:** React Three Fiber + Drei (`@react-three/fiber`, `@react-three/drei`)
- **Icons:** Lucide React

## Core Scripts
- `npm run dev`: Starts development server on port 3000
- `npm run build`: Builds the application for production
- `npm run lint`: Runs TypeScript type checking
- `npm run clean`: Removes the `dist` folder

## Key Components & Architecture
- **`src/App.tsx`**: Single file containing all components, scroll logic, and section definitions.
- **`WomanModel`**: 3D GLB model (`/woman.glb`) rendered via React Three Fiber. Scroll scrubs her animation via `mixer.setTime()`.
- **`WomanScene`**: Canvas wrapper for the 3D woman, positioned on the right half of the hero.
- **`CharacterLayer`**: Handles the left hero character (Man image) with scroll-based translation, rotation, and scaling.
- **`BentoCard`**: Reusable card component for the Polymath bento grid.
- **`PortfolioGallery`**: Main wrapper managing all `useScroll` / `useTransform` values.

## Scroll Architecture
- **Single scroll driver**: Everything is driven by `scrollYProgress` from `containerRef` (`["start start", "end end"]`). There is no separate `heroScroll` — it was removed.
- **Page height**: ~300vh total (1 screen sticky hero + 200vh spacer).
- **Hero is sticky**: `h-screen sticky top-0 z-0` — stays in place while the spacer scrolls past.
- **Burn transition**: Starts at ~15% scroll, circle fully open by ~60%. Polymath content fades in 55–75%.

## Current Page Structure
The page currently has **one section** — the Hero — plus the burn transition revealing the Polymath bento grid in place. Journey and Guild sections were removed.

```
[Sticky Hero — full screen]
  ├── Background (hero_bg image, multiply overlay, grain)
  ├── 3D Woman (right half, scroll-scrubbed animation)
  ├── Man image (CharacterLayer, left)
  └── Center title + neon props

[Fixed Burn Layer — z-90]
  ├── Outer div: SVG feTurbulence filter (jagged organic edge)
  ├── Inner div: clip-path circle expanding 0%→150%
  │     ├── /ship-background.jpg (revealed content)
  │     ├── Dark gradient overlay
  │     ├── Char burn gradient at edge
  │     └── Polymath bento content (fades in after burn completes)
  └── Amber glow ring (tracks advancing edge, fades out)
```

## Design Patterns & Animations
- **Hero background**: `brightness-[0.75] saturate-[1.8] contrast-[1.15]` on image + `bg-[#0a0a2a] mix-blend-multiply` overlay + grain texture. Makes dark tones collapse while saturated colors (blues) punch through.
- **3D Woman**: Scale `1.44`, positioned lower-center-right. Scroll scrubs animation via `action.paused=false → action.time=target → mixer.update(0) → action.paused=true`. Moves left (`position.x = -p * 1.2`) as scroll progresses.
- **Burn transition**: `clip-path: circle(0%→150% at 50% 50%)` animated via Framer Motion string interpolation. SVG `feTurbulence` + `feDisplacementMap` (scale=42) on the outer wrapper distorts the clip edge for an organic fire-on-parchment look. Amber radial glow ring tracks the edge.
- **Typography**: Serif italic for headings, sans-serif for UI, mono for labels.

## Asset Management
Creative assets generated via `src/services/imageService.ts` using Gemini:
- `hero_bg`: Vibrant high-contrast background
- `abstract`: Used in Visual Arts BentoCard
- `local`: Used in Curation BentoCard

**`/public` is now empty** — every media asset is served from the CDN. The only
remaining local-path references are `ASSETS.hero_subject_woman` (`/woman-1.png`)
and `ASSETS.hero_subject_man` (`/man-1.png`), which have never existed on disk.

### CDN (S3 + CloudFront, proxied same-origin at `/cdn`)
Media lives on S3 bucket `cafecollective-assets-eu-central-1-226198813365-eu-central-1-an`
under prefix **`rennaissance-creatives/`**, fronted by
`https://d3s90ejqky0l1n.cloudfront.net`.

**Do not reference the CloudFront host directly in app code.** Almost every asset
here is fetched by three.js / react-globe.gl / canvas with
`crossOrigin="anonymous"`, and the bucket still sends no
`Access-Control-Allow-Origin` (`LightsailAPIUser` is denied `s3:PutBucketCORS`).
Instead the CDN is exposed under a **same-origin path, `/cdn/*`**, which removes
the CORS check entirely:

| Environment | Proxy mechanism |
|---|---|
| production (Vercel) | `rewrites` entry in `vercel.json` |
| `vite dev` / `vite preview` | `server.proxy` / `preview.proxy` in `vite.config.ts` |

`src/data/cdn.ts` exports `CDN = "/cdn"` (plus `CDN_ORIGIN` / `CDN_PREFIX` for
documentation). **Both proxies must stay in sync** — change one, change the other.

Bucket layout under `rennaissance-creatives/`:
```
models/    women.glb (33 MB)
images/    bg.avif, ship-background.jpg, church-background.jpg, pirate-map.jpeg, bg.png (legacy)
books/     cover-1..4.png
birds/     bird1..3.png
textures/  grass-1..3.webp, dirt-road.webp
textures/originals/  grass-1..3-4k.png, dirt-road-4k.png  (backup of the pre-downsize files)
```

**Texture downsizing (2026-08-18):** the garden textures were 4K PNGs totalling
~43 MB. They are now 1024 px (grass) / 2048 px (road) WebP at ~1.05 MB total —
a 97% cut with no visible loss at `alphaTest: 0.4` billboard scale. The 4K
originals are preserved under `textures/originals/`. Regenerate with:
```bash
cwebp -q 85 -alpha_q 100 -resize 1024 0 in.png -o out.webp
```

**If bucket CORS ever gets fixed** (admin creds + CloudFront response-headers
policy forwarding `Origin`), the proxy can be dropped by setting
`CDN = CDN_ORIGIN + CDN_PREFIX` in `src/data/cdn.ts`. Not required — the proxy
works and keeps everything on one origin.

## Deployment (Vercel)
- Vercel project **`chelsea`** under scope `loic-rutabanas-projects`, connected to
  GitHub `Rutabana/renaissance-creatives`.
- Production domain: **https://chelsea.loic-rutabana.com** (`A` → `76.76.21.21`,
  matching the other `*.loic-rutabana.com` subdomains). DNS zone is Route53.
- `vercel.json` holds the `/cdn` rewrite, the SPA fallback, and long-lived
  `Cache-Control` on `/cdn/*`.
- Deploy manually with `vercel deploy --prod --yes`. **Note:** the GitHub
  connection means a push to `main` triggers its own production build — make sure
  the CDN work is merged to `main` before relying on git-driven deploys.
- Optional env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) enable the
  finale comment box; without them it falls back to `localStorage`.

## Design Reference
Modelled after https://www.shopify.com/editions/winter2026.
Key inspiration: dark multiply overlay, vibrant saturated colors popping against dark background, cinematic scroll-linked transitions.

## Current Progress & Known Issues
### Done ✓
- Hero section with 3D woman (scroll-scrubbed animation) + man image (CharacterLayer)
- Cinematic hero background: multiply overlay, grain, vibrant color treatment
- Fire-on-parchment burn transition: SVG turbulence displacement, amber glow ring, expanding circle clip-path
- Polymath bento grid embedded inside burn layer (fades in after burn)
- Removed Journey and Guild sections (focus on hero + polymath for now)

### In Progress / Broken ✗
- **Burn transition timing**: The transition partially works but the Polymath content doesn't cleanly replace the hero. At the end of the scroll the hero snaps back or content doesn't fully settle. The core challenge is that the burn layer is `fixed` and driven by `scrollYProgress`, but once the sticky hero exits the DOM flow, nothing holds the final state. **Next session should focus on fixing this.**

### Not Started
- Journey section (removed, may be re-added later)
- Guild / shop section (removed, may be re-added later)
- Mobile responsiveness pass
- 3D woman animation scrubbing (currently works but feel needs tuning)

## Development Guidelines
- **Styling**: Use Tailwind utility classes. Avoid custom CSS files. Use `bg-linear-to-b` not `bg-gradient-to-b` (Tailwind 4).
- **Animations**: All scroll transforms use `scrollYProgress` from `containerRef`. Do not introduce a second scroll tracker unless absolutely necessary.
- **Images**: Always include `referrerPolicy="no-referrer"` on `<img>` tags.
- **SVG filters**: Defined inline as a hidden `<svg>` at the top of the component tree, referenced via `filter: url(#id)` in inline styles (not Tailwind).
- **Performance**: Keep `PortfolioGallery` efficient — it handles many high-frequency scroll transforms simultaneously.
