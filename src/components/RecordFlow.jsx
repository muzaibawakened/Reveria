import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, X } from "lucide-react";
import { MOCK_TRANSCRIPTION } from "../data";

export default function RecordFlow({ onComplete, onCancel }) {
  const [state, setState] = useState("idle"); // idle, recording, transcribing, structuring
  const [typedText, setTypedText] = useState("");

  // Simulated transcription typing effect
  useEffect(() => {
    if (state === "transcribing") {
      let currentIndex = 0;
      const text = MOCK_TRANSCRIPTION;
      setTypedText("");

      const interval = setInterval(() => {
        setTypedText(text.substring(0, currentIndex + 1));
        currentIndex++;
        
        if (currentIndex === text.length) {
          clearInterval(interval);
          setTimeout(() => setState("structuring"), 1500);
        }
      }, 30); // Speed of typing

      return () => clearInterval(interval);
    }
  }, [state]);

  // Simulated structuring delay
  useEffect(() => {
    if (state === "structuring") {
      const timer = setTimeout(() => {
        // Create the final structured dream
        const newDream = {
          id: Date.now(),
          raw: MOCK_TRANSCRIPTION,
          title: "The Upside Down Forest",
          timestamp: "Just now",
          structured: "I stood by a lake of perfect glass beneath a lavender sky. Enormous trees grew inverted from the clouds, their roots grasping at the air. A familiar, untraceable melody drifted through the quiet.",
          tags: ["lake", "upside-down", "melody"],
        };
        onComplete(newDream);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state, onComplete]);

  const handleMicClick = () => {
    if (state === "idle") {
      setState("recording");
    } else if (state === "recording") {
      setState("transcribing");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0f19]/80 backdrop-blur-2xl px-6"
    >
      <button 
        onClick={onCancel}
        className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10 transition-all duration-300"
      >
        <X className="w-5 h-5" strokeWidth={1.5} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl">
        <AnimatePresence mode="wait">
          
          {/* IDLE / RECORDING STATE */}
          {(state === "idle" || state === "recording") && (
            <motion.div
              key="record-ui"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-16">
                {/* Breathing aura when recording */}
                {state === "recording" && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#fde047]"
                    animate={{ scale: [1, 2.5], opacity: [0.2, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                
                <button
                  onClick={handleMicClick}
                  className={`relative flex items-center justify-center w-28 h-28 rounded-full transition-all duration-700 shadow-2xl ${
                    state === "idle" 
                      ? "bg-[#1e293b] border border-[#334155] hover:border-[#fde047]/50" 
                      : "bg-[#fde047] shadow-[0_0_40px_rgba(253,224,71,0.5)]"
                  }`}
                >
                  {state === "idle" ? (
                    <Mic className="w-10 h-10 text-[#fde047]" strokeWidth={1.5} />
                  ) : (
                    <Square className="w-10 h-10 text-[#0f172a]" fill="currentColor" />
                  )}
                </button>
              </div>

              <div className="h-8 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={state}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-[#94a3b8] tracking-[0.3em] uppercase text-xs"
                  >
                    {state === "idle" ? "Speak your dream" : "Recording fragment..."}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* TRANSCRIBING STATE */}
          {state === "transcribing" && (
            <motion.div
              key="transcribing-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full text-center px-4"
            >
              <p className="font-editorial text-3xl md:text-5xl leading-relaxed text-[#cbd5e1] italic" style={{ textShadow: "0 0 20px rgba(255,255,255,0.05)" }}>
                "{typedText}<span className="cursor-blink"></span>"
              </p>
            </motion.div>
          )}

          {/* STRUCTURING STATE */}
          {state === "structuring" && (
            <motion.div
              key="structuring-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-px h-24 bg-gradient-to-b from-transparent via-[#fde047] to-transparent animate-pulse mb-8 opacity-50" />
              <p className="text-[#fde047] tracking-[0.3em] uppercase text-xs animate-pulse opacity-80">
                Distilling Meaning
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
