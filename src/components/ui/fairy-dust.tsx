import { motion } from "motion/react";

const fairyDustParticles = Array.from({ length: 150 }).map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 1.5 + 0.5,
  duration: Math.random() * 10 + 10,
  delay: Math.random() * -20,
}));

export const FairyDust = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {fairyDustParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: "white",
            mixBlendMode: "difference",
            boxShadow: "0 0 3px 1px rgba(255, 255, 255, 0.6)",
          }}
          animate={{
            top: ["110%", "-10%"],
            x: ["0%", "20px", "-20px", "0%"],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            top: { duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay },
            x: { duration: p.duration * 0.7, repeat: Infinity, ease: "easeInOut", delay: p.delay },
            opacity: { duration: p.duration, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1], delay: p.delay },
          }}
        />
      ))}
    </div>
  );
};
