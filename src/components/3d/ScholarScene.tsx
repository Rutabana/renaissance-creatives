import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export function ScholarModel() {
  const { scene } = useGLTF("/scholar+.glb");
  const meshRef = useRef<any>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.15;
    meshRef.current.position.y= 0;
    meshRef.current.position.x= 1.2;
  });

  return <primitive ref={meshRef} object={scene} scale={0.9} position={[0, -1.6, 0]} />;
}

export function ScholarScene() {
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