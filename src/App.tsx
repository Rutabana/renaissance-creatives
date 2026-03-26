/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import React, { useRef, useEffect, useState } from "react";
import { ArrowRight, Sparkles, Info, Share2, Heart, Loader2, Globe, ShoppingBag, Palette, Camera, Menu, X } from "lucide-react";
import { generateCreativeAssets } from "./services/imageService";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import type { MotionValue } from "motion/react";

function EditionSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`min-h-screen w-full relative overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

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

    // Scrub animation time with scroll
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]];
      const duration = action.getClip().duration;
      mixer.setTime(p * duration);
    }

    meshRef.current.position.y = -2 + p * 0.4;
    meshRef.current.rotation.y = -Math.PI / 2;
  });

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={1.8}
      position={[0, -2, 0]}
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
  const [activeSection, setActiveSection] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(heroScroll, [0, 0.65, 1], [1, 1, 0.92]);
  const heroY = useTransform(heroScroll, [0, 0.65, 1], ["0%", "0%", "8%"]);

  // Renaissance candlelight transition — warm vignette closes like a flame going out
  const vignetteShadow = useTransform(
    heroScroll,
    [0.60, 0.88],
    [
      "inset 0 0 0px 0px rgba(6,3,0,0)",
      "inset 0 0 400px 400px rgba(6,3,0,1)"
    ]
  );
  const vignetteOpacity = useTransform(heroScroll, [0.91, 1.0], [1, 0]);
  // Golden medallion that flickers briefly as the light dies
  const medallionScale = useTransform(heroScroll, [0.68, 0.80, 0.90], [0, 1, 0]);
  const medallionOpacity = useTransform(heroScroll, [0.68, 0.76, 0.90], [0, 1, 0]);

  const polymathBg = useTransform(
    scrollYProgress,
    [0.2, 0.3],
    ["rgba(10, 10, 10, 1)", "rgba(20, 20, 30, 1)"]
  );

  const sections = [
    { id: "intro", label: "The Intro" },
    { id: "polymath", label: "The Polymath" },
    { id: "journey", label: "The Journey" },
    { id: "guild", label: "The Guild" }
  ];

  // Intro Section Animations
  const bgScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.2]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 0.8, 0.6]);
  const propY = useTransform(scrollYProgress, [0, 0.2], ["0%", "-50%"]);
  const propRotate = useTransform(scrollYProgress, [0, 0.2], [0, 25]);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-[#f5f2ed] font-sans selection:bg-[#FFD700] selection:text-black">
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

      {/* MAIN CONTENT CONTAINER */}
      <div ref={containerRef} className="relative">
        {/* Renaissance candlelight transition */}
        <motion.div style={{ opacity: vignetteOpacity }} className="fixed inset-0 z-[90] pointer-events-none">
          {/* Warm darkness closing in from the edges */}
          <motion.div style={{ boxShadow: vignetteShadow }} className="absolute inset-0" />
          {/* Golden medallion — a last flicker of light */}
          <motion.div
            style={{ scale: medallionScale, opacity: medallionOpacity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-48 h-48 rounded-full border-2 border-[#FFD700]/80 shadow-[0_0_80px_20px_rgba(255,215,0,0.25)]" />
          </motion.div>
        </motion.div>

        {/* SECTION 1: THE INTRO (VERTICAL HERO) */}
        <div ref={heroRef}>
        <div className="h-screen sticky top-0 z-0">
          <motion.div
            style={{
              scale: heroScale,
              y: heroY
            }}
            className="w-full h-full relative overflow-hidden bg-black"
          >
            {/* Vibrant Background Layer */}
            <motion.div 
              style={{ scale: bgScale, opacity: bgOpacity }}
              className="absolute inset-0 z-0"
            >
              <img 
                src={assets.hero_bg} 
                className="w-full h-full object-cover saturate-[1.5] contrast-[1.2]" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 via-transparent to-[#FF6347]/10" />
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </motion.div>

            {/* Tiramisu — falls from top center, arcs to her hand */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              <TiramisuScene scrollProgress={heroScroll} />
            </div>

            {/* 3D Woman — right side of hero */}
            <div className="absolute right-0 top-0 w-1/2 h-full z-25 pointer-events-none">
              <WomanScene scrollProgress={heroScroll} />
            </div>

            <div className="relative z-10 w-full h-full flex items-center justify-between px-10 md:px-20 overflow-hidden">
              {/* Left Character (Man) */}
              <CharacterLayer 
                image={assets.hero_subject_man} 
                side="left" 
                scrollProgress={heroScroll} 
              />

              {/* Center Title */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30 pointer-events-none w-full max-w-4xl px-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <h1 className="text-[12vw] md:text-[10vw] font-serif italic leading-[0.8] mb-6 tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    The <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FF6347] to-[#9370DB] animate-gradient-x">Renaissance</span> <br />
                    Edition
                  </h1>
                  <p className="text-sm md:text-base uppercase tracking-[0.6em] text-white/60 font-mono font-bold">
                    A New World of Creative Commerce
                  </p>
                </motion.div>
              </div>

              {/* Right Character (Woman) */}
              <CharacterLayer
                image={assets.hero_subject_woman}
                side="right"
                scrollProgress={heroScroll}
              />

              {/* Neon Props (The "Pops") */}
              <motion.div 
                style={{ y: propY, rotate: propRotate }}
                className="absolute bottom-20 left-1/4 z-40 hidden md:block"
              >
                <div className="w-40 h-40 rounded-full bg-[#FF00FF] blur-[100px] opacity-30" />
                <ShoppingBag size={80} className="text-[#FF00FF] drop-shadow-[0_0_30px_rgba(255,0,255,0.8)]" />
              </motion.div>

              <motion.div 
                style={{ y: propY, rotate: -propRotate }}
                className="absolute top-20 right-1/4 z-40 hidden md:block"
              >
                <div className="w-40 h-40 rounded-full bg-[#00FFFF] blur-[100px] opacity-30" />
                <Sparkles size={80} className="text-[#00FFFF] drop-shadow-[0_0_30px_rgba(0,255,255,0.8)]" />
              </motion.div>
            </div>
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 opacity-60">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Scroll Down</span>
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-px h-12 bg-white/40"
              />
            </div>
          </motion.div>
        </div>

        {/* Spacer to allow hero to scroll out */}
        <div className="h-screen" />
        </div>

        {/* SECTION 2: THE POLYMATH (BENTO) */}
        <EditionSection id="polymath" className="p-8 md:p-12 flex flex-col justify-center relative">
          <motion.div 
            style={{ backgroundColor: polymathBg }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={assets.abstract} 
              className="w-full h-full object-cover opacity-20 mix-blend-overlay" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          </motion.div>
          
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="mb-16"
            >
              <h2 className="text-6xl md:text-8xl font-serif italic mb-4">The Polymath</h2>
              <p className="text-xs opacity-40 uppercase tracking-[0.4em] font-bold">Multidisciplinary Outlets</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-[65vh]">
              <BentoCard 
                title="Visual Arts" 
                description="Exploring the intersection of tradition and digital modernity."
                icon={Palette}
                className="md:col-span-2 md:row-span-2"
                image={assets.abstract}
              />
              <BentoCard 
                title="Travel" 
                description="Documenting the hidden gems of the Great Lakes region."
                icon={Globe}
                className="md:col-span-1 md:row-span-1"
              />
              <BentoCard 
                title="Curation" 
                description="Shopping local, thinking global. A guide to Rwandan artisans."
                icon={ShoppingBag}
                className="md:col-span-1 md:row-span-2"
                image={assets.local}
              />
              <BentoCard 
                title="Photography" 
                description="Capturing the honey-brown light of the Kigali golden hour."
                icon={Camera}
                className="md:col-span-1 md:row-span-1"
              />
            </div>
          </div>
        </EditionSection>

        {/* SECTION 3: THE JOURNEY */}
        <EditionSection id="journey" className="bg-[#f5f2ed] text-[#1a1a1a]">
          <div className="absolute inset-0 z-0 opacity-15">
            <img src={assets.travel} alt="Travel" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between p-12 md:p-24">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h2 className="text-[10vw] font-serif italic leading-[0.9] mb-12">The Journey</h2>
              <p className="text-2xl md:text-3xl leading-relaxed opacity-80 font-light">
                At 24, the world is a canvas of experiences. From the rolling hills of Rwanda to the bustling markets of the world, every step is a lesson in creative discovery.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-end">
              <div className="space-y-2">
                <div className="text-7xl font-serif italic">12+</div>
                <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Countries Explored</p>
              </div>
              <div className="space-y-2">
                <div className="text-7xl font-serif italic">150+</div>
                <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Local Artisans</p>
              </div>
              <div className="col-span-2 md:text-right">
                <p className="text-xl opacity-60 italic font-serif leading-relaxed">
                  "To travel is to find the pieces of yourself you didn't know were missing."
                </p>
              </div>
            </div>
          </div>
        </EditionSection>

        {/* SECTION 4: THE GUILD */}
        <EditionSection id="guild" className="flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
            <div className="bg-white text-black p-12 md:p-24 flex flex-col justify-between">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <h2 className="text-7xl md:text-9xl font-serif italic mb-12">The Local <br />Guild</h2>
                <p className="text-xl md:text-2xl opacity-70 leading-relaxed font-light max-w-md">
                  A dedicated space for the makers. Highlighting Rwandan craftsmanship through a modern lens.
                </p>
              </motion.div>
              <button className="w-fit px-16 py-8 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-700 uppercase tracking-[0.3em] text-[10px] font-bold">
                Explore the Shop
              </button>
            </div>
            <div className="relative overflow-hidden group">
              <img src={assets.local} alt="Local" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[2000ms]" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-1000" />
              <div className="absolute top-12 left-12 text-white">
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4 opacity-60">Featured Collection</p>
                <p className="text-4xl md:text-6xl font-serif italic">Imigongo Modernism</p>
              </div>
              <div className="absolute bottom-12 right-12">
                <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md">
                  <Sparkles size={32} className="text-white animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </EditionSection>
      </div>
    </div>
  );
}

export default function App() {
  const [assets, setAssets] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      try {
        const data = await generateCreativeAssets();
        setAssets(data);
      } catch (error) {
        console.error("Failed to generate assets:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, []);

  if (loading || !assets) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center text-[#f5f2ed] font-serif">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Loader2 size={64} className="opacity-20" />
        </motion.div>
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.5em] opacity-40 animate-pulse">Curating the Collection</p>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-20">Renaissance '26</p>
        </div>
      </div>
    );
  }

  return <PortfolioGallery assets={assets} />;
}
