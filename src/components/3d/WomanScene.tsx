
import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";


export function WomanModel({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
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

export function WomanScene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
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