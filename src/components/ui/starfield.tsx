import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useMemo, useRef, type ReactNode } from "react";

// Each depth layer drifts at a different rate to create parallax.
// Far stars are tiny, dim, and barely move; near stars are larger,
// brighter, glow, twinkle, and travel the most as you scroll.
type Layer = {
  count: number;
  size: [number, number]; // px range
  opacity: [number, number];
  drift: [string, string]; // y translate across the scroll pass
  glow: boolean;
  twinkle: boolean;
};

const LAYERS: Layer[] = [
  { count: 90, size: [1, 1.7], opacity: [0.15, 0.45], drift: ["6%", "-6%"], glow: false, twinkle: false },
  { count: 50, size: [1.4, 2.4], opacity: [0.3, 0.7], drift: ["12%", "-12%"], glow: false, twinkle: false },
  { count: 22, size: [2, 3.4], opacity: [0.55, 1], drift: ["22%", "-22%"], glow: true, twinkle: true },
];

function ParallaxLayer({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [string, string];
  children: ReactNode;
}) {
  const y = useTransform(progress, [0, 1], range);
  return (
    <motion.div style={{ y }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}

export function Starfield() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The slightest tilt — as the field scrolls past, the whole plane
  // rocks a few degrees so depth between layers reads as 3D space.
  const rotateX = useTransform(scrollYProgress, [0, 1], [3.5, -3.5]);

  // Stable random positions per layer (spawned slightly beyond the edges
  // so parallax/tilt never reveals an empty border).
  const stars = useMemo(
    () =>
      LAYERS.map((layer) =>
        Array.from({ length: layer.count }, () => ({
          x: Math.random() * 110 - 5,
          y: Math.random() * 130 - 15,
          size: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
          opacity: layer.opacity[0] + Math.random() * (layer.opacity[1] - layer.opacity[0]),
          delay: Math.random() * 4,
          dur: 2.5 + Math.random() * 3,
        }))
      ),
    []
  );

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ perspective: 1200 }}
    >
      <motion.div style={{ rotateX, transformStyle: "preserve-3d" }} className="absolute inset-0">
        {LAYERS.map((layer, li) => (
          <ParallaxLayer key={li} progress={scrollYProgress} range={layer.drift}>
            {stars[li].map((s, i) => {
              const base = {
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                boxShadow: layer.glow ? `0 0 ${s.size * 2.5}px rgba(255,245,210,0.8)` : undefined,
              } as const;

              return layer.twinkle ? (
                <motion.span
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={base}
                  animate={{ opacity: [s.opacity, s.opacity * 0.25, s.opacity] }}
                  transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : (
                <span key={i} className="absolute rounded-full bg-white" style={{ ...base, opacity: s.opacity }} />
              );
            })}
          </ParallaxLayer>
        ))}
      </motion.div>
    </div>
  );
}
