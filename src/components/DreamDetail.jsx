import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, PenLine, RefreshCw, Check, X } from "lucide-react";
import MoodBadge from "./MoodBadge";
import OrnamentalDivider from "./OrnamentalDivider";
import { formatTimestamp } from "../data";
import useGroqStructuring from "../hooks/useGroqStructuring";

export default function DreamDetail({ dream, onBack, onDelete, onUpdate }) {
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [editRawText, setEditRawText] = useState(dream?.raw || "");
  const { structureDream, structuring } = useGroqStructuring();

  if (!dream) return null;

  const handleSaveRaw = async () => {
    if (editRawText.trim() === dream.raw) {
      setIsEditingRaw(false);
      return;
    }
    await onUpdate(dream.id, { raw: editRawText.trim() });
    setIsEditingRaw(false);
  };

  const handleRegenerate = async () => {
    await onUpdate(dream.id, { aiStatus: "processing" });
    const result = await structureDream(dream.raw);
    await onUpdate(dream.id, result);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen px-6 pt-28 pb-16 relative"
    >
      {/* Background mood glow */}
      <div
        className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full opacity-5 blur-[120px] pointer-events-none"
        style={{ backgroundColor: dream.moodColor }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onClick={onBack}
          className="flex items-center gap-2 mb-10 text-text-ghost hover:text-gold transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-ui uppercase tracking-[0.2em]">Back to Vault</span>
        </motion.button>

        {/* Metadata row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-4 mb-6 flex-wrap"
        >
          <MoodBadge mood={dream.mood} color={dream.moodColor} size="md" />
          <span className="text-text-ghost text-xs font-ui tracking-wider">
            {formatTimestamp(dream.timestamp)}
          </span>
          {dream.duration && (
            <span className="text-text-ghost text-xs font-ui tracking-wider">
              · {dream.duration}
            </span>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-editorial text-4xl sm:text-5xl md:text-7xl font-light italic text-parchment mb-8 leading-tight"
        >
          {dream.title}
        </motion.h1>

        <OrnamentalDivider />

        {/* Structured Dream Text */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <p className="text-[10px] font-ui uppercase tracking-[0.3em] text-text-ghost">
              The Dream
            </p>
            {(dream.aiStatus === "done" || dream.aiStatus === "error") && !structuring && (
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-ui uppercase tracking-[0.1em] text-text-ghost hover:text-violet transition-colors group self-start sm:self-auto"
                title="Regenerate Dream Structure"
              >
                <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                Retell
              </button>
            )}
          </div>
          <p className="font-editorial text-2xl md:text-3xl leading-relaxed text-parchment-mid italic">
            {dream.structured}
          </p>
        </motion.section>

        {/* AI Processing Indicator */}
        {(dream.aiStatus === "pending" || dream.aiStatus === "processing" || structuring) && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mb-10"
          >
            <div className="parchment-card rounded-2xl p-6 flex items-center gap-4">
              <motion.div
                className="w-2 h-2 rounded-full bg-violet"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p className="text-xs font-ui tracking-[0.15em] text-text-ghost">
                {structuring ? "Re-weaving your dream…" : "Weaving your dream…"}
              </p>
            </div>
          </motion.section>
        )}

        {/* Tags */}
        {dream.tags && dream.tags.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mb-10"
          >
            <p className="text-[10px] font-ui uppercase tracking-[0.3em] text-text-ghost mb-4">
              Themes
            </p>
            <div className="flex flex-wrap gap-2">
              {dream.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-ui tracking-wider text-gold/70 border border-gold/20 bg-gold/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        <OrnamentalDivider symbol="☽" />

        {/* Raw Transcription */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <p className="text-[10px] font-ui uppercase tracking-[0.3em] text-text-ghost">
              Raw Memory
            </p>
            {!isEditingRaw && (
              <button
                onClick={() => {
                  setEditRawText(dream.raw);
                  setIsEditingRaw(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-ui uppercase tracking-[0.1em] text-text-ghost hover:text-gold transition-colors self-start sm:self-auto"
              >
                <PenLine className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
          <div className="parchment-surface rounded-2xl p-6 md:p-8">
            {isEditingRaw ? (
              <div className="flex flex-col gap-4">
                <textarea
                  value={editRawText}
                  onChange={(e) => setEditRawText(e.target.value)}
                  className="w-full bg-transparent text-text-ghost text-base leading-relaxed italic font-editorial outline-none resize-none min-h-[100px]"
                  autoFocus
                />
                <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-border/30">
                  <button
                    onClick={() => setIsEditingRaw(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] sm:text-xs font-ui uppercase tracking-[0.1em] text-text-ghost hover:bg-white/5 transition-colors"
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
              <p className="text-text-ghost text-base leading-relaxed italic font-editorial break-words">
                "{dream.raw}"
              </p>
            )}
          </div>
        </motion.section>

        {/* Delete button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex justify-center pt-4"
        >
          <button
            onClick={() => onDelete(dream.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-ui uppercase tracking-[0.15em] text-text-ghost hover:text-red-400 border border-border hover:border-red-400/30 transition-all duration-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Release this Dream
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}