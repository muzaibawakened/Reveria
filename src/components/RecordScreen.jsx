import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, PenLine } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import TextInput from "./TextInput";
import DreamPreview from "./DreamPreview";
import Particles from "./Particles";
import useGroqStructuring from "../hooks/useGroqStructuring";

const VALIDATION_ERRORS = {
  TOO_SHORT: "Recording is too short — please speak for at least 3 seconds.",
  NO_SPEECH: "No words were detected — try speaking louder or closer to your mic.",
  NOT_SUPPORTED: "Voice recording is not supported in this browser — try Chrome or Edge.",
};

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const WEAVING_PHRASES = [
  "Listening to the echoes…",
  "Gathering fragments…",
  "Weaving the threads…",
  "Untangling the narrative…",
  "Distilling the essence…",
  "A dream takes shape…",
];

function WeavingPhase({ onComplete, aiActive }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const aiActiveRef = useRef(aiActive);

  // Keep refs up to date without causing re-renders/re-runs
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { aiActiveRef.current = aiActive; }, [aiActive]);

  // Phrase cycling animation
  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIdx((prev) => {
        const next = prev + 1;
        return next >= WEAVING_PHRASES.length ? WEAVING_PHRASES.length - 1 : next;
      });
    }, 1800);
    return () => clearInterval(phraseTimer);
  }, []);

  // MINIMUM ANIMATION: After 8 seconds, start checking if AI is done
  useEffect(() => {
    const minTimer = setTimeout(() => {
      const tryComplete = () => {
        if (completedRef.current) return;

        if (!aiActiveRef.current) {
          // AI is done (or never started) — proceed
          completedRef.current = true;
          setTimeout(() => onCompleteRef.current?.(), 600);
        } else {
          // AI still running — poll every 500ms
          const poll = setInterval(() => {
            if (completedRef.current) { clearInterval(poll); return; }
            if (!aiActiveRef.current) {
              clearInterval(poll);
              completedRef.current = true;
              setTimeout(() => onCompleteRef.current?.(), 600);
            }
          }, 500);

          // Hard stop: never wait more than 20 additional seconds
          setTimeout(() => {
            if (!completedRef.current) {
              clearInterval(poll);
              completedRef.current = true;
              onCompleteRef.current?.();
            }
          }, 20000);
        }
      };
      tryComplete();
    }, 8000);

    // ABSOLUTE SAFETY: Force-complete at 25 seconds no matter what
    const forceTimer = setTimeout(() => {
      if (!completedRef.current) {
        console.warn("[WeavingPhase] Force-completing at 25s");
        completedRef.current = true;
        onCompleteRef.current?.();
      }
    }, 25000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(forceTimer);
    };
  }, []); // Empty deps — runs exactly once on mount

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

export default function RecordScreen({ onSave, onNavigate }) {
  const [mode, setMode] = useState("voice"); // 'voice' | 'text'
  const [phase, setPhase] = useState("input"); // 'input' | 'weaving' | 'preview'
  const [voiceState, setVoiceState] = useState("idle");
  const [typedText, setTypedText] = useState("");
  const [pendingDream, setPendingDream] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceError, setVoiceError] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [aiResult, setAiResult] = useState(null);

  const { structureDream, structuring } = useGroqStructuring();
  const aiStartedRef = useRef(false);

  // Start AI structuring when weaving phase begins
  useEffect(() => {
    if (phase !== "weaving" || aiStartedRef.current) return;

    const raw = mode === "voice" ? voiceTranscript.trim() : typedText.trim();
    if (!raw) return;

    aiStartedRef.current = true;

    // Run AI structuring in parallel with weaving animation
    structureDream(raw).then((result) => {
      setAiResult(result);
    });
  }, [phase, mode, voiceTranscript, typedText, structureDream]);

  // Capture transcript from VoiceRecorder
  const handleTranscript = useCallback((text) => {
    // Validation: too short (less than 3 seconds)
    if (voiceDuration < 3) {
      setVoiceError(VALIDATION_ERRORS.TOO_SHORT);
      setVoiceTranscript("");
      return;
    }

    // Validation: no speech detected
    const finalText = (text || "").trim();
    if (!finalText) {
      setVoiceError(VALIDATION_ERRORS.NO_SPEECH);
      return;
    }

    // All good — clear any previous error and proceed
    setVoiceError(null);
    setVoiceTranscript(finalText);
    aiStartedRef.current = false;
    setAiResult(null);
    setPhase("weaving");
  }, [voiceDuration]);

  // Surface transcription errors from VoiceRecorder
  const handleVoiceError = useCallback((errorMsg) => {
    setVoiceError(errorMsg);
  }, []);

  // Capture duration from VoiceRecorder
  const handleDurationChange = useCallback((duration) => {
    setVoiceDuration(duration);
  }, []);

  // After weaving animation completes AND AI is done, build the dream and go to preview
  const handleWeavingAnimationDone = useCallback(() => {
    // Don't block on structuring — we have fallback values ready
    // The wasAiActiveRef + force-complete timeout handle timing properly
    const raw = mode === "voice" ? voiceTranscript.trim() : typedText.trim();

    const newDream = {
      raw,
      title: aiResult?.title || "A Dream Remembered",
      mood: aiResult?.mood || "Reflective",
      moodColor: aiResult?.moodColor || "#7c6aef",
      timestamp: new Date().toISOString(),
      duration: mode === "voice" ? formatDuration(voiceDuration) : "Just now",
      structured: aiResult?.structured || raw,
      tags: aiResult?.tags || [],
      moodScore: aiResult?.moodScore ?? 0.5,
      entryType: mode,
      aiStatus: aiResult?.aiStatus || "done",
    };
    setPendingDream(newDream);
    setPhase("preview");
  }, [mode, typedText, voiceTranscript, voiceDuration, structuring, aiResult]);

  const handleTextSubmit = useCallback(() => {
    if (!typedText.trim()) return;
    aiStartedRef.current = false;
    setAiResult(null);
    setPhase("weaving");
  }, [typedText]);

  const handleSave = useCallback(
    (dream) => {
      onSave(dream);
      setPhase("input");
      setVoiceState("idle");
      setTypedText("");
      setPendingDream(null);
      setVoiceError(null);
      setAiResult(null);
      aiStartedRef.current = false;
    },
    [onSave]
  );

  const handleDiscard = useCallback(() => {
    setPhase("input");
    setVoiceState("idle");
    setTypedText("");
    setPendingDream(null);
    setVoiceError(null);
    setAiResult(null);
    aiStartedRef.current = false;
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      <Particles count={250} variant="stars" />

      <AnimatePresence mode="wait">
        {phase === "preview" && pendingDream ? (
          <DreamPreview
            key="preview"
            dream={pendingDream}
            onSave={handleSave}
            onDiscard={handleDiscard}
            onUpdate={(updates) => setPendingDream((prev) => ({ ...prev, ...updates }))}
          />
        ) : phase === "weaving" ? (
          <WeavingPhase
            key="weaving"
            onComplete={handleWeavingAnimationDone}
            aiActive={structuring}
          />
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

            {/* Error message */}
            <AnimatePresence>
              {voiceError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="mb-6 px-6 py-3 rounded-xl text-center max-w-md"
                  style={{
                    background: "rgba(220, 80, 80, 0.1)",
                    border: "1px solid rgba(220, 80, 80, 0.2)",
                  }}
                >
                  <p className="text-xs font-ui tracking-wide" style={{ color: "rgba(255, 150, 150, 0.9)" }}>
                    {voiceError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

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
                onClick={() => { setMode("voice"); setVoiceError(null); }}
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
                onClick={() => { setMode("text"); setVoiceError(null); }}
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
                    onDurationChange={handleDurationChange}
                    onError={handleVoiceError}
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