import React from "react";
import { motion } from "framer-motion";
import { PenLine } from "lucide-react";

export default function EmptyState({ onNavigateRecord }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center py-24 relative z-10"
    >
      {/* Decorative symbol */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8"
      >
        <span className="text-6xl opacity-20">☽</span>
      </motion.div>

      <h3 className="font-editorial text-3xl md:text-4xl font-light italic text-parchment-mid mb-4">
        Your journal awaits
      </h3>
      <p className="text-text-ghost text-sm max-w-md leading-relaxed mb-10">
        No dreams captured yet. Speak your dream aloud or write it down — 
        let the ancient pages remember what the waking mind forgets.
      </p>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNavigateRecord}
        className="flex items-center gap-3 btn-gold px-8 py-3.5 rounded-full font-ui text-xs uppercase tracking-[0.2em] font-semibold"
      >
        <PenLine className="w-4 h-4" />
        Record Your First Dream
      </motion.button>
    </motion.div>
  );
}