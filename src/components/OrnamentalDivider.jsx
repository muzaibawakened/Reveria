import React from "react";
import { motion } from "framer-motion";

export default function OrnamentalDivider({ symbol = "✦", className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`ornament-divider my-8 ${className}`}
    >
      <span className="text-gold text-xs opacity-60">{symbol}</span>
    </motion.div>
  );
}