import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from "motion/react";
import { useRef, useState } from "react";

import { ScholarScene } from "../3d/ScholarScene";
import { ParticleTextPanel } from "../ui/particle-text-panel";
import { useScramble } from "../../hooks/useScramble";
import { COUNTRY_DATA } from "../../data/content";
import { MapPin } from "lucide-react";
import type { MotionValue } from "motion/react";



function CountryPanel({ country, image, x, zIndex }: {
    country: typeof COUNTRY_DATA[number];
    image: string;
    x: MotionValue<string>;
    zIndex: number;
}) {
    return (
        <motion.div
            style={{ x, zIndex }}
            className="absolute inset-0 flex items-center px-16 md:px-24"
        >
            {/* Warm atmospheric glow on left */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[50%] h-[80%] pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 20% 50%, rgba(200,150,12,0.06) 0%, transparent 70%)" }} />
            {/* Large ghosted chapter number */}
            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-[22vw] font-serif italic text-white/3 leading-none select-none pointer-events-none">
                {country.chapter}
            </span>

            <div className="relative z-10 max-w-sm">
                <p className="text-[10px] font-mono tracking-widest text-[#FFD700]/60 mb-1">{country.coords}</p>
                <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#FFD700]/50 mb-6">
                    The Traveller — {country.chapter}
                </p>
                <h3 className="text-[clamp(3.5rem,8vw,6rem)] font-serif italic leading-none text-[#f5f0e8] mb-6">
                    {country.name}
                </h3>
                <div className="w-24 h-px bg-white/15 mb-6" />
                <p className="text-[15px] text-[#f5f0e8]/85 leading-relaxed mb-8">{country.body}</p>

                {country.flourish === "compass" && (
                    <div className="flex items-center gap-3 mb-8">
                        <svg width="28" height="28" viewBox="0 0 28 28" className="text-white/20" fill="currentColor">
                            <polygon points="14,0 15.5,12.5 28,14 15.5,15.5 14,28 12.5,15.5 0,14 12.5,12.5" />
                            <polygon points="14,4 14.7,12.8 24,14 14.7,15.2 14,24 13.3,15.2 4,14 13.3,12.8" opacity="0.4" />
                        </svg>
                        <span className="text-[11px] font-mono text-white/30 tracking-widest">{country.city}</span>
                    </div>
                )}
                {country.flourish === "quote" && "quote" in country && (
                    <div className="border-l border-[#FFD700]/30 pl-4 mb-8">
                        <p className="text-sm font-serif italic text-white/50">"{country.quote}"</p>
                        <p className="text-[10px] font-mono text-white/25 mt-1 tracking-widest">— Anon.</p>
                    </div>
                )}
                {country.flourish === "stamp" && (
                    <div className="inline-flex items-center gap-2 border border-[#FFD700]/30 rounded px-3 py-2 mb-8" style={{ transform: "rotate(-2deg)" }}>
                        <MapPin size={13} className="text-[#FFD700]/60" />
                        <span className="text-[10px] font-mono text-[#FFD700]/60 tracking-widest">{country.coords.split("  ")[0]}</span>
                    </div>
                )}

                <button className="border border-white/20 px-6 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 hover:text-white hover:border-white/50 transition-colors duration-300">
                    Explore {country.name} →
                </button>
            </div>

            {/* Full-width background image */}
            {image && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <img src={image} alt={country.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            )}
        </motion.div>
    );
}

// --- Country Panel Stack ---

function CountryPanelStack({ countries, assets }: { countries: typeof COUNTRY_DATA; assets: Record<string, string> }) {
    const stackRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: stackRef,
        offset: ["start start", "end end"],
    });

    const n = countries.length; // 3
    // Each card slides in over its 1/n scroll slice and stays put — cards stack on top of each other.
    const xValues = countries.map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1; // even: from right, odd: from left
        if (i === 0) {
            // First card: already centered, never moves
            return useTransform(scrollYProgress, [0, 1], ["0%", "0%"]);
        }
        const inStart = (i - 1) / n;
        const inEnd = i / n;
        return useTransform(
            scrollYProgress,
            [Math.max(0, inStart), inEnd],
            [`${side * 100}%`, "0%"],
            { clamp: true }
        );
    });

    return (
        // 300vh = 100vh per panel transition
        <div ref={stackRef} className="relative" style={{ height: `${n * 100}vh` }}>
            <div className="sticky top-0 h-screen overflow-hidden">
                {countries.map((country, i) => (
                    <CountryPanel
                        key={country.id}
                        country={country}
                        image={assets[country.assetKey] ?? ""}
                        x={xValues[i]}
                        zIndex={i + 1}
                    />
                ))}
                {/* Scholar floats above all cards */}
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                    <ScholarScene />
                </div>
            </div>
        </div>
    );
}

export function TravelSection({ assets }: { assets: Record<string, string> }) {
    const travelContainerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: travelProgress } = useScroll({
        target: travelContainerRef,
        offset: ["start start", "end end"],
    });

    // Cartographic split transition (0–25% of travelProgress = first 100vh of 400vh)
    const topHalfY = useTransform(travelProgress, [0, 0.25], ["0%", "-100%"]);
    const bottomHalfY = useTransform(travelProgress, [0, 0.25], ["0%", "100%"]);
    const seamOpacity = useTransform(travelProgress, [0, 0.08, 0.20, 0.25], [0, 1, 1, 0]);
    const titleOpacity = useTransform(travelProgress, [0.05, 0.15, 0.22, 0.25], [0, 1, 1, 0]);



    return (
        <div ref={travelContainerRef} id="traveller" style={{ height: "400vh" }} className="relative">

            {/* ── TRANSITION: Cartographic split ── */}
            <div className="sticky top-0 h-screen overflow-hidden z-10 pointer-events-none">
                {/* Top half — ship background, slides up */}
                <motion.div
                    style={{ y: topHalfY, height: "50vh", overflow: "hidden" }}
                    className="absolute top-0 left-0 right-0"
                >
                    <img
                        src="/ship-background.jpg"
                        alt=""
                        className="w-full h-full object-cover object-bottom brightness-75 saturate-150"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </motion.div>

                {/* Bottom half — travel bg navy, slides down */}
                <motion.div
                    style={{ y: bottomHalfY, height: "50vh", background: "#04040f" }}
                    className="absolute bottom-0 left-0 right-0"
                />

                {/* Seam glow line */}
                <motion.div
                    style={{ opacity: seamOpacity, height: "1px", background: "rgba(255,215,0,0.8)", boxShadow: "0 0 20px 6px rgba(255,200,0,0.5), 0 0 60px 12px rgba(255,120,0,0.25)" }}
                    className="absolute top-1/2 left-0 right-0 z-20 -translate-y-px"
                />

                {/* "The Traveller" title at seam centre */}
                <motion.div
                    style={{ opacity: titleOpacity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30"
                >
                    <p className="text-[10px] uppercase tracking-[0.6em] font-mono text-[#FFD700]/60 mb-3">A New Chapter</p>
                    <h2 className="text-[clamp(3rem,8vw,7rem)] font-serif italic text-[#f5f0e8] leading-none">The Traveller</h2>
                </motion.div>
            </div>

            {/* ── TRAVEL CONTENT: Country Panels ── */}
            <div className="relative z-20">
                {/* Background */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "#04040f" }}>
                    {/* Map-grid SVG pattern overlay */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="mapgrid" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#c8960c" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#mapgrid)" />
                    </svg>
                </div>

                {/* Country panels — transforming */}
                <TransformingPanel countries={COUNTRY_DATA} assets={assets} />
            </div>

        </div>
    );
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-20%",
    zIndex: direction > 0 ? 10 : 0,
  }),
  center: {
    x: 0,
    zIndex: 5,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-20%" : "100%",
    zIndex: direction > 0 ? 0 : 10,
  })
};

export function TransformingPanel({ countries, assets }: { countries: any[], assets: any }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1. NEW: Track scroll direction

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const newIndex = Math.min(
      Math.floor(latest * countries.length),
      countries.length - 1
    );
    if (newIndex !== index) {
      // 2. NEW: Compare indices to know if we are going forwards (1) or backwards (-1)
      setDirection(newIndex > index ? 1 : -1);
      setIndex(newIndex);
    }
  });

  const current = countries[index];
  const scrambledTitle = useScramble(current.name);

  return (
    <div ref={containerRef} className="h-[300vh] relative">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        
        {/* 3. NEW: Pass the direction into AnimatePresence as a custom prop */}
        <AnimatePresence custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-0"
          >
            <img 
              src={assets[current.assetKey]} 
              className="w-full h-full object-cover brightness-50" 
              referrerPolicy="no-referrer" 
            />
          </motion.div>
        </AnimatePresence>

        {/* Keeping your wider max-w-5xl from earlier! */}
        <div className="relative z-10 px-24 max-w-5xl">
          <motion.h3 className="text-[8vw] font-serif italic text-white leading-none">
            {scrambledTitle}
          </motion.h3>
          <motion.div 
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ParticleTextPanel text={current.body} isVisible={true} />
          </motion.div>
        </div>

        <div className="absolute inset-0 pointer-events-none z-20">
          <ScholarScene />
        </div>
      </div>
    </div>
  );
}