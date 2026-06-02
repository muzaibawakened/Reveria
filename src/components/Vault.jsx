import React from "react";
import { motion } from "framer-motion";
import { Moon, Calendar } from "lucide-react";

export default function Vault({ dreams, onDreamSelect }) {
  if (!dreams || dreams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#94a3b8]">
        <Moon className="w-8 h-8 mb-4 opacity-50" />
        <p className="font-editorial italic text-lg">No dreams recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl pt-24 px-6 pb-32">
      <header className="mb-20 text-center">
        <h1 className="font-editorial text-5xl md:text-6xl font-light mb-3 text-[#f8fafc] tracking-wide" style={{ textShadow: "0 0 40px rgba(255,255,255,0.1)" }}>
          Reveria
        </h1>
        <p className="text-xs text-[#94a3b8] uppercase tracking-[0.3em]">
          Journal of Fragments
        </p>
      </header>

      <div className="masonry-grid">
        {dreams.map((dream, idx) => (
          <motion.div
            key={dream.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onDreamSelect(dream)}
            className="group cursor-pointer p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            <div className="flex items-center gap-2 mb-4 text-[10px] text-[#64748b] tracking-widest uppercase">
              <Calendar className="w-3 h-3" />
              <span>{dream.timestamp || "Unknown Date"}</span>
            </div>
            
            <h2 className="font-editorial text-2xl mb-4 text-[#e2e8f0] group-hover:text-[#fde047] transition-colors duration-500">
              {dream.title}
            </h2>
            
            <p className="font-editorial text-[#94a3b8] leading-relaxed line-clamp-4 italic">
              "{dream.structured || dream.raw}"
            </p>
            
            {dream.tags && dream.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {dream.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-black/20 text-[10px] uppercase tracking-widest text-[#64748b] group-hover:text-[#94a3b8] transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
