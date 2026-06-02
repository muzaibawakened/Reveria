import React from "react";
import { motion } from "framer-motion";
import MoodBadge from "./MoodBadge";
import { formatTimestamp } from "../data";

export default function DreamCard({ dream, index, onClick }) {
  const rotation = ((index % 3) - 1) * 2;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30, rotate: rotation }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      whileHover={{ rotate: 0, y: -6, scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onClick(dream)}
      className="group cursor-pointer parchment-card rounded-2xl p-6 relative overflow-hidden"
      style={{
        boxShadow: "var(--shadow-card)",
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Subtle mood glow in corner */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
        style={{ backgroundColor: dream.moodColor }}
      />

      {/* Title */}
      <h3 className="font-editorial text-2xl font-light italic text-parchment mb-4 leading-tight group-hover:text-shimmer transition-all duration-500">
        {dream.title}
      </h3>

      {/* Structured excerpt or processing indicator */}
      {dream.aiStatus === "pending" || dream.aiStatus === "processing" ? (
        <div className="mb-6 flex items-center gap-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-violet"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-text-ghost text-xs font-ui tracking-wider">
            {dream.aiStatus === "pending" ? "Weaving…" : "Almost there…"}
          </span>
        </div>
      ) : (
        <p className="text-text-secondary text-sm leading-relaxed font-sans mb-6 line-clamp-3">
          {dream.structured}
        </p>
      )}

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MoodBadge mood={dream.mood} color={dream.moodColor} size="sm" />
          <span className="text-[10px] font-ui text-text-ghost tracking-wider uppercase">
            {formatTimestamp(dream.timestamp)}
          </span>
        </div>
        {dream.duration && (
          <span className="text-[10px] font-ui text-text-ghost tracking-wider">
            {dream.duration}
          </span>
        )}
      </div>

      {/* Tags */}
      {dream.tags && dream.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {dream.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[9px] font-ui uppercase tracking-wider text-gold/60 border border-gold/15"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Raw text peek */}
      {dream.raw && (
        <p className="mt-4 text-text-ghost text-xs italic leading-relaxed line-clamp-2 opacity-50">
          "{dream.raw.substring(0, 100)}..."
        </p>
      )}
    </motion.article>
  );
}