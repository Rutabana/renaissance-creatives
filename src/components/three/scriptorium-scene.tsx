// src/components/three/scriptorium-scene.tsx
import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { type ThreeElement } from "@react-three/fiber";
import { useTexture, useScroll, Float, shaderMaterial, PerspectiveCamera, Sparkles, SpotLight } from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";
import { BookItem } from "./book-item";
import { PROJECTS } from "../../data/projects";

// 1. Define the GLSL Shader Material
const MuralGrainMaterial = shaderMaterial(
  { map: new THREE.Texture(), uNoise: 0.1, uTime: 0, uBrightness: 1.0 },
  /*glsl*/`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  /*glsl*/`
  uniform sampler2D map;
  uniform float uNoise;
  uniform float uTime;
  uniform float uBrightness;
  varying vec2 vUv;

  float random(vec2 st, float time) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233)) + time) * 43758.5453123);
  }

  void main() {
    vec4 texel = texture2D(map, vUv);
    float safeTime = mod(uTime, 100.0);
    float noise = (random(vUv, safeTime) - 0.5) * uNoise;

    // Multiply the base texture by the brightness, THEN add the static
    gl_FragColor = vec4((texel.rgb * uBrightness) + vec3(noise), texel.a);
  }
  `
);

// 2. Register it with React Three Fiber
extend({ MuralGrainMaterial });

// 3. Strongly type the custom JSX element
declare module "@react-three/fiber" {
  interface ThreeElements {
    muralGrainMaterial: ThreeElement<typeof MuralGrainMaterial> & {
      map?: THREE.Texture | null;
      uNoise?: number;
      uTime?: number;
      uBrightness?: number;
    };
  }
}

export function ScriptoriumScene({ onBookClick }: { onBookClick: (project: any) => void }) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const bgRef = useRef<THREE.Mesh>(null);
  const muralMatRef = useRef<any>(null);

  const churchTex = useTexture("/church-background.jpg");
  churchTex.colorSpace = THREE.SRGBColorSpace;

  const TORNADO_BOOKS = 24;

  const randomizedTornado = useMemo(() => {
    return Array.from({ length: TORNADO_BOOKS }).map(() => {
      const randomIndex = Math.floor(Math.random() * PROJECTS.length);
      return PROJECTS[randomIndex];
    });
  }, []);

  const bookData = useMemo(() =>
    Array.from({ length: TORNADO_BOOKS }).map((_, i) => {
      const t = i / TORNADO_BOOKS;
      const angle = t * Math.PI * 2 * 3;
      const radius = 20 + t * 15;
      return {
        x: Math.cos(angle) * radius,
        y: 10 + t * 10,
        z: Math.sin(angle) * radius,
        rotX: Math.PI / 8,
        rotY: -angle - Math.PI / 2,
        rotZ: Math.PI / 16,
      };
    }), []);

  useFrame((state) => {
    if (groupRef.current && bgRef.current) {
      // Background pans throughout full scroll
      bgRef.current.position.x = -65 + scroll.offset * 130;

      // Tornado spins + descends across the FULL scroll, staying in sync
      // with the background pan instead of freezing partway through.
      groupRef.current.rotation.y = scroll.offset * Math.PI * 6;
      groupRef.current.position.y = scroll.offset * -3;

    }

    if (muralMatRef.current) {
      muralMatRef.current.uTime = state.clock.elapsedTime;
    }
  });

  return (
    <>
      <color attach="background" args={["#0a0a0a"]} />

      <PerspectiveCamera makeDefault fov={35} position={[0, 15, 0]} />

      <mesh ref={bgRef} position={[0, 35, -110]}>
        <planeGeometry args={[250, 140]} />
        <muralGrainMaterial
          ref={muralMatRef}
          map={churchTex}
          uNoise={0.088}
          uBrightness={1.15}
          transparent={false}
        />
      </mesh>

      <group ref={groupRef}>
        {bookData.map((data, i) => {
          const project = randomizedTornado[i];
          return (
            <group key={i}>
              <Float
                speed={2 + Math.random()}
                rotationIntensity={1.5}
                floatIntensity={1.5}
              >
                <BookItem
                  position={[data.x, data.y, data.z]}
                  rotation={[data.rotX, data.rotY, data.rotZ]}
                  coverUrl={project.cover}
                  onClick={() => onBookClick(project)}
                />
              </Float>
            </group>
          );
        })}

        {/* --- LIGHTING & VOLUMETRICS --- */}
        <ambientLight intensity={1.2} />
        <pointLight position={[0, 15, 0]} intensity={1.5} color="#ffcc80" />

        <SpotLight
          position={[15, 35, -10]}
          angle={0.25}
          attenuation={25}
          anglePower={5}
          intensity={8}
          color="#ffedd6"
          opacity={0.35}
          penumbra={1}
        />

        <SpotLight
          position={[-20, 25, -15]}
          angle={0.4}
          attenuation={20}
          anglePower={4}
          intensity={4}
          color="#ffd6a5"
          opacity={0.2}
          penumbra={1}
        />

        {/* --- ATMOSPHERIC DUST MOTES --- */}
        <Sparkles
          count={800}
          scale={[50, 50, 50]}
          size={1.5}
          speed={0.2}
          opacity={0.15}
          color="#ffcc80"
        />
      </group>

      {/* --- CINEMATIC BOKEH / DEPTH OF FIELD --- */}
      <EffectComposer multisampling={0}>
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={2.5}
          height={480}
        />
      </EffectComposer>
    </>
  );
}
