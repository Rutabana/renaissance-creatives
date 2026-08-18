import { useRef, useState, type FormEvent } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, easeInOut } from "motion/react";
import { Canvas } from "@react-three/fiber";
import { ScriptoriumScene } from "../three/scriptorium-scene";
import { AscensionScene } from "../three/ascension-scene";
import { GlassModal } from "../ui/glass-modal";
import { supabase } from "../../lib/supabase";

type SubmitStatus = "idle" | "sending" | "done" | "error";

// The two closing chapters laid out side by side. One tall scroll runs three
// phases: pan right through the cathedral → slide the track left so the
// cathedral exits and the garden enters from the right (through a wash of
// light) → march up the garden path into a blinding white-out where a small
// comment box resolves.
export function FinaleSection({ onWhiteout }: { onWhiteout?: (full: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  // Phase ranges (of the whole section's scroll)
  const cathedralP = useTransform(scrollYProgress, [0, 0.45], [0, 1], { clamp: true });
  const trackX = useTransform(scrollYProgress, [0.45, 0.55], ["0vw", "-100vw"], {
    clamp: true,
    ease: easeInOut,
  });
  // A warm doorway of light bridges the cathedral and the garden so the hand-off
  // reads as passing through light rather than a hard cut.
  const seamFlash = useTransform(scrollYProgress, [0.42, 0.5, 0.58], [0, 0.9, 0]);
  const gardenP = useTransform(scrollYProgress, [0.55, 1], [0, 1], { clamp: true });

  // Garden finale overlay (driven by gardenP, 0→1 across the march)
  const eyebrowOpacity = useTransform(gardenP, [0.02, 0.12, 0.3, 0.44], [0, 1, 1, 0]);
  const headingOpacity = useTransform(gardenP, [0.48, 0.6, 0.76, 0.85], [0, 1, 1, 0]);
  const headingY = useTransform(gardenP, [0.48, 0.6], [40, 0]);
  const whiteout = useTransform(gardenP, [0.58, 0.85], [0, 1]);
  const boxOpacity = useTransform(gardenP, [0.86, 0.97], [0, 1]);
  const boxScale = useTransform(gardenP, [0.86, 0.97], [0.95, 1]);
  const boxPointer = useTransform(gardenP, (p) => (p > 0.88 ? "auto" : "none"));

  // Tell the parent to strip the chrome once we're fully in the light.
  useMotionValueEvent(whiteout, "change", (v) => onWhiteout?.(v > 0.92));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || status === "sending") return;
    setStatus("sending");

    const entry = { name: name.trim() || null, body: comment.trim() };

    if (!supabase) {
      // No backend configured yet — keep the submission locally so nothing is lost.
      try {
        const prev = JSON.parse(localStorage.getItem("rc_comments") || "[]");
        prev.push({ ...entry, created_at: new Date().toISOString() });
        localStorage.setItem("rc_comments", JSON.stringify(prev));
        setStatus("done");
      } catch {
        setStatus("error");
      }
      return;
    }

    const { error } = await supabase.from("comments").insert(entry);
    setStatus(error ? "error" : "done");
  };

  return (
    <div ref={ref} id="scriptorium" style={{ height: "800vh" }} className="relative">
      {/* Anchor for the "Ascension" nav link — lands roughly where the garden begins. */}
      <div id="ascension" className="absolute left-0 w-px" style={{ top: "55%" }} />

      <div className="sticky top-0 h-screen w-screen overflow-hidden bg-black">
        <motion.div style={{ x: trackX }} className="flex h-screen w-[200vw]">

          {/* ── Pane 1 — Cathedral / Scriptorium ── */}
          <div className="relative h-screen w-screen shrink-0">
            <Canvas>
              <ScriptoriumScene scrollProgress={cathedralP} onBookClick={(p) => setSelectedProject(p)} />
            </Canvas>
          </div>

          {/* ── Pane 2 — Garden / Ascension ── */}
          <div className="relative h-screen w-screen shrink-0 bg-[#f3e3bd]">
            <div className="absolute inset-0">
              <AscensionScene scrollProgress={gardenP} />
            </div>

            {/* Eyebrow at the foot of the path */}
            <motion.div
              style={{ opacity: eyebrowOpacity }}
              className="absolute top-[12%] left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
            >
              <p className="text-[10px] uppercase tracking-[0.6em] font-mono text-[#5a4a25]">Chapter V</p>
              <h2 className="mt-2 text-[clamp(2.5rem,6vw,5rem)] font-serif italic text-[#3a2f15] leading-none">
                The Ascension
              </h2>
            </motion.div>

            {/* Blinding white-out */}
            <motion.div style={{ opacity: whiteout }} className="absolute inset-0 bg-white pointer-events-none z-10" />

            {/* Final message, dissolving into the light */}
            <motion.div
              style={{ opacity: headingOpacity, y: headingY }}
              className="absolute inset-0 flex items-center justify-center text-center px-6 pointer-events-none z-20"
            >
              <h3 className="max-w-4xl text-[clamp(2rem,5.5vw,4.5rem)] font-serif italic text-[#2a2008] leading-[1.12]">
                Embark with me on this journey we call life
              </h3>
            </motion.div>

            {/* Comment box on the pure white */}
            <motion.div
              style={{ opacity: boxOpacity }}
              className="absolute inset-0 flex items-center justify-center px-6 z-30 pointer-events-none"
            >
              <motion.div
                style={{ scale: boxScale, pointerEvents: boxPointer }}
                className="w-full max-w-md rounded-2xl border border-black/10 bg-white/80 p-7 text-center shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-md"
              >
                {status === "done" ? (
                  <div className="py-4">
                    <p className="text-[10px] uppercase tracking-[0.5em] font-mono text-neutral-500">Received</p>
                    <h4 className="mt-3 font-serif italic text-2xl text-neutral-900">Thank you for walking with me.</h4>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="text-left">
                    <p className="text-center text-[10px] uppercase tracking-[0.5em] font-mono text-neutral-500">
                      Leave your mark
                    </p>
                    <h4 className="mt-3 mb-5 text-center font-serif italic text-2xl text-neutral-900">
                      A word before you go.
                    </h4>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name (optional)"
                      className="mb-3 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                    />
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      rows={3}
                      placeholder="Leave a comment…"
                      className="w-full resize-none rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                    />
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm uppercase tracking-[0.25em] font-mono text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                    >
                      {status === "sending" ? "Sending…" : "Send"}
                      <span aria-hidden>→</span>
                    </button>
                    {status === "error" && (
                      <p className="mt-3 text-center text-xs text-red-600">Something went wrong — please try again.</p>
                    )}
                  </form>
                )}
              </motion.div>
            </motion.div>
          </div>

        </motion.div>

        {/* Seam light — sits above both panes during the cathedral→garden slide */}
        <motion.div
          style={{
            opacity: seamFlash,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,249,233,0.96) 0%, rgba(255,240,205,0.6) 45%, rgba(255,232,185,0) 75%)",
          }}
          className="absolute inset-0 z-40 pointer-events-none"
        />
      </div>

      <GlassModal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} project={selectedProject} />
    </div>
  );
}
