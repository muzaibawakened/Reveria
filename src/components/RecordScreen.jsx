import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, PenLine } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import TextInput from "./TextInput";
import DreamPreview from "./DreamPreview";
import Particles from "./Particles";
import {
  MOCK_TRANSCRIPTION,
  MOCK_STRUCTURED,
  MOCK_TITLE,
  MOCK_TAGS,
  MOCK_MOOD,
  MOCK_MOOD_COLOR,
} from "../data";

const WEAVING_PHRASES = [
  "Listening to the echoes…",
  "Gathering fragments…",
  "Weaving the threads…",
  "A dream takes shape…",
];

function WeavingPhase({ onComplete }) {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIdx((prev) => {
        if (prev >= WEAVING_PHRASES.length - 1) {
          clearInterval(phraseTimer);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(phraseTimer);
  }, [onComplete]);

  return (
    <motion.div
      key="weaving"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center"
    >
      {/* Animated sigil */}
      <div className="relative mb-10" style={{ width: 160, height: 160 }}>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "1px solid rgba(201, 169, 110, 0.1)", animation: "spin-slow 12s linear infinite" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ inset: 15, border: "1px solid rgba(124, 106, 239, 0.12)", animation: "spin-reverse 9s linear infinite" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ inset: 32, border: "1px solid rgba(201, 169, 110, 0.08)", animation: "spin-slower 18s linear infinite" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,106,239,0.08) 0%, transparent 70%)" }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Cycling poetic phrases */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phraseIdx}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.6 }}
          className="text-gold-light tracking-[0.2em] text-xs font-ui uppercase"
        >
          {WEAVING_PHRASES[phraseIdx]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

function StructuringPhase() {
  return (
    <motion.div
      key="structuring"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center"
    >
      <motion.div
        className="w-px h-24 mb-8"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--color-violet), var(--color-gold), transparent)",
        }}
        animate={{ scaleY: [0.8, 1.1, 0.8], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <p className="tracking-[0.3em] uppercase text-xs font-ui" style={{ color: "var(--color-violet)", opacity: 0.7 }}>
        A dream takes shape
      </p>
    </motion.div>
  );
}

export default function RecordScreen({ onSave, onNavigate }) {
  const [mode, setMode] = useState("voice"); // 'voice' | 'text'
  const [phase, setPhase] = useState("input"); // 'input' | 'weaving' | 'structuring' | 'preview'
  const [voiceState, setVoiceState] = useState("idle");
  const [typedText, setTypedText] = useState("");
  const [pendingDream, setPendingDream] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  // When voice enters "transcribing" phase, go to weaving
  useEffect(() => {
    if (voiceState === "transcribing") {
      setPhase("weaving");
    }
  }, [voiceState]);

  // Capture transcript from VoiceRecorder
  const handleTranscript = useCallback((text) => {
    setVoiceTranscript(text);
  }, []);

  // After weaving completes, build the dream and go to preview
  const handleWeavingComplete = useCallback(() => {
    // Use real transcript if available, otherwise fall back to mock
    const raw = mode === "voice"
      ? (voiceTranscript || MOCK_TRANSCRIPTION)
      : typedText;
    const newDream = {
      // No id — Supabase will generate a UUID on insert
      raw,
      title: mode === "voice" ? MOCK_TITLE : "Untitled Dream",
      mood: MOCK_MOOD,
      moodColor: MOCK_MOOD_COLOR,
      timestamp: new Date().toISOString(),
      duration: "Just now",
      structured: mode === "voice" ? MOCK_STRUCTURED : raw,
      tags: MOCK_TAGS,
      moodScore: 0.8,
      entryType: mode, // 'voice' or 'text'
      aiStatus: "pending",
    };
    setPendingDream(newDream);
    setPhase("preview");
  }, [mode, typedText, voiceTranscript]);

  const handleTextSubmit = useCallback(() => {
    if (!typedText.trim()) return;
    setPhase("weaving");
  }, [typedText]);

  const handleSave = useCallback(
    (dream) => {
      onSave(dream);
      setPhase("input");
      setVoiceState("idle");
      setTypedText("");
      setPendingDream(null);
    },
    [onSave]
  );

  const handleDiscard = useCallback(() => {
    setPhase("input");
    setVoiceState("idle");
    setTypedText("");
    setPendingDream(null);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      <Particles count={80} variant="stars" />

      <AnimatePresence mode="wait">
        {phase === "preview" && pendingDream ? (
          <DreamPreview
            key="preview"
            dream={pendingDream}
            onSave={handleSave}
            onDiscard={handleDiscard}
          />
        ) : phase === "weaving" ? (
          <WeavingPhase key="weaving" onComplete={handleWeavingComplete} />
        ) : phase === "structuring" ? (
          <StructuringPhase key="structuring" />
        ) : (
          /* === MAIN INPUT PHASE — The Dreaming Portal === */
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center w-full max-w-2xl"
          >
            {/* Hero — portal feel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center mb-10"
            >
              <h2 className="font-editorial text-3xl md:text-4xl font-light italic mb-4" style={{ color: "var(--color-parchment)" }}>
                What did you dream?
              </h2>
              <p className="font-ui text-xs tracking-[0.15em] uppercase" style={{ color: "var(--color-text-ghost)" }}>
                Speak your dream aloud, or write it down
              </p>
            </motion.div>

            {/* Decorative divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 0.3, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-16 h-px mb-10"
              style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
            />

            {/* Mode Toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center gap-1 p-1 rounded-full parchment-card mb-10"
            >
              <button
                onClick={() => setMode("voice")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-ui uppercase tracking-[0.15em] transition-all duration-300 ${
                  mode === "voice"
                    ? "bg-gold/10 text-gold"
                    : "text-text-ghost hover:text-text-secondary"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                Speak
              </button>
              <button
                onClick={() => setMode("text")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-ui uppercase tracking-[0.15em] transition-all duration-300 ${
                  mode === "text"
                    ? "bg-gold/10 text-gold"
                    : "text-text-ghost hover:text-text-secondary"
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                Write
              </button>
            </motion.div>

            {/* Input Area */}
            <AnimatePresence mode="wait">
              {mode === "voice" ? (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                <VoiceRecorder
                    state={voiceState}
                    onStateChange={setVoiceState}
                    onTranscript={handleTranscript}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <TextInput
                    value={typedText}
                    onChange={setTypedText}
                    disabled={false}
                  />
                  {typedText.trim().length > 10 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center mt-8"
                    >
                      <button
                        onClick={handleTextSubmit}
                        className="btn-gold px-8 py-3 rounded-full font-ui text-xs uppercase tracking-[0.2em] font-semibold"
                      >
                        Dream
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}