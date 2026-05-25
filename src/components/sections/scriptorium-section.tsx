// Example Parent Component integration
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ScriptoriumScene } from "../three/scriptorium-scene";
import { GlassModal } from "../ui/glass-modal";
import { GrainFilter } from "../ui/grain-filter";
import { ScrollControls } from "@react-three/drei";

export default function ScriptoriumSection() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="scriptorium-scroll relative w-full h-screen">
      <Canvas>
        {/* Wrap the scene in ScrollControls. 
            pages={4} creates a scrollable area 4x the height of the screen. 
            damping={0.2} adds a smooth, physical momentum to the scroll. */}
        <ScrollControls pages={4} damping={0.2}>
          <ScriptoriumScene onBookClick={(project) => setSelectedProject(project)} />
        </ScrollControls>
      </Canvas>

      {/* The 2D UI Overlay */}
      <GlassModal 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
        project={selectedProject} 
      />
    </div>
  );
}