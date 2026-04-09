import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import { Suspense } from "react";
import { ScriptoriumScene } from "../three/scriptorium-scene";

export function ScriptoriumSection() {
  return (
    <div className="relative h-[250vh] bg-[#0a0a0a]">
      <div className="sticky top-0 h-screen w-full">
        {/* Camera at [0,0,0] looking out. FOV 45 is the "sweet spot" for this radius */}
        <Canvas camera={{ position: [0, 0, 0], fov: 45 }}>
          <Suspense fallback={null}>
            <ScrollControls pages={3} damping={0.4}>
              <ScriptoriumScene />
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}