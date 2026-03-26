
# CLAUDE.md - Renaissance Edition Portfolio

## Project Overview
"The Renaissance Edition" is a high-end, cinematic creative portfolio for Rutabana. It features immersive scroll-based animations, a bento-grid layout for multidisciplinary works, and a sophisticated editorial aesthetic.

## Tech Stack
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS 4 (using `@import "tailwindcss";` in `index.css`)
- **Animations:** Framer Motion (`motion/react`)
- **Icons:** Lucide React
- **AI Integration:** Google Gemini SDK (`@google/genai`) for creative asset generation

## Core Scripts
- `npm run dev`: Starts development server on port 3000
- `npm run build`: Builds the application for production
- `npm run lint`: Runs TypeScript type checking
- `npm run clean`: Removes the `dist` folder

## Key Components & Architecture
- **`src/App.tsx`**: Main entry point containing the scroll logic and section definitions.
- **`CharacterLayer`**: Handles the hero characters (Man and Woman) with scroll-based translation and scaling.
- **`BentoCard`**: Reusable component for the "Polymath" section grid.
- **`PortfolioGallery`**: The main wrapper that manages `useScroll` and `useTransform` values for the entire experience.

## Design Patterns & Animations
- **Hero Animation**: Man (left) and Woman (right) start at the edges of the screen and move towards the center as the user scrolls. They are fully visible on load (no fade-in).
- **Explosion Transition**: As the hero section scrolls out, a `motion.div` with a white glow expands (`explosionScale`) to create a "flash" transition into the next section.
- **Polymath Section**: Features a dynamic background color shift (`polymathBg`) and an abstract overlay revealed by the explosion.
- **Typography**: Uses a mix of Serif (italicized for headings) and Sans-serif (for UI elements) to create an editorial feel.

## Asset Management
Creative assets (backgrounds, subjects) are generated via `src/services/imageService.ts` using Gemini.
- `hero_subject_man`: `/man-1.png` (Provided asset)
- `hero_subject_woman`: Generated woman subject.
- `hero_bg`: Vibrant, high-contrast background.

## Development Guidelines
- **Styling**: Use Tailwind utility classes. Avoid custom CSS files.
- **Animations**: Prefer `useTransform` with `scrollYProgress` for scroll-linked effects.
- **Images**: Always include `referrerPolicy="no-referrer"` on `<img>` tags to prevent loading issues.
- **Performance**: Keep the main `PortfolioGallery` efficient as it handles multiple high-frequency scroll transforms.
