import React, { useMemo } from "react";
import { motion } from "framer-motion";

// ─── CSS-only star field (GPU-composited, zero JS animation cost) ───────────
// Stars are plain divs animated purely via CSS keyframes so they never block
// the JS main thread. This eliminates the mobile PWA lag caused by 60+ Framer
// Motion instances running simultaneously.

const ANIMATION_CLASSES = ["star-twinkle", "star-twinkle-slow", "star-twinkle-fast"];

export default function Particles({ count = 80, variant = "stars" }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const dur = (Math.random() * 4 + 2.5).toFixed(2); // 2.5s – 6.5s
      const delay = (Math.random() * 6).toFixed(2);     // 0s – 6s
      const size = Math.random() * 2 + 0.5;             // 0.5px – 2.5px

      // Colour bucket: violet / gold / white
      let color, shadow;
      if (i % 7 === 0) {
        color = "rgba(124, 106, 239, 0.8)";
        shadow = "0 0 6px rgba(124, 106, 239, 0.5)";
      } else if (i % 4 === 0) {
        color = "rgba(201, 169, 110, 0.65)";
        shadow = "0 0 4px rgba(201, 169, 110, 0.3)";
      } else {
        color = "rgba(230, 225, 240, 0.7)";
        shadow = "0 0 3px rgba(230, 225, 240, 0.15)";
      }

      // Pick one of three animation speeds
      const animClass = ANIMATION_CLASSES[i % 3];

      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        color,
        shadow,
        animClass,
        dur,
        delay,
      };
    });
  }, [count]);

  if (variant === "stars") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">

        {/* ── CSS-only star field ─────────────────────────────────────────── */}
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full ${p.animClass}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: p.shadow,
              // CSS custom properties drive the animation timing per-star
              "--star-dur": `${p.dur}s`,
              "--star-delay": `${p.delay}s`,
            }}
          />
        ))}

        {/* ── Shooting stars (Framer Motion — only 5, infrequent) ─────────── */}

        {/* #1 — White, top-right to bottom-left */}
        <motion.div
          className="absolute"
          style={{
            width: 2, height: 2,
            background: "rgba(230, 225, 240, 0.9)",
            borderRadius: "50%",
            boxShadow: "0 0 6px 2px rgba(230, 225, 240, 0.3)",
            top: "10%", left: "80%",
          }}
          animate={{ x: [0, -400], y: [0, 200], opacity: [0, 1, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 12, ease: "easeOut" }}
        >
          <div style={{ position: "absolute", top: 0, left: 2, width: 40, height: 1,
            background: "linear-gradient(90deg, rgba(230,225,240,0.4), transparent)", borderRadius: 1 }} />
        </motion.div>

        {/* #2 — Violet, bottom-left to top-right */}
        <motion.div
          className="absolute"
          style={{
            width: 1.5, height: 1.5,
            background: "rgba(124, 106, 239, 0.8)",
            borderRadius: "50%",
            boxShadow: "0 0 5px 2px rgba(124, 106, 239, 0.2)",
            top: "25%", left: "20%",
          }}
          animate={{ x: [0, 350], y: [0, 150], opacity: [0, 0.8, 0.8, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 18, delay: 6, ease: "easeOut" }}
        >
          <div style={{ position: "absolute", top: 0, right: 2, width: 30, height: 1,
            background: "linear-gradient(270deg, rgba(124,106,239,0.3), transparent)", borderRadius: 1 }} />
        </motion.div>

        {/* #3 — Warm white, top-right to top-left */}
        <motion.div
          className="absolute"
          style={{
            width: 2, height: 2,
            background: "rgba(255, 240, 200, 0.9)",
            borderRadius: "50%",
            boxShadow: "0 0 6px 2px rgba(255, 240, 200, 0.3)",
            top: "70%", left: "90%",
          }}
          animate={{ x: [0, -500], y: [0, -150], opacity: [0, 1, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 15, delay: 4, ease: "easeOut" }}
        >
          <div style={{ position: "absolute", top: 0, left: 2, width: 50, height: 1,
            background: "linear-gradient(90deg, rgba(255,240,200,0.4), transparent)", borderRadius: 1 }} />
        </motion.div>

        {/* #4 — Ice blue, mid-left arcing up */}
        <motion.div
          className="absolute"
          style={{
            width: 1.5, height: 1.5,
            background: "rgba(200, 220, 255, 0.8)",
            borderRadius: "50%",
            boxShadow: "0 0 5px 2px rgba(200, 220, 255, 0.2)",
            top: "40%", left: "10%",
          }}
          animate={{ x: [0, 400], y: [0, -200], opacity: [0, 0.8, 0.8, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 20, delay: 10, ease: "easeOut" }}
        >
          <div style={{ position: "absolute", top: 0, right: 2, width: 35, height: 1,
            background: "linear-gradient(270deg, rgba(200,220,255,0.3), transparent)", borderRadius: 1 }} />
        </motion.div>

        {/* #5 — Pink/mauve, top-center sweeping down */}
        <motion.div
          className="absolute"
          style={{
            width: 2.5, height: 2.5,
            background: "rgba(250, 210, 250, 0.9)",
            borderRadius: "50%",
            boxShadow: "0 0 6px 2px rgba(250, 210, 250, 0.4)",
            top: "5%", left: "40%",
          }}
          animate={{ x: [0, -300], y: [0, 300], opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 10, delay: 2, ease: "easeOut" }}
        >
          <div style={{ position: "absolute", top: 0, left: 2, width: 45, height: 1,
            background: "linear-gradient(90deg, rgba(250,210,250,0.5), transparent)",
            transform: "rotate(45deg)", transformOrigin: "left center", borderRadius: 1 }} />
        </motion.div>

      </div>
    );
  }

  // ── Fallback: golden motes (also CSS-only) ────────────────────────────────
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full star-twinkle-slow"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size * 1.5,
            height: p.size * 1.5,
            background: "radial-gradient(circle, rgba(201,169,110,0.6), transparent)",
            "--star-dur": `${p.dur}s`,
            "--star-delay": `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}