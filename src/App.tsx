/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, Sparkles, Globe, ShoppingBag, Palette, Camera, Menu } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import type { MotionValue } from "motion/react";

function BentoCard({ title, description, icon: Icon, className = "", image = "" }: { title: string; description: string; icon: any; className?: string; image?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 0.98 }}
      className={`relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 flex flex-col justify-between ${className}`}
    >
      {image && (
        <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
          <img src={image} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>
      )}
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors duration-500">
          <Icon size={24} />
        </div>
        <h3 className="text-2xl font-medium mb-2 font-sans">{title}</h3>
        <p className="text-sm opacity-60 leading-relaxed max-w-[200px] font-body">{description}</p>
      </div>
      <div className="relative z-10 flex justify-end">
        <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
      </div>
    </motion.div>
  );
}

function TiramisuModel({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const { scene } = useGLTF("/tiramisu_-_low_poly_challenge_desserts.glb");
  const meshRef = useRef<any>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const p = scrollProgress.get();
    // Fall starts at scroll 0, lands at ~55%
    const landAt = 0.55;
    const t = Math.min(p / landAt, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);
    // Start at top center (x=0, y=3.5), arc right to her hand (x=2.0, y=-0.7)
    meshRef.current.position.x = ease * 1.6;
    meshRef.current.position.y = 3.5 - ease * 4.0;
    // Spin while falling, settle when landed
    meshRef.current.rotation.y += (1 - ease) * 0.02;
    meshRef.current.rotation.z = (1 - ease) * 0.15;
  });

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={0.012}
      position={[0, 3.5, 0]}
    />
  );
}

function WomanModel({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const { scene, animations } = useGLTF("/woman.glb");
  const meshRef = useRef<any>(null);
  const { mixer, actions, names } = useAnimations(animations, scene);

  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]];
      action.play();
      action.paused = true;
      action.time = 0;
    }
  }, [actions, names]);

  useFrame(() => {
    if (!meshRef.current) return;
    const p = scrollProgress.get();

    // Scrub animation with scroll by directly setting time on mixer
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]];
      const duration = action.getClip().duration;
      const targetTime = Math.min(p * duration, duration);
      action.paused = false;
      action.time = targetTime;
      mixer.update(0);
      action.paused = true;
    }

    meshRef.current.position.x = 0;
    meshRef.current.position.y = -1.4;
    meshRef.current.rotation.y = -Math.PI / 2;
  });

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={1.44}
      position={[0, -1.4, 0]}
    />
  );
}

function WomanScene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 3.5], fov: 45 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 8, 5]} intensity={2.5} />
      <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#ffd9a0" />
      <WomanModel scrollProgress={scrollProgress} />
    </Canvas>
  );
}

function TiramisuScene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={2} />
      <TiramisuModel scrollProgress={scrollProgress} />
    </Canvas>
  );
}

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

function PortfolioGallery({ assets }: { assets: Record<string, string> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });


  // All animations driven by page-level scroll (0 = top, 1 = bottom of 300vh page)
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.92], { clamp: true });
  const heroY = useTransform(scrollYProgress, [0, 0.4], ["0%", "8%"], { clamp: true });
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0], { clamp: true });

  // Circle-reveal color flip: a dot grows from center, inside = invert+hue-rotate (vivid color swap)
  const circleRadius = useTransform(scrollYProgress, [0.35, 0.70], [0, 150], { clamp: true });
  const circleClipPath = useTransform(circleRadius, r => `circle(${r}% at 50% 50%)`);
  const wobbleOpacity = useTransform(scrollYProgress, [0.62, 0.70], [1, 0], { clamp: true });
  const FLIP_FILTER = "invert(1) hue-rotate(180deg) saturate(2.2)";

  const sections = [
    { id: "intro", label: "The Intro" },
    { id: "polymath", label: "The Polymath" },
  ];

  // Intro Section Animations
  const bgScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.2], { clamp: true });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.1, 0.25], [1, 0.8, 0.6], { clamp: true });
  const propY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-50%"], { clamp: true });
  const propRotate = useTransform(scrollYProgress, [0, 0.3], [0, 25], { clamp: true });

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-[#f5f2ed] font-sans selection:bg-[#FFD700] selection:text-black">
      {/* SVG filters for wobbly organic circle */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <defs>
          {/* Interior: very subtle displacement so content stays readable */}
          <filter id="wobble-interior" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.012" numOctaves="2" seed="3" result="noise">
              <animate attributeName="baseFrequency" values="0.015 0.012;0.012 0.018;0.018 0.010;0.015 0.012" dur="12s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* Edge: large slow low-frequency waves for a big dramatic circumference wobble */}
          <filter id="wobble-edge" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.005 0.007" numOctaves="2" seed="11" result="noise">
              <animate attributeName="baseFrequency" values="0.005 0.007;0.007 0.004;0.004 0.009;0.006 0.005;0.005 0.007" dur="18s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="90" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
            <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium tracking-tighter">Rutabana</span>
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
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#FF6347] to-[#9370DB] z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* MAIN HERO TRANSITION CONTAINER */}
      <div ref={containerRef} id="intro" className="relative w-full" style={{ height: "200vh" }}>
        <div className="h-screen sticky top-0 z-0 overflow-hidden bg-black">

          {/* [A] BASE LAYER — normal colors */}
          <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0 w-full h-full">
            {/* Background */}
            <motion.div style={{ scale: bgScale, opacity: bgOpacity }} className="absolute inset-0 z-0">
              <img src={assets.hero_bg} className="w-full h-full object-cover saturate-[1.8] contrast-[1.15] brightness-[0.75]" referrerPolicy="no-referrer" alt="Hero Background" />
              <div className="absolute inset-0 bg-[#0a0a2a] opacity-60 mix-blend-multiply" />
              <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/70" />
            </motion.div>
            {/* 3D Woman */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
              <WomanScene scrollProgress={scrollYProgress} />
            </div>
            {/* Title + props */}
            <div className="relative z-30 w-full h-full pointer-events-none">
              <motion.div style={{ opacity: heroContentOpacity }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-4xl px-4 z-40">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
                  <h1 className="text-[12vw] md:text-[10vw] font-serif italic leading-[0.8] mb-6 tracking-tighter text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                    The <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FFD700] via-[#FF6347] to-[#9370DB]">Renaissance</span> <br />
                    Edition
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

          {/* [B] CIRCLE LAYER — clipped flipped content, always present */}
          <motion.div
            style={{ scale: heroScale, y: heroY, clipPath: circleClipPath }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <motion.div style={{ scale: bgScale, opacity: bgOpacity, filter: FLIP_FILTER }} className="absolute inset-0 z-0">
              <img src={assets.hero_bg} className="w-full h-full object-cover saturate-[1.8] contrast-[1.15] brightness-[0.75]" referrerPolicy="no-referrer" alt="" />
              <div className="absolute inset-0 bg-[#0a0a2a] opacity-60 mix-blend-multiply" />
              <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/70" />
            </motion.div>
            <div className="absolute inset-0 w-full h-full z-0">
              <WomanScene scrollProgress={scrollYProgress} />
            </div>
          </motion.div>

          {/* Wobble overlay — distorts the clip edge, fades out once circle fills screen */}
          <motion.div style={{ opacity: wobbleOpacity }} className="absolute inset-0 pointer-events-none">
            {/* Circle edge wobble */}
            <div style={{ filter: "url(#wobble-edge)", position: "absolute", inset: 0 }}>
              <motion.div
                style={{ scale: heroScale, y: heroY, clipPath: circleClipPath }}
                className="absolute inset-0 w-full h-full"
              >
                <motion.div style={{ scale: bgScale, opacity: bgOpacity, filter: FLIP_FILTER }} className="absolute inset-0 z-0">
                  <img src={assets.hero_bg} className="w-full h-full object-cover saturate-[1.8] contrast-[1.15] brightness-[0.75]" referrerPolicy="no-referrer" alt="" />
                  <div className="absolute inset-0 bg-[#0a0a2a] opacity-60 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/70" />
                </motion.div>
              </motion.div>
            </div>
            {/* Glowing border ring */}
            <div style={{ filter: "url(#wobble-edge)", position: "absolute", inset: 0 }}>
              <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0 w-full h-full">
                <motion.div
                  style={{
                    clipPath: circleClipPath,
                    position: "absolute", inset: 0,
                    background: "radial-gradient(circle, transparent 90%, rgba(255,215,0,0.55) 94%, rgba(255,100,0,0.25) 98%, transparent 100%)",
                    filter: "drop-shadow(0 0 14px rgba(255,185,0,0.8)) drop-shadow(0 0 40px rgba(255,80,0,0.35))",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* REGULAR POLYMATH SECTION */}
      {/* Positioned normally so it naturally scrolls into view pushed up as the Hero sticky container finishes its 200vh travel */}
      <div id="polymath" className="relative z-20 w-full min-h-screen bg-[#0a0a0a]">
        <div className="absolute inset-0 pointer-events-none z-0">
          <img src="/ship-background.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-black/60 to-[#0a0a0a]" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, transparent 70%, rgba(0,0,0,0.8) 100%)" }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-8 md:p-12 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full pt-20 pb-40">
            <div className="mb-16 text-center md:text-left">
              <h2 className="text-6xl md:text-8xl font-serif italic mb-4 text-[#FFD700]">The Polymath</h2>
              <p className="text-sm opacity-60 uppercase tracking-[0.4em] font-bold text-white">Multidisciplinary Outlets</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-[65vh] min-h-[500px]">
              <BentoCard title="Visual Arts" description="Exploring the intersection of tradition and digital modernity." icon={Palette} className="md:col-span-2 md:row-span-2" image={assets.abstract} />
              <BentoCard title="Travel" description="Documenting the hidden gems of the Great Lakes region." icon={Globe} className="md:col-span-1 md:row-span-1" />
              <BentoCard title="Curation" description="Shopping local, thinking global. A guide to Rwandan artisans." icon={ShoppingBag} className="md:col-span-1 md:row-span-2" image={assets.local} />
              <BentoCard title="Photography" description="Capturing the honey-brown light of the Kigali golden hour." icon={Camera} className="md:col-span-1 md:row-span-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ASSETS = {
  hero_bg: "/main-background.jpeg",
  hero_subject_woman: "/woman-1.png", 
  hero_subject_man: "/man-1.png", 
  hero_accents: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1080",
  travel: "https://images.unsplash.com/photo-1589908000350-0962e5a5133b?auto=format&fit=crop&q=80&w=1080",
  local: "https://images.unsplash.com/photo-1517147177326-b37599372b73?auto=format&fit=crop&q=80&w=1080",
  abstract: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1080"
};

export default function App() {
  return <PortfolioGallery assets={ASSETS} />;
}
