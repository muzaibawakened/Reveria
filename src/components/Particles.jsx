import React, { useMemo } from "react";
import { motion } from "framer-motion";

export default function Particles({ count = 60, variant = "stars" }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
  }, [count]);

  if (variant === "stars") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {/* Star field */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.id % 7 === 0
                ? "rgba(124, 106, 239, 0.8)"
                : p.id % 4 === 0
                ? "rgba(201, 169, 110, 0.6)"
                : "rgba(230, 225, 240, 0.7)",
              boxShadow: p.id % 7 === 0
                ? "0 0 6px rgba(124, 106, 239, 0.5)"
                : p.id % 4 === 0
                ? "0 0 4px rgba(201, 169, 110, 0.3)"
                : "0 0 3px rgba(230, 225, 240, 0.15)",
            }}
            animate={{
              opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Shooting star — crosses occasionally */}
        <motion.div
          className="absolute"
          style={{
            width: 2,
            height: 2,
            background: "rgba(230, 225, 240, 0.9)",
            borderRadius: "50%",
            boxShadow: "0 0 6px 2px rgba(230, 225, 240, 0.3)",
            top: "10%",
            left: "80%",
          }}
          animate={{
            x: [0, -400],
            y: [0, 200],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 12,
            ease: "easeOut",
          }}
        >
          {/* Tail */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 2,
              width: 40,
              height: 1,
              background: "linear-gradient(90deg, rgba(230,225,240,0.4), transparent)",
              transform: "rotate(0deg)",
              transformOrigin: "left center",
              borderRadius: 1,
            }}
          />
        </motion.div>

        {/* Second shooting star — delayed, opposite direction */}
        <motion.div
          className="absolute"
          style={{
            width: 1.5,
            height: 1.5,
            background: "rgba(124, 106, 239, 0.8)",
            borderRadius: "50%",
            boxShadow: "0 0 5px 2px rgba(124, 106, 239, 0.2)",
            top: "25%",
            left: "20%",
          }}
          animate={{
            x: [0, 350],
            y: [0, 150],
            opacity: [0, 0.8, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 18,
            delay: 6,
            ease: "easeOut",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 2,
              width: 30,
              height: 1,
              background: "linear-gradient(270deg, rgba(124,106,239,0.3), transparent)",
              borderRadius: 1,
            }}
          />
        </motion.div>
      </div>
    );
  }

  // Fallback: golden motes
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size * 1.5,
            height: p.size * 1.5,
            background: "radial-gradient(circle, rgba(201,169,110,0.6), transparent)",
          }}
          animate={{
            y: [-10, -30, -10],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration * 1.5,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}