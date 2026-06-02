import React from "react";
import { motion } from "framer-motion";
import { X, Save } from "lucide-react";

export default function DreamEntry({ dream, onClose, onSave }) {
  if (!dream) return null;

  const isNew = !!onSave;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0b0f19]/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto px-6 py-12 min-h-screen flex flex-col">
        <header className="flex justify-between items-center mb-16">
          <span className="text-[#64748b] tracking-[0.2em] uppercase text-xs">
            {dream.timestamp}
          </span>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 rounded-full text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10 transition-all duration-300"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </header>

        <article className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-editorial text-4xl md:text-6xl font-light text-[#f8fafc] mb-12 leading-tight"
            style={{ textShadow: "0 0 40px rgba(255,255,255,0.1)" }}
          >
            {dream.title}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="prose prose-invert max-w-none"
          >
            <p className="font-editorial text-2xl md:text-3xl text-[#cbd5e1] leading-relaxed">
              {dream.structured}
            </p>
          </motion.div>

          {dream.tags && dream.tags.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="mt-20 flex flex-wrap gap-3 pt-10 border-t border-white/5"
            >
              {dream.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-white/5 text-xs uppercase tracking-widest text-[#94a3b8]"
                >
                  #{tag}
                </span>
              ))}
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-sm text-[#64748b] font-editorial italic shadow-inner"
          >
            <p className="mb-3 text-[#94a3b8] not-italic text-xs tracking-widest uppercase">Raw Memory Fragment:</p>
            <p className="leading-relaxed">
              {dream.raw}
            </p>
          </motion.div>
        </article>

        {isNew && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="sticky bottom-8 mt-16 flex justify-center"
          >
            <button
              onClick={() => onSave(dream)}
              className="flex items-center gap-3 px-8 py-4 bg-[#fde047] text-[#0f172a] rounded-full hover:bg-yellow-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(253,224,71,0.4)] transition-all duration-500"
            >
              <Save className="w-5 h-5" />
              <span className="uppercase tracking-[0.2em] text-xs font-semibold">Keep Fragment</span>
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
