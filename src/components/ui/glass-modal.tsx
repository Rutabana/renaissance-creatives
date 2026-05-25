// src/components/ui/glass-modal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // Assuming you use lucide-react for icons

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any | null; // Replace with your Project type
}

export function GlassModal({ isOpen, onClose, project }: GlassModalProps) {
  return (
    <AnimatePresence>
      {isOpen && project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        >
          {/* Dimming Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20" 
            onClick={onClose} 
          />

          {/* The Frosted Glass Container */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-4xl 
                       bg-neutral-900/50 backdrop-blur-3xl 
                       border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]
                       ring-1 ring-white/5 inset-ring inset-ring-white/10"
            // The rings above create the "Apple" inner-bevel highlight
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <X className="w-5 h-5 text-neutral-300" />
            </button>

            {/* Modal Content - Tailored for a Classical Creative */}
            <div className="p-10 sm:p-16">
              <div className="max-w-3xl mx-auto space-y-12">
                
                {/* Header Section */}
                <header className="space-y-4 border-b border-white/10 pb-8">
                  <h4 className="text-amber-500/80 tracking-widest text-sm uppercase font-mono">
                    {project.category || "Selected Work"}
                  </h4>
                  <h2 className="text-4xl sm:text-5xl font-serif text-neutral-100 tracking-tight leading-tight">
                    {project.title || "The Title of the Work"}
                  </h2>
                </header>

                {/* Content Grid (Adapts to video, photo, or text) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-neutral-300">
                  
                  {/* Sidebar Meta Info */}
                  <div className="md:col-span-4 space-y-6 text-sm font-mono opacity-80">
                    <div>
                      <span className="block text-neutral-500 mb-1">Author</span>
                      <span>Loïc Rutabana, Ph.D.</span>
                    </div>
                    <div>
                      <span className="block text-neutral-500 mb-1">Medium</span>
                      <span>{project.medium || "Digital Archival"}</span>
                    </div>
                  </div>

                  {/* Main Body */}
                  <div className="md:col-span-8 space-y-6 font-serif text-lg leading-relaxed">
                    <p>
                      {project.description || "Here is where the primary synopsis goes. The typography here should mirror classical editorial layouts—perhaps utilizing drop caps or elegant pull quotes depending on the specific achievement or publication being highlighted."}
                    </p>
                    
                    {/* Placeholder for Media (Mux Video or Photo Grid) */}
                    <div className="w-full aspect-video bg-black/40 rounded-xl border border-white/5 mt-8 flex items-center justify-center">
                      <span className="font-mono text-sm text-neutral-500">Media Embed (Mux/Images)</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}