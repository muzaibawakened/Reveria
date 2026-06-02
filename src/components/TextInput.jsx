import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function TextInput({ value, onChange, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="parchment-surface rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)]">
        {/* Decorative top line */}
        <div className="flex items-center gap-2 mb-5 opacity-40">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-[10px] font-ui uppercase tracking-[0.3em] text-text-ghost">
            Written Fragment
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="What did you dream last night..."
          rows={6}
          className="w-full bg-transparent border-none outline-none resize-none font-editorial text-xl md:text-2xl leading-relaxed text-text-primary placeholder:text-text-ghost placeholder:italic focus:ring-0 selection:bg-gold/20"
          style={{ caretColor: "var(--color-gold)" }}
        />

        {/* Word count */}
        <div className="flex justify-end mt-4 pt-4 border-t border-border">
          <span className="text-[10px] font-ui uppercase tracking-[0.2em] text-text-ghost">
            {value ? value.trim().split(/\s+/).filter(Boolean).length : 0} words
          </span>
        </div>
      </div>
    </motion.div>
  );
}