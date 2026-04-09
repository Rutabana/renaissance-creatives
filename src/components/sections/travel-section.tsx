import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from "motion/react";
import { useRef, useState } from "react";
import { ParticleTextPanel } from "../ui/particle-text-panel";
import { useScramble } from "../../hooks/useScramble";
import { COUNTRY_DATA } from "../../data/content";
import { GlobeScene } from "../3d/GlobeScene";
import { TravelGalleryCard } from "../ui/travel-gallery-card";

// Placeholder image sets
const MEMORY_SET_1 = [
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800&auto=format&fit=crop"
];

const MEMORY_SET_2 = [
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop"
];

const MEMORY_SET_3 = [
  "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
];

// --- 1. Animation Variants for Seamless Sliding ---
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

// --- 2. The Main Country Carousel ---
export function TransformingPanel({ countries, assets }: { countries: any[], assets: any }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); 

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const newIndex = Math.min(
      Math.floor(latest * countries.length),
      countries.length - 1
    );
    if (newIndex !== index) {
      setDirection(newIndex > index ? 1 : -1);
      setIndex(newIndex);
    }
  });

  const current = countries[index];
  const scrambledTitle = useScramble(current.name);

  return (
    <div ref={containerRef} className="h-[300vh] relative">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        
        {/* Background Image Carousel */}
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
              alt={current.name}
            />
          </motion.div>
        </AnimatePresence>

        {/* Text Overlay */}
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

        {/* 3D Globe with floating animation */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[12%] top-[15%] pointer-events-none z-30"
        >
          <GlobeScene lat={current.lat} lng={current.lng} />
        </motion.div>

        {/* Landscape Video - Top Middle */}
        <TravelGalleryCard 
          playbackId="n02h02Y3d1kUC00XEiFxU01oXaPoJ7Hydjs00DLFJ77LwGeM" 
          className="top-[10%] right-[45%] -rotate-2"
          width={320} 
          height={250}
        />
        <TravelGalleryCard 
          playbackId="017EjMBvD002pu7I5cK2f5l9J022Mh8300uzjTqB9v3J2Jk"     
          className="bottom-[8%] right-[8%] rotate-3"
          width={220} 
          height={320}
        />
        <TravelGalleryCard 
          playbackId="lb00CcLl4h9027rWyqsrjqluTp4MGdpUhbWeEHjIhEdoY" 
          className="bottom-[5%] left-[12%] -rotate-6"
          width={230} 
          height={200}
        />
      </div>
    </div>
  );
}

// --- 3. The Parent Travel Section Wrapper ---
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
                {/* Background SVG Map Grid */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "#04040f" }}>
                    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="mapgrid" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#c8960c" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#mapgrid)" />
                    </svg>
                </div>

                {/* Render the Active Transforming Carousel */}
                <TransformingPanel countries={COUNTRY_DATA} assets={assets} />
            </div>

        </div>
    );
}