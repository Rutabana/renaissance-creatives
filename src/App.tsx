/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from "motion/react";
import { FairyDust } from "./components/ui/fairy-dust";
import { GrainFilter } from "./components/ui/grain-filter";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, Sparkles, Globe, ShoppingBag, Palette, Camera, Menu, MapPin } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";


function BentoCard({ title, description, icon: Icon, className = "", image = "", floatDelay = 0 }: { title: string; description: string; icon: any; className?: string; image?: string; floatDelay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: floatDelay * 0.15 }}
      className={className}
    >
    <motion.div
      animate={{
        y: [0, -8, 0, -5, 0],
        rotate: [0, 0.4, 0, -0.3, 0],
      }}
      transition={{
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: floatDelay },
        rotate: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: floatDelay },
      }}
      whileHover={{ scale: 0.98, y: -14 }}
      className={`relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 flex flex-col justify-between h-full`}
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
    </motion.div>
  );
}

function WomanModel({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const { scene, animations } = useGLTF("/women.glb");
  const meshRef = useRef<any>(null);
  const { mixer, actions, names } = useAnimations(animations, scene);

  // Hook 1: Handle the animation setup (Your original code)
  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]];
      action.play();
      action.paused = true;
      action.time = 0;
    }

  }, [actions, names]);

  useEffect(() => {
    if (!scene) return;
    
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        
        // Grab the original material to extract its texture map
        const oldMat = mesh.material as THREE.MeshStandardMaterial;
        
        // Create a new "unlit" material using that same texture
        const unlitMat = new THREE.MeshBasicMaterial({
          map: oldMat.map,
          color: oldMat.color, // Keeps any base color tinting from Blender
          transparent: oldMat.transparent, 
          opacity: oldMat.opacity,
          alphaTest: oldMat.alphaTest,
        });
        
        // Overwrite the standard material with our new unlit one
        mesh.material = unlitMat;
      }
    });
  }, [scene]);

  useFrame((state) => {
  if (!meshRef.current) return;
  const p = scrollProgress.get();

  // 1. Scrub animation with scroll
  if (names.length > 0 && actions[names[0]]) {
    const action = actions[names[0]];
    const duration = action.getClip().duration;
    const targetTime = Math.min(p * duration, duration);
    
    action.paused = false;
    action.time = targetTime;
    mixer.update(0);
    action.paused = true;
  }

  // 2. Add the "Living Painting" Idle Sway
  // Replace "ArmBoneName" with the actual bone name from your Blender file
  const armBone = scene.getObjectByName("ArmBoneName"); 
  if (armBone) {
    const time = state.clock.getElapsedTime();
    // This creates a very slow, 2-second cycle (Math.sin(time * 0.5))
    // Move it only by 0.05 radians to keep it subtle and "Renaissance"
    armBone.rotation.z += Math.sin(time * 0.5) * 0.05;
  }

  // 3. Maintain your positioning
  meshRef.current.position.x = 0;
  meshRef.current.position.y = -0.;
  meshRef.current.rotation.x = 0.1;
  meshRef.current.rotation.y = -0.3;
  meshRef.current.rotation.z = -0.3;
});

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={0.8}
      position={[0, -1.4, 0]}
    />
  );
}

function WomanScene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  return (
    <Canvas camera={{ position: [0, 0.2, 3.5], fov: 45 }} style={{ background: "transparent" }}>
      

      <WomanModel scrollProgress={scrollProgress} />

      {/* The anchor shadow */}
      <ContactShadows 
        position={[0, -1.4, 0]} 
        opacity={0.4} 
        scale={10} 
        blur={2.5} 
        far={2} 
        color="#2b1d0e" 
      />
    </Canvas>
  );
}

function ScholarModel() {
  const { scene } = useGLTF("/scholar.glb");
  const meshRef = useRef<any>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.15;
    meshRef.current.position.y= 0;
    meshRef.current.position.x= 1.2;
  });

  return <primitive ref={meshRef} object={scene} scale={0.9} position={[0, -1.6, 0]} />;
}

function ScholarScene() {
  return (
    <Canvas camera={{ position: [0, 0.5, 4], fov: 42 }} style={{ background: "transparent" }} gl={{ alpha: true }}>
      <ambientLight intensity={0.8} color="#d6c9a8" />
      <directionalLight position={[4, 8, 4]} intensity={3} color="#ffd9a0" />
      <pointLight position={[-3, 2, 2]} intensity={1.5} color="#c8960c" />
      <spotLight position={[0, 6, -4]} intensity={6} angle={0.2} penumbra={1} color="#ffffff" />
      <ScholarModel />
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


// --- Country Panel ---

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
      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-[22vw] font-serif italic text-white/[0.03] leading-none select-none pointer-events-none">
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
    const inEnd   = i / n;
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

// --- Travel Section ---

function TravelSection({ assets }: { assets: Record<string, string> }) {
  const travelContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: travelProgress } = useScroll({
    target: travelContainerRef,
    offset: ["start start", "end end"],
  });

  // Cartographic split transition (0–25% of travelProgress = first 100vh of 400vh)
  const topHalfY    = useTransform(travelProgress, [0, 0.25], ["0%", "-100%"]);
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
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#c8960c" strokeWidth="0.5"/>
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

function useScramble(text: string, duration: number = 800) {
  const [displayOutput, setDisplayOutput] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#________";

  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const interval = setInterval(() => {
      const scrambled = text.split('').map((char, i) => {
        if (char === ' ') return ' ';
        // Gradually reveal original characters based on progress
        if (frame / totalFrames > i / text.length) return text[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');

      setDisplayOutput(scrambled);
      frame++;
      if (frame >= totalFrames) clearInterval(interval);
    }, duration / totalFrames);

    return () => clearInterval(interval);
  }, [text]);

  return displayOutput;
}

// --- 1. The Physics Particle Class ---
class TextParticle {
  char: string;
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;

  constructor(char: string, x: number, y: number) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.vx = 0;
    this.vy = 0;
  }

  update(birds: any[], canvas: HTMLCanvasElement) {
    let dx = 0;
    let dy = 0;
    let distance = 0;

    // 1. Repel from birds (The "Explosion" effect)
    birds.forEach(bird => {
      // Find the center of the bird image
      const bx = bird.x + bird.size / 2;
      const by = bird.y + bird.size / 2;

      dx = bx - this.x;
      dy = by - this.y;
      distance = Math.sqrt(dx * dx + dy * dy);

      // The area of effect around the bird
      const repelRadius = bird.size * 2.5; 
      
      if (distance < repelRadius) {
        const force = (repelRadius - distance) / repelRadius;
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;

        // Push letters away (adjust the multiplier for more/less explosive force)
        this.vx -= forceDirectionX * force * 4.5;
        this.vy -= forceDirectionY * force * 4.5;
      }
    });

    // 2. Spring back to original position
    const springForce = 0.04; // Lower = slower return
    this.vx += (this.originX - this.x) * springForce;
    this.vy += (this.originY - this.y) * springForce;

    // 3. Friction (Air resistance to smooth it out)
    const friction = 0.82; 
    this.vx *= friction;
    this.vy *= friction;

    // Apply velocities to position
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillText(this.char, this.x, this.y);
  }
}

// --- 2. The React Component ---
export function ParticleTextPanel({ text, isVisible }: { text: string; isVisible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<TextParticle[]>([]);
  const birdImagesRef = useRef<HTMLImageElement[]>([]);

  // Load bird images once
  useEffect(() => {
    birdImagesRef.current = ['/objects/bird1.png', '/objects/bird2.png', '/objects/bird3.png'].map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontStr = '16px "Times New Roman", serif'; // Adjust to match your exact font!
    ctx.font = fontStr;
    ctx.textBaseline = 'top';

    // --- INIT PHASE: Layout the text and create particles ---
    particlesRef.current = [];
    const words = text.split(' ');
    let currentX = 0;
    let currentY = 0;
    const lineHeight = 28;
    const maxWidth = canvas.width;

    words.forEach(word => {
      const wordWidth = ctx.measureText(word + ' ').width;

      // Line wrapping logic
      if (currentX + wordWidth > maxWidth) {
        currentX = 0;
        currentY += lineHeight;
      }

      // Break word into individual character particles for maximum fluidity
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const charWidth = ctx.measureText(char).width;
        particlesRef.current.push(new TextParticle(char, currentX, currentY));
        currentX += charWidth;
      }
      // Add space width after the word
      currentX += ctx.measureText(' ').width; 
    });

    // --- ANIMATION PHASE ---
    let birds = [
      { x: -50, y: 30, speed: 1.5, size: 50, imgIndex: 0 },
      { x: -250, y: 100, speed: 1.2, size: 65, imgIndex: 1 },
      { x: -150, y: 180, speed: 2.2, size: 45, imgIndex: 2 },
    ];

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontStr; // Re-apply font every frame just in case
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      
      // 1. Move & Draw Birds
      birds.forEach(bird => {
        bird.x += bird.speed;
        if (bird.x > canvas.width + 150) bird.x = -150; // Loop them
        
        const img = birdImagesRef.current[bird.imgIndex];
        if (img && img.complete && img.naturalWidth !== 0) {
           ctx.drawImage(img, bird.x, bird.y, bird.size, bird.size);
        }
      });

      // 2. Update & Draw Text Particles
      particlesRef.current.forEach(particle => {
        particle.update(birds, canvas);
        particle.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [text, isVisible]);

  return (
    <canvas 
      ref={canvasRef} 
      width={700} 
      height={350} 
      className="mt-6 font-body"
    />
  );
}

function TransformingPanel({ countries, assets }: { countries: any[], assets: any }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [index, setIndex] = useState(0);

  // FIX: Use useMotionValueEvent instead of useFrame
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const newIndex = Math.min(
      Math.floor(latest * countries.length),
      countries.length - 1
    );
    if (newIndex !== index) {
      setIndex(newIndex);
    }
  });

  const current = countries[index];
  const scrambledTitle = useScramble(current.name);

  return (
    <div ref={containerRef} className="h-[300vh] relative">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-0 z-0"
          >
            <img src={assets[current.assetKey]} className="w-full h-full object-cover brightness-50" referrerPolicy="no-referrer" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 px-24 max-w-2xl">
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

        {/* Bring back the 3D Scholar scene if you want him floating in this section */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <ScholarScene />
        </div>
      </div>
    </div>
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
    { id: "traveller", label: "The Traveller" },
  ];

  // Intro Section Animations
  const bgScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.2], { clamp: true });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.1, 0.25], [1, 0.8, 0.6], { clamp: true });
  const propY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-50%"], { clamp: true });
  const propRotate = useTransform(scrollYProgress, [0, 0.3], [0, 25], { clamp: true });

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-[#f5f2ed] font-sans selection:bg-[#FFD700] selection:text-black">
      <GrainFilter />
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
        style={{ scaleX: scrollYProgress }}
      />

      {/* MAIN HERO TRANSITION CONTAINER */}
      <div ref={containerRef} id="intro" className="relative w-full" style={{ height: "200vh" }}>
        <div className="h-screen sticky top-0 z-0 overflow-hidden bg-black">

          {/* [A] BASE LAYER — normal colors */}
          <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0 w-full h-full">
            {/* Background */}
            <motion.div style={{ scale: bgScale, opacity: bgOpacity }} className="absolute inset-0 z-0">
              {/* 1. Reset brightness to 100%, and slightly dial back the saturation so it doesn't look deep-fried when brightened */}
<img src={assets.hero_bg} className="w-full h-full object-cover saturate-[1.2] contrast-[1.05] brightness-100" referrerPolicy="no-referrer" alt="Hero Background" />

{/* 2. Either remove the multiply layer entirely, or drop its opacity drastically just to tie the colors together. 
    Removing it usually looks best for a natural painting style. */}
{/* <div className="absolute inset-0 bg-[#0a0a2a] opacity-10 mix-blend-multiply" /> */}

{/* 3. Soften the gradient. You still want a little darkness at the top/bottom for the nav/footer, but much less. */}
<div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/30" />
            </motion.div>
            <FairyDust />
            {/* Title + props */}
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

          {/* [B] CIRCLE LAYER — clipped flipped background only (no second canvas) */}
          <motion.div
            style={{ scale: heroScale, y: heroY, clipPath: circleClipPath }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <motion.div style={{ scale: bgScale, opacity: bgOpacity, filter: FLIP_FILTER }} className="absolute inset-0 z-0">
              <img src={assets.hero_bg} className="w-full h-full object-cover saturate-[1.8] contrast-[1.15] brightness-[0.75]" referrerPolicy="no-referrer" alt="" />
              <div className="absolute inset-0 bg-[#0a0a2a] opacity-60 mix-blend-multiply" />
              <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/70" />
            </motion.div>
          </motion.div>

          {/* [C] 3D WOMAN — isolated above all background/filter layers, never affected by clip or color flip */}
          <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0 w-full h-full z-30 pointer-events-none">
            <WomanScene scrollProgress={scrollYProgress} />
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

      {/* TRAVEL SECTION */}
      <TravelSection assets={assets} />

    </div>
  );
}

const ASSETS = {
  hero_bg: "/bg.png",
  hero_subject_woman: "/woman-1.png",
  hero_subject_man: "/man-1.png",
  hero_accents: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1080",
  travel: "https://images.unsplash.com/photo-1589908000350-0962e5a5133b?auto=format&fit=crop&q=80&w=1080",
  local: "https://images.unsplash.com/photo-1517147177326-b37599372b73?auto=format&fit=crop&q=80&w=1080",
  abstract: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1080",
  rwanda: "https://images.unsplash.com/photo-1511283878565-0833bf39de9d?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  england: "/ship-background.jpg",
  cyprus: "https://24glo.com/img/cyprus/map03.jpg",
};

const COUNTRY_DATA = [
  {
    id: "rwanda",
    name: "Rwanda",
    chapter: "I",
    coords: "01.9°S  30.1°E",
    city: "Kigali, RW",
    rotX: 0.033,
    rotY: -0.525,
    assetKey: "rwanda" as keyof typeof ASSETS,
    body: "A thousand hills, a thousand stories. Kigali moves with a quiet confidence — spotless streets, warm hospitality, and a skyline that climbs toward the clouds. As you weave through the bustling markets of Kimironko, the air is thick with the scent of roasted coffee and fresh earth. The hills cradle the city like a protective mother, offering breathtaking views from every vantage point. Here, tradition and modernity dance in perfect harmony, creating a rhythm unique to the heart of Africa. The golden hour paints the terracotta roofs in hues of fire, a daily masterpiece.",
    flourish: "compass" as const,
  },
  {
    id: "england",
    name: "England",
    chapter: "II",
    coords: "51.5°N  00.1°W",
    city: "London, UK",
    rotX: -0.899,
    rotY: 0.002,
    assetKey: "england" as keyof typeof ASSETS,
    body: "Grey skies that somehow always feel like home. The Thames carries centuries of ambition. The rhythm of London is relentless, a continuous hum of black cabs and the distant rumble of the Underground. You can lose yourself in the endless labyrinth of narrow streets in Soho or find quiet refuge in the sprawling green expanse of Hyde Park. It is a city that constantly reinvents itself while standing firmly on the foundation of its ancient, storied past.",
    quote: "The fog of London is just Africa's memory of clouds.",
    flourish: "quote" as const,
  },
  {
    id: "cyprus",
    name: "Cyprus",
    chapter: "III",
    coords: "35.2°N  33.4°E",
    city: "Nicosia, CY",
    rotX: -0.614,
    rotY: -0.583,
    assetKey: "cyprus" as keyof typeof ASSETS,
    body: "Mediterranean light that paints everything gold by afternoon. The old city walls of Nicosia hold stories older than any map. The scent of wild thyme and sea salt lingers in the breeze, weaving through ancient ruins and modern cafes alike. It's an island caught between continents, where every stone has witnessed empires rise and fall. Life moves at a different pace here, dictated by the sun and the gentle lap of the waves against the rocky coastline.",
    flourish: "stamp" as const,
  },
];

export default function App() {
  return <PortfolioGallery assets={ASSETS} />;
}