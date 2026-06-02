import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Moon } from "lucide-react";

export default function Header({ currentView, onNavigate }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-40 px-6 py-3 flex items-center"
    >
      {/* Logo — left aligned, small */}
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => onNavigate("record")}
      >
        <Moon className="w-4 h-4 text-gold opacity-50 group-hover:opacity-90 transition-all duration-500" strokeWidth={1.5} />
        <h1 className="font-editorial text-lg font-light tracking-[0.15em] text-shimmer select-none uppercase">
          Reveria
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Nav — icon only */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate(currentView === "record" ? "vault" : "record")}
        className="p-2.5 rounded-full border border-white/[0.06] hover:border-gold/20 transition-all duration-300 group"
        title={currentView === "record" ? "Your Dreams" : "Record Dream"}
      >
        <BookOpen className="w-4 h-4 text-text-secondary group-hover:text-gold transition-colors" strokeWidth={1.5} />
      </motion.button>
    </motion.header>
  );
}