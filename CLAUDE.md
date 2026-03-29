
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

Static assets in `/public`:
- `/man-1.png`: Hero left character
- `/woman.glb`: 3D woman model (with embedded animation clip)
- `/ship-background.jpg`: Polymath section background (revealed by burn transition)

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
