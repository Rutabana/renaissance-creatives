// src/components/three/ascension-scene.tsx
// "The Ascension" — a scroll-driven march up a garden path toward the light.
// Page scroll dollies the camera forward (and slightly up) through a corridor
// of backlit grass billboards; fog + bloom resolve into a bright "heaven" at
// the far end where the finale copy lands (handled by the DOM overlay).
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Sparkles, PerspectiveCamera, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { CDN } from "../../data/cdn";

const GRASS_URLS = [
  `${CDN}/textures/grass-1.webp`,
  `${CDN}/textures/grass-2.webp`,
  `${CDN}/textures/grass-3.webp`,
];

const PATH_NEAR = 10;   // z where the corridor starts (closest to camera)
const PATH_FAR = -24;   // z where the path crests into the light
const LIGHT_POS: [number, number, number] = [0, 7, PATH_FAR - 4];

function GrassClump({ tex, position, height }: {
  tex: THREE.Texture;
  position: [number, number, number];
  height: number;
}) {
  const img = tex.image as HTMLImageElement | undefined;
  const aspect = img && img.height ? img.width / img.height : 1;
  return (
    // Gentle breeze. Low intensity so the base barely lifts off the ground.
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.35}>
      {/* renderOrder 2 keeps the grass painted ON TOP of the road (renderOrder -1). */}
      <mesh position={position} renderOrder={2}>
        <planeGeometry args={[height * aspect, height]} />
        <meshBasicMaterial
          map={tex}
          transparent
          alphaTest={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

function World() {
  const grassTextures = useTexture(GRASS_URLS) as THREE.Texture[];
  const roadTex = useTexture(`${CDN}/textures/dirt-road.webp`) as THREE.Texture;

  grassTextures.forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));
  roadTex.colorSpace = THREE.SRGBColorSpace;
  const roadImg = roadTex.image as HTMLImageElement | undefined;
  const roadAspect = roadImg && roadImg.height ? roadImg.width / roadImg.height : 1.65;
  const roadLen = 42;

  // Scatter grass in two rows lining a central clearing (= the path).
  const grassField = useMemo(() => {
    const rows = 18;
    const items: { x: number; z: number; h: number; t: number; key: string }[] = [];
    for (let i = 0; i < rows; i++) {
      const z = PATH_NEAR - (i / (rows - 1)) * (PATH_NEAR - PATH_FAR);
      for (const side of [-1, 1]) {
        items.push({
          x: side * (2.8 + Math.random() * 2.6),
          z: z + (Math.random() - 0.5) * 1.6,
          h: 4.5 + Math.random() * 3.5,
          t: Math.floor(Math.random() * grassTextures.length),
          key: `${i}-${side}`,
        });
      }
    }
    return items;
  }, [grassTextures.length]);

  return (
    <>
      {/* Bright distance + sky blend into the same warm glow as the fog. */}
      <color attach="background" args={["#f3e3bd"]} />
      <fog attach="fog" args={["#f5e7c2", 12, 46]} />

      {/* Dark earth base under everything. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]}>
        <planeGeometry args={[140, 90]} />
        <meshStandardMaterial color="#0e0a05" roughness={1} />
      </mesh>

      {/* The dirt path, laid flat. Image "up" (its bright crest) points to -z,
          so the brightest part of the road sits at the far end by the light. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, (PATH_NEAR + PATH_FAR) / 2]} renderOrder={-1}>
        <planeGeometry args={[roadLen / roadAspect + 8, roadLen]} />
        <meshBasicMaterial map={roadTex} transparent alphaTest={0.04} depthWrite={false} toneMapped={false} />
      </mesh>

      {grassField.map((g) => (
        <GrassClump key={g.key} tex={grassTextures[g.t]} position={[g.x, g.h / 2, g.z]} height={g.h} />
      ))}

      {/* The heaven light — a bright emissive panel the bloom flares out. */}
      <mesh position={LIGHT_POS}>
        <planeGeometry args={[46, 34]} />
        <meshBasicMaterial color="#fff6dd" transparent opacity={0.95} toneMapped={false} fog={false} />
      </mesh>

      {/* Warm key light from the far end rims the ground toward the camera. */}
      <directionalLight position={[0, 9, PATH_FAR]} intensity={2.2} color="#ffe7b0" />
      <ambientLight intensity={0.8} color="#f3e6c6" />

      {/* Pollen / embers drifting up the corridor. */}
      <Sparkles
        count={150}
        scale={[18, 12, 38]}
        position={[0, 6, (PATH_NEAR + PATH_FAR) / 2]}
        size={3}
        speed={0.4}
        opacity={0.5}
        color="#ffe9b0"
      />
    </>
  );
}

function Rig({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  useFrame(() => {
    if (!camRef.current) return;
    const p = scrollProgress.get();
    // Dolly forward through the corridor and rise slightly — ascending.
    camRef.current.position.z = THREE.MathUtils.lerp(PATH_NEAR + 4, PATH_FAR + 12, p);
    camRef.current.position.y = THREE.MathUtils.lerp(2.6, 5, p);
    camRef.current.lookAt(0, 3.6 + p * 2, LIGHT_POS[2]);
  });
  return <PerspectiveCamera ref={camRef} makeDefault fov={52} position={[0, 2.6, PATH_NEAR + 4]} />;
}

export function AscensionScene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  return (
    <Canvas dpr={[1, 1.75]} gl={{ antialias: true }}>
      <Rig scrollProgress={scrollProgress} />
      <World />
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.3} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
