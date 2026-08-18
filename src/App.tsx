/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { FairyDust } from "./components/ui/fairy-dust";
import { GrainFilter } from "./components/ui/grain-filter";
import { Preloader } from "./components/ui/preloader";
import { useRef, useState } from "react";
import { Sparkles, Globe, ShoppingBag, Palette, Camera, Menu } from "lucide-react";

import { ASSETS } from "./data/content";
import { CDN } from "./data/cdn";
import { WomanScene } from "./components/3d/WomanScene";
import { BentoCard } from "./components/ui/bento-card";
import { TravelSection } from "./components/sections/travel-section";
import { FinaleSection } from "./components/sections/finale-section";

function CharacterLayer({
  image,
  className = "",
  scrollProgress,
  side = "left",
  flip = false
}: {
  image: string;
  className?: string;
  scrollProgress: any;
  side: "left" | "right";
  flip?: boolean;
}) {
  // Move characters closer together as you scroll down
  const x = useTransform(
    scrollProgress,
    [0, 1],
    side === "left" ? ["-20%", "22%"] : ["20%", "-22%"]
  );

  // Man drifts down, woman drifts up — curved paths
  const y = useTransform(
    scrollProgress,
    [0, 1],
    side === "left" ? ["0%", "14%"] : ["0%", "-14%"]
  );

  // Rotation to maintain eye contact as they converge
  const rotate = useTransform(
    scrollProgress,
    [0, 1],
    side === "left" ? [0, -9] : [0, 9]
  );

  const opacity = useTransform(scrollProgress, [0, 0.8, 1], [1, 1, 0]);
  const scale = useTransform(scrollProgress, [0, 1], [1, 1.08]);

  return (
    <motion.div
      style={{ x, y, rotate, opacity, scale }}
      className={`relative w-[65vw] h-[90vh] flex items-center justify-center ${className}`}
    >
      <img
        src={image}
        alt="Character"
        className={`w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${flip ? "scale-x-[-1]" : ""}`}
        referrerPolicy="no-referrer"
      />
    </motion.div>
  );
}




// Scene chapters that play inside the pinned hero. Crossfade in order; the
// left rail's active item is derived from scrollYProgress so it stays in sync.
const SCENES = [
  { id: "awakening", roman: "I", label: "Awakening", wordmark: "Renaissance" },
  { id: "revelation", roman: "II", label: "Revelation", wordmark: "Polymath" },
  { id: "threshold", roman: "III", label: "Threshold", wordmark: "Threshold" },
];

const FLIP_FILTER = "invert(1) hue-rotate(180deg) saturate(2.2)";

// Where the spark ignites and the cosmic orb grows from. Pure visual anchor —
// no semantic meaning, retune freely once you see it on a real screen.
const CONTACT = { x: 50, y: 50 }; // percentages of the sticky-hero viewport

// Procedural starfield baked into the cosmic orb interior. Positions are
// hand-tuned to feel scattered but balanced; opacities and radii vary so the
// field reads as depth, not noise.
const STARS: Array<{ cx: number; cy: number; r: number; o: number }> = [
  { cx: 8, cy: 14, r: 1.4, o: 0.9 }, { cx: 18, cy: 22, r: 0.8, o: 0.6 },
  { cx: 28, cy: 8, r: 1.1, o: 0.85 }, { cx: 36, cy: 30, r: 0.6, o: 0.5 },
  { cx: 44, cy: 12, r: 1.6, o: 1.0 }, { cx: 52, cy: 26, r: 0.9, o: 0.7 },
  { cx: 60, cy: 6, r: 0.7, o: 0.6 }, { cx: 68, cy: 18, r: 1.2, o: 0.9 },
  { cx: 76, cy: 32, r: 0.8, o: 0.7 }, { cx: 84, cy: 10, r: 1.0, o: 0.8 },
  { cx: 92, cy: 24, r: 0.6, o: 0.5 }, { cx: 6, cy: 38, r: 0.9, o: 0.7 },
  { cx: 14, cy: 50, r: 1.3, o: 0.95 }, { cx: 24, cy: 44, r: 0.7, o: 0.6 },
  { cx: 34, cy: 58, r: 1.0, o: 0.8 }, { cx: 42, cy: 48, r: 0.5, o: 0.5 },
  { cx: 50, cy: 64, r: 1.5, o: 1.0 }, { cx: 58, cy: 52, r: 0.8, o: 0.7 },
  { cx: 66, cy: 60, r: 0.6, o: 0.55 }, { cx: 74, cy: 46, r: 1.1, o: 0.85 },
  { cx: 82, cy: 56, r: 0.9, o: 0.7 }, { cx: 90, cy: 42, r: 0.7, o: 0.6 },
  { cx: 4, cy: 72, r: 1.0, o: 0.8 }, { cx: 16, cy: 84, r: 0.7, o: 0.6 },
  { cx: 26, cy: 78, r: 1.4, o: 0.95 }, { cx: 36, cy: 90, r: 0.6, o: 0.5 },
  { cx: 46, cy: 80, r: 1.0, o: 0.8 }, { cx: 54, cy: 92, r: 0.8, o: 0.7 },
  { cx: 62, cy: 76, r: 1.2, o: 0.9 }, { cx: 70, cy: 88, r: 0.6, o: 0.55 },
  { cx: 78, cy: 70, r: 1.1, o: 0.85 }, { cx: 86, cy: 82, r: 0.9, o: 0.75 },
  { cx: 94, cy: 68, r: 0.7, o: 0.6 }, { cx: 22, cy: 62, r: 0.5, o: 0.4 },
  { cx: 38, cy: 18, r: 0.5, o: 0.45 }, { cx: 58, cy: 38, r: 0.5, o: 0.45 },
  { cx: 12, cy: 28, r: 0.4, o: 0.4 }, { cx: 80, cy: 26, r: 0.4, o: 0.4 },
  { cx: 48, cy: 38, r: 0.4, o: 0.4 }, { cx: 30, cy: 70, r: 0.4, o: 0.4 },
];

function PortfolioGallery({ assets }: { assets: Record<string, string> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  // Hidden once the finale is fully in the white — strips all page chrome.
  const [navHidden, setNavHidden] = useState(false);
  // Active scene in the pinned hero — drives the left-rail highlight.
  const [activeScene, setActiveScene] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Sub-progress for the 3D woman: she completes her scrub during the first
  // third of the pinned region — by the time the spark ignites she's "frozen"
  // on her reaching pose.
  const womanProgress = useTransform(scrollYProgress, [0, 0.33], [0, 1], { clamp: true });

  // POINT-ORIGIN PORTAL REVEAL
  // Choreography (scroll fractions of the 400vh pinned region):
  //   0.00–0.18  settle      — idle hero
  //   0.18–0.32  drift       — woman drifts toward contact point, title fades
  //   0.32–0.50  spark→flash — burst at the contact point, peaks at ~0.42
  //   0.42–0.78  inversion   — daytime drains to ghost (saturate/brightness)
  //   0.48–0.80  engulf      — cosmic orb (clip-path circle) grows from contact
  //   0.55–1.00  handoff     — Polymath wordmark then ship reveal inside the orb

  // Daytime drains to a desaturated, dim ghost as the orb consumes it.
  const daytimeSaturate = useTransform(scrollYProgress, [0.42, 0.78], [1, 0.2], { clamp: true });
  const daytimeBrightness = useTransform(scrollYProgress, [0.42, 0.78], [1, 0.5], { clamp: true });
  const daytimeFilter = useTransform<number, string>(
    [daytimeSaturate, daytimeBrightness],
    ([s, b]) => `saturate(${s}) brightness(${b})`
  );

  // Spark: a fast-evolving point burst. Starts tiny, peaks white-hot, then
  // expands outward as it fades, becoming the seed for the orb.
  const sparkScale = useTransform(scrollYProgress, [0.32, 0.42, 0.50], [0, 1.4, 6], { clamp: true });
  const sparkOpacity = useTransform(scrollYProgress, [0.32, 0.38, 0.46, 0.52], [0, 1, 1, 0], { clamp: true });
  // Rotating rays at the burst peak — adds the "Renaissance gold flare" feel.
  const sparkRayOpacity = useTransform(scrollYProgress, [0.36, 0.42, 0.48], [0, 1, 0], { clamp: true });
  const sparkRayRotate = useTransform(scrollYProgress, [0.32, 0.52], [0, 90]);

  // Cosmic orb: a clip-path circle grows from the contact point.
  const orbRadius = useTransform(scrollYProgress, [0.48, 0.80], [0, 150], { clamp: true });
  const orbClipPath = useTransform(orbRadius, (r) => `circle(${r}% at ${CONTACT.x}% ${CONTACT.y}%)`);

  // Interior reveals — content INSIDE the cosmic orb fades in sequentially
  // as the orb grows large enough to contain it.
  const cosmicInteriorOpacity = useTransform(scrollYProgress, [0.48, 0.58], [0, 1], { clamp: true });
  const polymathWordmarkOpacity = useTransform(scrollYProgress, [0.55, 0.72], [0, 1], { clamp: true });
  const shipRevealOpacity = useTransform(scrollYProgress, [0.78, 0.94], [0, 1], { clamp: true });

  // Woman's subtle drift toward the contact point during the "reach" phase.
  // Lightweight stand-in for the two-character Sistine gesture.
  const womanDriftX = useTransform(scrollYProgress, [0.18, 0.42], ["0%", "-8%"], { clamp: true });
  // Woman fades to ghost during the inversion stage — she becomes the wireframe.
  const womanOpacity = useTransform(scrollYProgress, [0.42, 0.55], [1, 0], { clamp: true });

  // Active-scene state derived from scroll. The rail flips when the visual
  // crosses each stage boundary — drift, inversion, full reveal.
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const idx = p < 0.42 ? 0 : p < 0.78 ? 1 : 2;
    setActiveScene((prev) => (prev === idx ? prev : idx));
  });

  // Daytime hero transforms — apply through the drift/spark window, then frozen.
  const heroScale = useTransform(scrollYProgress, [0, 0.42], [1, 0.94], { clamp: true });
  const heroY = useTransform(scrollYProgress, [0, 0.42], ["0%", "6%"], { clamp: true });
  // Title + props fade out before the spark ignites so they don't compete with it.
  const heroContentOpacity = useTransform(scrollYProgress, [0.10, 0.28], [1, 0], { clamp: true });
  const bgScale = useTransform(scrollYProgress, [0, 0.42], [1, 1.15], { clamp: true });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.18, 0.30], [1, 0.9, 0.7], { clamp: true });
  const propY = useTransform(scrollYProgress, [0, 0.25], ["0%", "-40%"], { clamp: true });
  const propRotate = useTransform(scrollYProgress, [0, 0.25], [0, 18], { clamp: true });

  const sections = [
    { id: "intro", label: "The Intro" },
    { id: "polymath", label: "The Polymath" },
    { id: "traveller", label: "The Traveller" },
    { id: "scriptorium", label: "The Scriptorium" },
    { id: "ascension", label: "The Ascension" },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-[#f5f2ed] font-sans selection:bg-[#FFD700] selection:text-black">
      <Preloader />
      <GrainFilter />

      {/* Navigation */}
      <nav
        style={{ opacity: navHidden ? 0 : 1, pointerEvents: navHidden ? "none" : "auto", transition: "opacity 0.7s ease" }}
        className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center mix-blend-difference"
      >
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
            <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium tracking-tighter">Ngeruka</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60">Renaissance '26</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-12">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-[10px] uppercase tracking-[0.4em] font-bold hover:text-[#FFD700] transition-colors relative group"
            >
              {section.label}
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#FFD700] group-hover:w-full transition-all duration-500" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 cursor-pointer">
            <ShoppingBag size={20} />
          </div>
          <div className="md:hidden w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
            <Menu size={20} />
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-[#FFD700] via-[#FF6347] to-[#9370DB] z-60 origin-left"
        style={{ scaleX: scrollYProgress, opacity: navHidden ? 0 : 1, transition: "opacity 0.7s ease" }}
      />

      {/* MAIN HERO — pinned point-origin portal reveal
        The daytime hero sits as a base layer. A spark ignites at CONTACT,
        flashes, then a cosmic orb (clip-path circle anchored at CONTACT)
        grows to engulf the daytime, revealing the Polymath/ship world inside.
        See the motion-value comments above for the scroll-fraction choreography.
      */}
      <div ref={containerRef} id="intro" className="relative w-full" style={{ height: "400vh" }}>
        <div className="h-screen sticky top-0 z-0 overflow-hidden bg-black">

          {/* [BASE] Daytime hero — woman + title + props, drains to ghost as the orb grows */}
          <motion.div style={{ filter: daytimeFilter }} className="absolute inset-0 w-full h-full z-0">
            <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0 w-full h-full">
              <motion.div style={{ scale: bgScale, opacity: bgOpacity }} className="absolute inset-0 z-0">
                <img src={assets.hero_bg} className="w-full h-full object-cover saturate-[1.2] contrast-[1.05] brightness-100" referrerPolicy="no-referrer" alt="Hero Background" />
                <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/30" />
              </motion.div>
              <FairyDust />
              <div className="relative z-30 w-full h-full pointer-events-none">
                <motion.div style={{ opacity: heroContentOpacity }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-4xl px-4 z-40">
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
                    <h1 className="text-[12vw] md:text-[10vw] font-serif italic leading-[0.8] mb-6 tracking-tighter text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                      Project <br />
                      <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FFD700] via-[#FF6347] to-[#9370DB]">Chelsea</span> <br />
                    </h1>
                    <p className="text-sm md:text-base uppercase tracking-[0.6em] text-white/60 font-mono font-bold">A New World of Creative Commerce</p>
                  </motion.div>
                </motion.div>
                <motion.div style={{ y: propY, rotate: propRotate, opacity: heroContentOpacity }} className="absolute bottom-20 left-1/4 hidden md:block z-40">
                  <div className="w-40 h-40 rounded-full bg-[#FF00FF] blur-[100px] opacity-30 absolute inset-0" />
                  <ShoppingBag size={80} className="relative z-10 text-[#FF00FF] drop-shadow-[0_0_30px_rgba(255,0,255,0.8)]" />
                </motion.div>
                <motion.div style={{ y: propY, rotate: -propRotate, opacity: heroContentOpacity }} className="absolute top-20 right-1/4 hidden md:block z-40">
                  <div className="w-40 h-40 rounded-full bg-[#00FFFF] blur-[100px] opacity-30 absolute inset-0" />
                  <Sparkles size={80} className="relative z-10 text-[#00FFFF] drop-shadow-[0_0_30px_rgba(0,255,255,0.8)]" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* [WOMAN] 3D woman — drifts toward contact point during the reach, fades during inversion */}
          <motion.div
            style={{ scale: heroScale, y: heroY, x: womanDriftX, opacity: womanOpacity, filter: daytimeFilter }}
            className="absolute inset-0 w-full h-full z-10 pointer-events-none"
          >
            <WomanScene scrollProgress={womanProgress} />
          </motion.div>

          {/* [SPARK] The ignition — bright burst at the contact point, brief and intense */}
          <motion.div
            style={{ opacity: sparkOpacity, top: `${CONTACT.y}%`, left: `${CONTACT.x}%` }}
            className="absolute z-20 pointer-events-none"
            aria-hidden="true"
          >
            {/* Core flash — radial gradient white-hot center, warm gold halo */}
            <motion.div
              style={{ scale: sparkScale }}
              className="relative -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className="w-[18vmin] h-[18vmin] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, #ffffff 0%, #fff6d6 14%, rgba(255,210,140,0.85) 28%, rgba(255,150,60,0.5) 48%, rgba(255,90,20,0.15) 72%, transparent 100%)",
                  filter: "blur(6px) drop-shadow(0 0 30px rgba(255,225,160,0.95)) drop-shadow(0 0 80px rgba(255,170,80,0.7))",
                }}
              />
              {/* Renaissance gold rays at the peak — four thin spokes through the core */}
              <motion.div
                style={{ opacity: sparkRayOpacity, rotate: sparkRayRotate }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {[0, 45, 90, 135].map((deg) => (
                  <div
                    key={deg}
                    className="absolute"
                    style={{
                      width: "44vmin",
                      height: "2px",
                      background: "linear-gradient(to right, transparent 0%, rgba(255,235,180,0.85) 50%, transparent 100%)",
                      transform: `rotate(${deg}deg)`,
                      filter: "blur(1.5px) drop-shadow(0 0 10px rgba(255,220,140,0.9))",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* [ORB] Cosmic reveal — clip-path circle grows from CONTACT, content lives inside */}
          <motion.div
            style={{ clipPath: orbClipPath }}
            className="absolute inset-0 w-full h-full z-[25] pointer-events-none"
          >
            {/* Dark cosmic base — deep navy with a subtle radial glow centered at the contact point */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${CONTACT.x}% ${CONTACT.y}%, #1a1638 0%, #0a0a22 35%, #050514 70%, #000008 100%)`,
              }}
            />
            {/* Procedural starfield */}
            <motion.svg
              style={{ opacity: cosmicInteriorOpacity }}
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
            >
              {STARS.map((s, i) => (
                <circle key={i} cx={s.cx} cy={s.cy} r={s.r * 0.18} fill="#ffffff" opacity={s.o} />
              ))}
              {/* Brighter "anchor" stars with a soft glow */}
              {STARS.filter((s) => s.r >= 1.2).map((s, i) => (
                <circle key={`g-${i}`} cx={s.cx} cy={s.cy} r={s.r * 0.6} fill="#ffffff" opacity={0.18} />
              ))}
            </motion.svg>
            {/* Soft inner nebula glow over the field */}
            <motion.div
              style={{
                opacity: cosmicInteriorOpacity,
                background: `radial-gradient(circle at ${CONTACT.x}% ${CONTACT.y}%, rgba(140,110,220,0.18) 0%, transparent 55%)`,
              }}
              className="absolute inset-0"
            />

            {/* Polymath wordmark — appears as the orb crosses the bottom-right corner */}
            <motion.div
              style={{ opacity: polymathWordmarkOpacity }}
              className="absolute bottom-[6%] right-[6%] z-20 pointer-events-none"
            >
              <span className="block font-serif italic leading-[0.85] text-[14vw] md:text-[12vw] text-white/85 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                Polymath
              </span>
            </motion.div>

            {/* Ship reveal — final handoff inside the orb */}
            <motion.div style={{ opacity: shipRevealOpacity }} className="absolute inset-0 z-10">
              <img
                src={`${CDN}/images/ship-background.jpg`}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
                alt=""
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-black/80" />
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 55%, transparent 50%, rgba(0,0,0,0.7) 100%)" }}
              />
              <div className="absolute bottom-[8%] right-[6%] z-20 pointer-events-none">
                <span className="block font-serif italic leading-[0.85] text-[12vw] md:text-[10vw] text-[#f5f0e8]/85 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                  Threshold
                </span>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.5em] font-mono text-white/50 z-30">
                Scroll to enter
              </div>
            </motion.div>
          </motion.div>

          {/* LEFT RAIL — Roman-numeral scene tracker, mix-blend so it reads on any background */}
          <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-7 mix-blend-difference pointer-events-none select-none">
            {SCENES.map((s, i) => {
              const active = activeScene === i;
              return (
                <div key={s.id} className="flex items-center gap-5">
                  <span
                    className="font-serif italic text-[28px] leading-none tabular-nums transition-[opacity,color] duration-700"
                    style={{ width: 32, color: active ? "#ffffff" : "rgba(255,255,255,0.35)" }}
                  >
                    {s.roman}
                  </span>
                  <span
                    className="font-mono uppercase text-[10px] tracking-[0.45em] transition-[opacity,color] duration-700"
                    style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.35)" }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="h-px bg-white transition-all duration-700"
                    style={{ width: active ? 56 : 20, opacity: active ? 1 : 0.3 }}
                  />
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* REGULAR POLYMATH SECTION */}
      {/* Positioned normally so it naturally scrolls into view pushed up as the Hero sticky container finishes its 200vh travel */}
      <div id="polymath" className="relative z-20 w-full min-h-screen bg-[#0a0a0a]">
        <div className="absolute inset-0 pointer-events-none z-0">
          <img src={`${CDN}/images/ship-background.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-black/60 to-[#0a0a0a]" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, transparent 70%, rgba(0,0,0,0.8) 100%)" }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-8 md:p-12 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full pt-20 pb-40">
            <div className="mb-16 text-center md:text-left">
              <h2 className="text-6xl md:text-8xl font-serif italic mb-4 text-[#f5f0e8]">The Polymath</h2>
              <p className="text-sm opacity-60 uppercase tracking-[0.4em] font-bold text-white">Multidisciplinary Outlets</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-[65vh] min-h-[500px]">
              <BentoCard title="Visual Arts" description="Exploring the intersection of tradition and digital modernity." icon={Palette} className="md:col-span-2 md:row-span-2" image={assets.abstract} floatDelay={0} />
              <BentoCard title="Travel" description="Documenting the hidden gems of the Great Lakes region." icon={Globe} className="md:col-span-1 md:row-span-1" floatDelay={1.2} />
              <BentoCard title="Curation" description="Shopping local, thinking global. A guide to Rwandan artisans." icon={ShoppingBag} className="md:col-span-1 md:row-span-2" image={assets.local} floatDelay={0.6} />
              <BentoCard title="Photography" description="Capturing the honey-brown light of the Kigali golden hour." icon={Camera} className="md:col-span-1 md:row-span-1" floatDelay={1.8} />
            </div>
          </div>
        </div>
      </div>

      <TravelSection assets={assets} />

      <FinaleSection onWhiteout={setNavHidden} />

    </div>
  );
}


export default function App() {
  return <PortfolioGallery assets={ASSETS} />;
}