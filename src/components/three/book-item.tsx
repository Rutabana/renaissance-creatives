// src/components/three/book-item.tsx update
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

export function BookItem({ position, rotation, coverUrl }: { 
  position: [number, number, number], 
  rotation: [number, number, number], 
  coverUrl: string 
}) {
  const baseTexture = useTexture(coverUrl) as THREE.Texture;
  
  // Memoize the texture cloning to prevent memory leaks on re-renders
  const { frontTex, spineTex, backTex } = useMemo(() => {
    baseTexture.colorSpace = THREE.SRGBColorSpace;
    baseTexture.anisotropy = 16;

    // 1. Front Cover (Approx right 45% of the atlas)
    const front = baseTexture.clone();
    front.repeat.set(0.45, 1);
    front.offset.set(0.55, 0); // Shift start point to the right side
    front.needsUpdate = true;

    // 2. Spine (Approx middle 10% of the atlas)
    const spine = baseTexture.clone();
    spine.repeat.set(0.1, 1);
    spine.offset.set(0.45, 0); // Shift to the middle
    spine.needsUpdate = true;

    // 3. Back Cover (Approx left 45% of the atlas)
    const back = baseTexture.clone();
    back.repeat.set(0.45, 1);
    back.offset.set(0, 0); // Start at the left edge
    back.needsUpdate = true;

    return { frontTex: front, spineTex: spine, backTex: back };
  }, [baseTexture]);

  return (
    <mesh position={position} rotation={rotation}>
      {/* Box dimensions matched to standard book aspect ratio */}
      <boxGeometry args={[2.5, 3.5, 0.4]} />
      
      <meshStandardMaterial attach="material-0" color="#f5ecd5" roughness={0.8} /> {/* Pages */}
      <meshStandardMaterial attach="material-1" map={spineTex} roughness={0.4} />  {/* Spine */}
      <meshStandardMaterial attach="material-2" color="#f5ecd5" roughness={0.8} /> {/* Pages */}
      <meshStandardMaterial attach="material-3" color="#f5ecd5" roughness={0.8} /> {/* Pages */}
      <meshStandardMaterial attach="material-4" map={frontTex} roughness={0.4} />  {/* Front */}
      <meshStandardMaterial attach="material-5" map={backTex} roughness={0.4} />   {/* Back */}
    </mesh>
  );
}