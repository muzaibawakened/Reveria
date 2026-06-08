import React, { useState } from "react";
import { motion } from "framer-motion";
import MoodBadge from "./MoodBadge";
import OrnamentalDivider from "./OrnamentalDivider";
import { Check, RotateCcw, PenLine, RefreshCw, X } from "lucide-react";
import useGroqStructuring from "../hooks/useGroqStructuring";

export default function DreamPreview({ dream, onSave, onDiscard, onUpdate }) {
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [editRawText, setEditRawText] = useState(dream?.raw || "");
  const { structureDream, structuring } = useGroqStructuring();

  const handleSaveRaw = async () => {
    if (editRawText.trim() === dream.raw) {
      setIsEditingRaw(false);
      return;
    }
    if (onUpdate) onUpdate({ raw: editRawText.trim() });
    setIsEditingRaw(false);
  };

  const handleRegenerate = async () => {
    if (onUpdate) onUpdate({ aiStatus: "processing" });
    const result = await structureDream(dream.raw);
    if (onUpdate) onUpdate(result);
  };
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <p className="text-[10px] font-ui uppercase tracking-[0.3em] text-text-ghost">
              Distilled Memory
            </p>
            {onUpdate && !structuring && (
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-ui uppercase tracking-[0.1em] text-text-ghost hover:text-violet transition-colors group self-start sm:self-auto border border-border/30 hover:border-violet/30 bg-white/5"
                title="Regenerate Dream Structure"
              >
                <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                Retell
              </button>
            )}
            {structuring && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-ui uppercase tracking-[0.1em] text-text-ghost">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-violet"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Re-weaving…
              </div>
            )}
          </div>
          <p className="font-editorial text-xl md:text-2xl leading-relaxed text-parchment-mid italic">
            {dream.structured}
          </p>
        </div>

        {/* Raw transcription */}
        <div className="relative z-10 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <p className="text-[10px] font-ui uppercase tracking-[0.3em] text-text-ghost">
              Raw Memory
            </p>
            {!isEditingRaw && onUpdate && (
              <button
                onClick={() => {
                  setEditRawText(dream.raw);
                  setIsEditingRaw(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-ui uppercase tracking-[0.1em] text-text-ghost hover:text-gold transition-colors self-start sm:self-auto border border-border/30 hover:border-gold/30 bg-white/5"
              >
                <PenLine className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
          {isEditingRaw ? (
            <div className="flex flex-col gap-4 bg-white/5 rounded-2xl p-4 border border-border/30">
              <textarea
                value={editRawText}
                onChange={(e) => setEditRawText(e.target.value)}
                className="w-full bg-transparent text-text-ghost text-sm leading-relaxed italic font-editorial outline-none resize-none min-h-[100px]"
                autoFocus
              />
              <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-border/30">
                <button
                  onClick={() => setIsEditingRaw(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] sm:text-xs font-ui uppercase tracking-[0.1em] text-text-ghost hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  onClick={handleSaveRaw}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] sm:text-xs font-ui uppercase tracking-[0.1em] text-gold hover:bg-gold/10 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-text-ghost text-sm leading-relaxed italic">
              "{dream.raw}"
            </p>
          )}
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