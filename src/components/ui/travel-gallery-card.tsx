import { useState } from "react";
import { motion } from "motion/react";

interface TravelGalleryCardProps {
  images: string[];
  title: string;
  className?: string;
  defaultWidth?: number;
  expandedWidth?: number;
}

export function TravelGalleryCard({ 
  images, 
  title, 
  className = "", 
  defaultWidth = 140, 
  expandedWidth = 400 
}: TravelGalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`absolute z-40 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#04040f]/60 backdrop-blur-md flex items-center justify-center p-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      animate={{
        width: isHovered ? expandedWidth : defaultWidth,
        height: 180
      }}
      // Using a custom cubic-bezier for a snappy, precise expansion
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Default State Text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: isHovered ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
         <span className="text-white/60 font-mono text-[10px] uppercase tracking-[0.3em]">{title}</span>
      </motion.div>

      {/* Expanded Image Slices */}
      <div className="flex w-full h-full gap-2 overflow-hidden">
        {images.map((src, i) => (
          <motion.div
            key={i}
            className="relative h-full rounded-lg overflow-hidden flex-shrink-0"
            initial={false}
            animate={{
              width: isHovered ? `${100 / images.length}%` : "0%",
              opacity: isHovered ? 1 : 0
            }}
            transition={{ 
              duration: 0.6, 
              ease: [0.22, 1, 0.36, 1], 
              // Stagger the expansion slightly from left to right
              delay: isHovered ? i * 0.04 : 0 
            }}
          >
            <img 
              src={src} 
              alt="Travel memory" 
              className="absolute inset-0 w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}