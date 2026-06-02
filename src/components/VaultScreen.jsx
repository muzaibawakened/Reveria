import React from "react";
import { motion } from "framer-motion";
import DreamCard from "./DreamCard";
import EmptyState from "./EmptyState";
import Particles from "./Particles";

export default function VaultScreen({ dreams, onSelectDream, onNavigateRecord, loading }) {
  return (
    <div className="relative min-h-screen px-6 pt-28 pb-16 overflow-hidden">
      <Particles count={15} />

      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto mb-12"
      >
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-[10px] font-ui uppercase tracking-[0.4em] text-text-ghost mb-3">
              Your Dream Journal
            </p>
            <h2 className="font-editorial text-5xl md:text-6xl font-light italic text-parchment">
              The Vault
            </h2>
          </div>
          <span className="text-text-ghost text-xs font-ui tracking-wider">
            {dreams.length} {dreams.length === 1 ? "dream" : "dreams"} captured
          </span>
        </div>

        {/* Ornamental line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="h-px w-full mt-6 origin-left"
          style={{
            background: "linear-gradient(90deg, var(--color-gold), transparent)",
            opacity: 0.3,
          }}
        />
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center justify-center py-20">
          <motion.div
            className="w-px h-16 mb-6"
            style={{
              background: "linear-gradient(to bottom, transparent, var(--color-violet), transparent)",
            }}
            animate={{ scaleY: [0.8, 1.1, 0.8], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="text-text-ghost text-xs font-ui tracking-[0.2em] uppercase">
            Gathering your dreams…
          </p>
        </div>
      ) : dreams.length === 0 ? (
        /* Empty State */
        <EmptyState onNavigateRecord={onNavigateRecord} />
      ) : (
        /* Dream Grid */
        <div className="dream-grid max-w-6xl mx-auto relative z-10">
          {dreams.map((dream, idx) => (
            <DreamCard
              key={dream.id}
              dream={dream}
              index={idx}
              onClick={onSelectDream}
            />
          ))}
        </div>
      )}
    </div>
  );
}
