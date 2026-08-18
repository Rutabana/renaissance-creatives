# to-do — next session pickup

**Read this first.** State to resume from as of 2026-08-18.

## Where things stand

### Live deployment (new, 2026-08-18)
- **Vercel project `chelsea`** (scope `loic-rutabanas-projects`), connected to
  GitHub `Rutabana/renaissance-creatives`.
- Live now at **https://chelsea-three-gamma.vercel.app** — deployed from local
  files via `vercel deploy --prod --yes` (NOT from a git push; the branch is
  still uncommitted).
- `chelsea.loic-rutabana.com` is registered on the Vercel project but **not yet
  resolving** — the Route53 A record still needs creating (see step 5).
- Deploy weight went 85 MB → **3.9 MB** after the CDN migration.
- Preloader note: it gates completion on `readoutVal > 99.4`, lerped at
  `0.1`/**frame**. In a backgrounded tab rAF is throttled, so `MAX_MS = 14000`
  does not actually cap anything and the loader appears stuck. Harmless in a
  focused tab; worth making time-based if it ever bites.

- Branch `scriptorium`, in sync with `origin/scriptorium` (0/0 ahead/behind).
  Last pushed commit unchanged from yesterday: `69364b0` "Travel/scriptorium
  polish + CDN migration for <img> assets". **Nothing committed this session
  yet** — everything below is uncommitted.
- **Hero → Polymath transition rebuilt** in `src/App.tsx`. Old bubble (clip-path
  circle + wobble SVG turbulence) is gone. Now: a **point-origin portal reveal**
  over a 400vh sticky-hero container — daytime hero base layer with the 3D
  woman, a spark/burst that ignites at `CONTACT = {x:50, y:50}`, then a cosmic
  orb (clip-path circle) grows from that point, swallowing the daytime as it
  drains to a desaturated ghost. Inside the orb: inline-SVG starfield, soft
  nebula glow, then `Polymath` wordmark, then ship-background.jpg reveal with
  `Threshold` wordmark + "Scroll to enter" hint. Left rail with Roman numerals
  I/II/III tracks the three stages. **Loïc's verdict: "Not quite there but
  that's enough for today."** Implementation in, tuning pending.
- Choreography lives entirely in `useTransform` motion values near top of
  `PortfolioGallery` — search `POINT-ORIGIN PORTAL REVEAL`. Each beat is one
  `[in, peak, out]` markers tuple — retune without touching JSX.
- Plan file (still relevant): `/Users/loic/.claude/plans/delightful-herding-seal.md`
- **Preloader refined** (`src/components/ui/preloader.tsx`):
  - Now also waits on `document.fonts.ready` + critical `<img>` assets
    (`CRITICAL_IMAGES` list, currently just `ASSETS.hero_bg`) + a 400ms settle
    frame after everything reports ready (gives WebGL shaders time to paint).
  - Line drawing **decoupled** from asset progress — lines now draw on a pure
    `easeInOut(elapsed / DRAW_MS)` time curve (`DRAW_MS = 7000`, slow). The
    bottom number readout still lerps toward real asset progress.
  - Timing: `MIN_MS = 6500`, `MAX_MS = 14000`. Loïc accepted the bar as
    "beautiful". Lines feel less choppy because they no longer chase stepwise
    asset events.
- **CDN AVIF migration**: `ASSETS.hero_bg` now points to `${CDN}/images/bg.avif`
  (was `bg.png`). Updated `src/data/content.ts:4` and `CLAUDE.md:77`.
  `.png` is still on S3 if rollback needed, but the AVIF is what loads.
- Dev server is running in background (`bxlxhx2h4`, port 3000). Vite HMR working.
- Uncommitted files (verified via `git status --short`):
  - M `src/App.tsx`, `src/components/three/scriptorium-scene.tsx`,
    `src/data/content.ts`, `CLAUDE.md`, `.env.example`, `package.json`,
    `package-lock.json`, `.claude/settings.local.json`
  - D `src/components/sections/scriptorium-section.tsx` (folded into finale;
    `ascension-section.tsx` was also deleted)
  - ?? `src/components/sections/finale-section.tsx`,
    `src/components/three/ascension-scene.tsx`,
    `src/components/ui/preloader.tsx`, `src/lib/supabase.ts`
  - ?? `vercel.json` (new — CDN rewrite + SPA fallback)
  - D  all of `public/` — every asset now lives on the CDN (see below)

## Resume here — next steps
1. **Tune the portal reveal.** Open localhost:3000, scroll the hero slowly, and
   identify what's off. Most likely candidates (all in `src/App.tsx` motion-
   value block):
   - `CONTACT.x / CONTACT.y` (currently `50/50`) — bias toward where the
     woman's outstretched hand actually lands on screen if it feels off-center.
   - `sparkScale` middle value `1.4` and `sparkOpacity` ranges — make the
     flash bigger / longer / more violent.
   - `daytimeSaturate` / `daytimeBrightness` end values (`0.2` / `0.5`) — push
     toward `0` for a more dramatic ghost.
   - `orbRadius` window `[0.48, 0.80]` — widen to slow the engulf.
   - `womanDriftX` end value `-8%` — change for more or less "reach".
   Verify by hard-reloading (Cmd+Shift+R) so Vite picks up the change.
2. **Decide whether to keep the left-rail Roman numerals** (I Awakening /
   II Revelation / III Threshold) — they advance with the orb stages but the
   Shopify reference uses an all-page rail (12 items). Easy to swap once Loïc
   picks a direction.
3. **Once Loïc is happy: commit the session batch.** Stage tracked files only,
   NOT the big assets: `git add -u && git add src/components/sections/finale-section.tsx
   src/components/three/ascension-scene.tsx src/components/ui/preloader.tsx
   src/lib/supabase.ts` → commit → push. Verify `git status` still shows
   `public/objects/dirt-road.png` and `public/objects/grass/` untracked.
4. ~~Downsize the 4K textures~~ **DONE (2026-08-18)** — now 1024 px / 2048 px
   WebP on the CDN, 43 MB → 1.05 MB. 4K originals backed up to
   `rennaissance-creatives/textures/originals/` on S3.
5. **Create the DNS record for the live site** (only outstanding deploy step):
   `chelsea.loic-rutabana.com`  A  →  `76.76.21.21` in Route53, matching the
   other `*.loic-rutabana.com` subdomains. Needs the `loic-admin` AWS session
   (`aws login`) — `LightsailAPIUser` cannot write Route53.
6. **Merge this branch to `main` before relying on git-driven deploys.** The
   Vercel project `chelsea` is connected to GitHub; a push to `main` builds
   `main`, which does NOT yet have the CDN work.

## Rules / do-not-break
- **`/public` is empty and should stay that way.** Every media asset is on the
  CDN. Add new media to S3 under `rennaissance-creatives/` and reference it as
  `` `${CDN}/...` ``, don't drop it in `public/`.
- **Secrets:** never read `.env` / variants (blocked by hook). Use `envtool`
  CLI; `.env.example` is safe. Comment box needs `VITE_SUPABASE_URL` +
  `VITE_SUPABASE_ANON_KEY` in a local `.env` (gitignored) — set via
  `! envtool set KEY`.
- **One scroll model:** scenes take a `scrollProgress` MotionValue and read
  `.get()` in `useFrame` (like `WomanScene`). Do NOT reintroduce drei
  `ScrollControls`.
- **CDN CORS — SOLVED (2026-08-18).** The bucket still sends no CORS headers,
  but the CDN is now proxied **same-origin** at `/cdn/*`, so the CORS check
  never happens. `src/data/cdn.ts` exports `CDN = "/cdn"`; the proxy is defined
  in `vercel.json` (prod) and `vite.config.ts` (`server.proxy` + `preview.proxy`).
  **Change one, change the other.** Verified in production: crossOrigin image
  loads succeed and the canvas is untainted. Never hardcode the CloudFront host
  in app code — that reintroduces the bug.
- **`/public` has no `man-1.png`** despite `ASSETS.hero_subject_man` referencing
  `/man-1.png` and `CharacterLayer` being defined in `App.tsx`. A literal
  two-character "reach" gesture is therefore not possible without first adding
  that asset. The current portal reveal works around this with a single-character
  drift.

## Pointers / open decisions
- **Scriptorium central glow** — Loïc said to STOP chasing it for now. Tried:
  volumetric spotlights off, bokehScale↓, brightness↓, highlight-crush
  (reverted). Likely a DoF/Sparkles interaction; revisit only if asked.
- **Comment storage deferred** — UI works, currently falls back to
  `localStorage`. To enable Supabase: create project, add env keys, run the
  `comments` table SQL (insert-only RLS for `anon`) — full SQL was given in
  chat on 2026-05-25.
- **CDN background/details:** see `CLAUDE.md` → "Asset Management / CDN".
- **Design reference:** Shopify Editions Winter '26
  (https://www.shopify.com/editions/winter2026) — point-origin portal reveal
  pattern (Sistine-style reach → spark → cosmic orb engulf) is what the hero
  transition is trying to emulate.
- **Plan file** with the full portal-reveal design:
  `/Users/loic/.claude/plans/delightful-herding-seal.md` (still load-bearing
  while the reveal is being tuned).
