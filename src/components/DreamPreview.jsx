import React from "react";
import { motion } from "framer-motion";
import MoodBadge from "./MoodBadge";
import OrnamentalDivider from "./OrnamentalDivider";
import { Check, RotateCcw } from "lucide-react";

export default function DreamPreview({ dream, onSave, onDiscard }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="parchment-card rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[var(--shadow-card-hover)]">
        {/* Mood glow */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: dream.moodColor }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div>
            <p className="text-[10px] font-ui uppercase tracking-[0.3em] text-text-ghost mb-2">
              Dream Captured
            </p>
            <MoodBadge mood={dream.mood} color={dream.moodColor} size="md" />
          </div>
        </div>

        {/* Title */}
        <h2 className="font-editorial text-4xl md:text-5xl font-light italic text-parchment mb-6 relative z-10 ink-bleed">
          {dream.title}
        </h2>

        <OrnamentalDivider />

        {/* Structured text */}
        <div className="relative z-10 mb-8">
          <p className="text-[10px] font-ui uppercase tracking-[0.3em] text-text-ghost mb-4">
            Distilled Memory
          </p>
          <p className="font-editorial text-xl md:text-2xl leading-relaxed text-parchment-mid italic">
            {dream.structured}
          </p>
        </div>

        {/* Raw transcription */}
        <div className="relative z-10 mb-8">
          <p className="text-[10px] font-ui uppercase tracking-[0.3em] text-text-ghost mb-4">
            Raw Memory
          </p>
          <p className="text-text-ghost text-sm leading-relaxed italic">
            "{dream.raw}"
          </p>
        </div>

        {/* Tags */}
        {dream.tags && dream.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 relative z-10">
            {dream.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-ui tracking-wider text-gold/70 border border-gold/20 bg-gold/5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 relative z-10 pt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSave(dream)}
            className="flex items-center gap-3 btn-gold px-8 py-3.5 rounded-full font-ui text-xs uppercase tracking-[0.2em] font-semibold"
          >
            <Check className="w-4 h-4" />
            Save to Journal
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDiscard}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full font-ui text-xs uppercase tracking-[0.2em] text-text-ghost hover:text-text-secondary transition-colors border border-border hover:border-border-hover"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Discard
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}