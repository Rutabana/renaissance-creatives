import { useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { ASSETS } from "../../data/content";

// Critical above-the-fold <img> assets that drei's useProgress does NOT see.
// The hero must look right the moment the preloader fades, so we explicitly
// wait for these before reporting complete.
const CRITICAL_IMAGES = [ASSETS.hero_bg];

// A renaissance "divine proportion" construction blueprint that draws itself on
// at the speed the page's 3D assets load: golden spirals, radiating diagonals,
// a golden-section grid and concentric circles, stroke-drawn over black, with
// the wordmark at the convergence. When loading finishes it fades to the hero.

const VW = 1600;
const VH = 1000;
const F = { x: VW * 0.5, y: VH * 0.5 }; // focal / convergence point
const PHI = 1.618;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const line = (x1: number, y1: number, x2: number, y2: number) =>
  `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;

const circle = (cx: number, cy: number, r: number) =>
  `M ${(cx - r).toFixed(1)} ${cy.toFixed(1)} a ${r} ${r} 0 1 0 ${(r * 2).toFixed(1)} 0 a ${r} ${r} 0 1 0 ${(-r * 2).toFixed(1)} 0`;

const spiral = (cx: number, cy: number, startR: number, turns: number, dirX: number, rot: number) => {
  const b = Math.log(PHI) / (Math.PI / 2);
  const steps = 180;
  const total = turns * 2 * Math.PI;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * total;
    const r = startR * Math.exp(b * th);
    const x = cx + dirX * r * Math.cos(th + rot);
    const y = cy + r * Math.sin(th + rot);
    d += i ? ` L ${x.toFixed(1)} ${y.toFixed(1)}` : `M ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
};

type Stroke = { d: string; color: string; w: number };

export function Preloader() {
  const { active, progress, loaded, total } = useProgress();

  // Track critical <img> assets that drei doesn't see.
  const imgLoadedRef = useRef(0);
  const imgTotalRef = useRef(CRITICAL_IMAGES.length);
  // Fonts (serif italic in the hero title) — block until ready.
  const fontsReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    CRITICAL_IMAGES.forEach((src) => {
      const img = new Image();
      const done = () => {
        if (cancelled) return;
        imgLoadedRef.current += 1;
      };
      img.onload = done;
      img.onerror = done; // don't block forever on a 404 / network blip
      img.src = src;
      if (img.complete && img.naturalWidth > 0) done();
    });
    if (typeof document !== "undefined" && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => {
        if (!cancelled) fontsReadyRef.current = true;
      });
    } else {
      fontsReadyRef.current = true;
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Live values read inside the rAF loop without re-subscribing it.
  const progressRef = useRef(0);
  const activeRef = useRef(true);
  const loadedRef = useRef(0);
  const totalRef = useRef(0);
  progressRef.current = progress;
  activeRef.current = active;
  loadedRef.current = loaded;
  totalRef.current = total;

  // Draw progress (0→1) — purely time-based, drives the line animation so it's
  // smooth by construction regardless of network jitter.
  const [drawT, setDrawT] = useState(0);
  // Readout number — follows real asset progress.
  const [readout, setReadout] = useState(0);
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const DRAW_MS = 7000; // slow, contemplative draw — heavy site, gives assets time to land
    const MIN_MS = 6500; // earliest we'll allow completion (lines must nearly finish drawing)
    const MAX_MS = 14000; // hard ceiling so a stalled asset never traps the loader
    const SETTLE_MS = 400; // grace period after assets ready, for shader compile + first paint
    let raf = 0;
    let readySince = 0;
    let readoutVal = 0;

    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const loop = () => {
      const elapsed = performance.now() - start;

      const dreiTotal = totalRef.current;
      const dreiLoaded = loadedRef.current;
      const imgTotal = imgTotalRef.current;
      const imgLoaded = imgLoadedRef.current;

      const dreiReady = !activeRef.current || (dreiTotal > 0 && dreiLoaded >= dreiTotal);
      const imagesReady = imgLoaded >= imgTotal;
      const fontsReady = fontsReadyRef.current;
      const assetsReady = dreiReady && imagesReady && fontsReady;

      if (assetsReady && !readySince) readySince = performance.now();
      const settled = readySince && performance.now() - readySince > SETTLE_MS;
      const canFinish = elapsed > MIN_MS && (settled || elapsed > MAX_MS);

      // Line draw: pure time-based ease-in-out from 0→1 over DRAW_MS. Once we're
      // cleared to finish, fast-forward to 1 smoothly.
      const baseT = Math.min(1, elapsed / DRAW_MS);
      const targetT = canFinish ? 1 : easeInOut(baseT);
      setDrawT(targetT);

      // Readout: lerp toward real asset progress so the number feels grounded.
      const combinedTotal = dreiTotal + imgTotal;
      const combinedLoaded = dreiLoaded + imgLoaded;
      const assetPct = combinedTotal > 0 ? (combinedLoaded / combinedTotal) * 100 : 0;
      const readoutTarget = canFinish ? 100 : Math.min(99, assetPct);
      readoutVal += (readoutTarget - readoutVal) * 0.1;
      setReadout(readoutVal);

      if (canFinish && targetT >= 1 && readoutVal > 99.4) {
        setReadout(100);
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Unmount shortly after the fade-out completes.
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setRemoved(true), 1100);
    return () => clearTimeout(t);
  }, [done]);

  const strokes = useMemo<Stroke[]>(() => {
    const faint = "rgba(238,232,214,0.10)";
    const soft = "rgba(238,232,214,0.16)";
    const bright = "rgba(240,235,220,0.32)";
    const gold = "rgba(255,210,140,0.32)";
    const list: Stroke[] = [];

    // Corner diagonals (cross at the focal point)
    list.push({ d: line(0, 0, VW, VH), color: soft, w: 1 });
    list.push({ d: line(VW, 0, 0, VH), color: soft, w: 1 });

    // Central axes
    list.push({ d: line(F.x, 0, F.x, VH), color: bright, w: 1 });
    list.push({ d: line(0, F.y, VW, F.y), color: bright, w: 1 });

    // Golden-section grid
    [0.382, 0.618].forEach((g) => {
      list.push({ d: line(VW * g, 0, VW * g, VH), color: faint, w: 1 });
      list.push({ d: line(0, VH * g, VW, VH * g), color: faint, w: 1 });
    });

    // Diagonals radiating from the focal point to golden edge points
    const targets: [number, number][] = [
      [VW * 0.382, 0], [VW * 0.618, 0], [VW, VH * 0.382], [VW, VH * 0.618],
      [VW * 0.618, VH], [VW * 0.382, VH], [0, VH * 0.618], [0, VH * 0.382],
    ];
    targets.forEach(([tx, ty]) => list.push({ d: line(F.x, F.y, tx, ty), color: soft, w: 1 }));

    // Concentric golden circles around the focus
    let r = 110;
    for (let i = 0; i < 4; i++) {
      list.push({ d: circle(F.x, F.y, r), color: faint, w: 1 });
      r *= PHI;
    }

    // Two opposing golden spirals in the corners
    list.push({ d: spiral(VW * 0.3, VH * 0.34, 26, 2.4, 1, -Math.PI / 2), color: gold, w: 1.2 });
    list.push({ d: spiral(VW * 0.7, VH * 0.66, 26, 2.4, -1, Math.PI / 2), color: bright, w: 1.2 });

    return list;
  }, []);

  if (removed) return null;

  const frac = drawT;
  // Stagger each stroke across the first ~55% of the draw timeline, each drawing over ~45%.
  const winSpan = 0.55;
  const drawDur = 0.45;

  return (
    <div
      style={{ opacity: done ? 0 : 1, transition: "opacity 1s ease", pointerEvents: done ? "none" : "auto" }}
      className="fixed inset-0 z-[100] bg-[#070707] overflow-hidden"
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {strokes.map((s, i) => {
          const startW = (i / strokes.length) * winSpan;
          const local = clamp01((frac - startW) / drawDur);
          return (
            <path
              key={i}
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth={s.w}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - local}
            />
          );
        })}
      </svg>

      {/* Wordmark at the convergence */}
      <div
        style={{ opacity: clamp01((frac - 0.1) / 0.3), transition: "opacity 0.4s ease" }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center select-none"
      >
        <span className="text-[11px] uppercase tracking-[0.6em] font-mono text-white/40">Renaissance '26</span>
        <h1 className="mt-3 text-5xl md:text-6xl leading-[0.95] text-[#f5f0e8]">
          <span className="font-sans font-light tracking-tight">Project</span>
          <br />
          <span className="font-serif italic text-transparent bg-clip-text bg-linear-to-r from-[#FFD700] via-[#FF6347] to-[#9370DB]">
            Chelsea
          </span>
        </h1>
      </div>

      {/* Subtle progress readout */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.4em] text-white/35 tabular-nums">
        {String(Math.round(readout)).padStart(3, "0")}
      </div>
    </div>
  );
}
