import { useState, useMemo } from "react";
import { useTexture, useCursor } from "@react-three/drei";
import * as THREE from "three";

export function BookItem({ position, rotation, coverUrl, onClick }: {
  position: [number, number, number],
  rotation: [number, number, number],
  coverUrl: string,
  onClick: () => void
}) {
  const baseTexture = useTexture(coverUrl) as THREE.Texture;
  const [hovered, setHovered] = useState(false);

  useCursor(hovered, 'pointer', 'auto');

  // Memoize the texture cloning to prevent memory leaks on re-renders
  const { frontTex, spineTex, backTex } = useMemo(() => {
    baseTexture.colorSpace = THREE.SRGBColorSpace;
    baseTexture.anisotropy = 16;

    // 1. Front Cover (Approx right 45% of the atlas)
    const front = baseTexture.clone();
    front.repeat.set(0.45, 1);
    front.offset.set(0.55, 0);
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
    <mesh
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(); // Trigger the passed-in function
      }}
    >
      <boxGeometry args={[2.5, 3.5, 0.4]} />

      {/* Pages */}
      <meshStandardMaterial attach="material-0" color="#f5ecd5" roughness={0.8} transparent={true} opacity={1} />
      {/* Spine - Add faint amber emissive glow on hover */}
      <meshStandardMaterial attach="material-1" map={spineTex} roughness={0.4} emissive="#ffaa00" emissiveIntensity={hovered ? 0.15 : 0} transparent={true} opacity={1} />
      {/* Pages */}
      <meshStandardMaterial attach="material-2" color="#f5ecd5" roughness={0.8} transparent={true} opacity={1} />
      <meshStandardMaterial attach="material-3" color="#f5ecd5" roughness={0.8} transparent={true} opacity={1} />
      {/* Front Cover - Add faint amber emissive glow on hover */}
      <meshStandardMaterial attach="material-4" map={frontTex} roughness={0.4} emissive="#ffaa00" emissiveIntensity={hovered ? 0.15 : 0} transparent={true} opacity={1} />
      {/* Back Cover */}
      <meshStandardMaterial attach="material-5" map={backTex} roughness={0.4} transparent={true} opacity={1} />
    </mesh>
  );
}