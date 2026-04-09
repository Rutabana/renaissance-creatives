import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, useScroll, Float } from "@react-three/drei";
import * as THREE from "three";
import { BookItem } from "./book-item";
import { PerspectiveCamera } from "@react-three/drei";

import { PROJECTS } from "../../data/projects";

export function ScriptoriumScene() {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const bgRef = useRef<THREE.Mesh>(null);

  const churchTex = useTexture("/church-background.jpg");
  churchTex.colorSpace = THREE.SRGBColorSpace;

  const TORNADO_BOOKS = 24; 

  // Pre-compute a stable, randomized array of projects to prevent clustering
  const randomizedTornado = useMemo(() => {
    return Array.from({ length: TORNADO_BOOKS }).map(() => {
      const randomIndex = Math.floor(Math.random() * PROJECTS.length);
      return PROJECTS[randomIndex];
    });
  }, []); // Empty dependency array ensures this only runs once on mount

  useFrame(() => {
    if (groupRef.current && bgRef.current) {
      const startX = -65;
      const endX = 65;
      bgRef.current.position.x = startX + scroll.offset * (endX - startX);

      groupRef.current.rotation.y = scroll.offset * Math.PI * 4;
      groupRef.current.position.y = scroll.offset * -5;
    }
  });

  return (
    <>
      <color attach="background" args={["#0a0a0a"]} />
      
      <PerspectiveCamera makeDefault fov={35} position={[0, 15, 0]} />

      <mesh ref={bgRef} position={[0, 35, -110]}>
        <planeGeometry args={[250, 140]} />
        <meshBasicMaterial map={churchTex} transparent={false} />
      </mesh>

      <group ref={groupRef}>
        {/* Map over the randomized array instead of the raw PROJECTS array */}
        {randomizedTornado.map((project, i) => {
          const t = i / TORNADO_BOOKS;
          
          const turns = 3; 
          const angle = t * Math.PI * 2 * turns;
          const radius = 20 + (t * 20); 
          const y = 5 + (t * 25);      
          
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          const rotY = -angle - Math.PI / 2; 
          const rotX = Math.PI / 8;          
          const rotZ = Math.PI / 16;         

          return (
            <Float 
              key={i} 
              speed={2 + Math.random()} 
              rotationIntensity={1.5} 
              floatIntensity={1.5}
            >
              <BookItem 
                position={[x, y, z]} 
                rotation={[rotX, rotY, rotZ]} 
                coverUrl={project.cover}
              />
            </Float>
          );
        })}

        <ambientLight intensity={1.5} />
        <pointLight position={[0, 15, 0]} intensity={3} color="#ffcc80" />
      </group>
    </>
  );
}