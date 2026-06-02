import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square } from "lucide-react";
import {
  getSpeechRecognition,
  isSpeechRecognitionSupported,
} from "../lib/speechRecognition";

export default function VoiceRecorder({ state, onStateChange, onTranscript }) {
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  // Timer
  useEffect(() => {
    let interval;
    if (state === "recording") {
      setElapsed(0);
      interval = setInterval(() => setElapsed((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  // Start speech recognition when recording begins
  useEffect(() => {
    if (state !== "recording") return;

    if (!isSpeechRecognitionSupported()) {
      console.warn("Speech recognition not supported — falling back to mock");
      return;
    }

    const recognition = getSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    finalTranscriptRef.current = "";

    recognition.onresult = (event) => {
      let finalText = "";
      let interimTextResult = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimTextResult += result[0].transcript;
        }
      }

      if (finalText) {
        finalTranscriptRef.current += finalText;
        setTranscript(finalTranscriptRef.current.trim());
      }
      setInterimText(interimTextResult);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      // Don't stop on 'no-speech' — just keep listening
      if (event.error === "no-speech" || event.error === "aborted") return;
    };

    recognition.onend = () => {
      // Auto-restart if still recording (browser sometimes stops early)
      if (recognitionRef.current && state === "recording") {
        try {
          recognition.start();
        } catch (e) {
          // Already started, ignore
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore
      }
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [state]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (state === "idle") {
      onStateChange("recording");
    } else if (state === "recording") {
      // Stop recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      // Pass transcript up to parent
      const finalText = (finalTranscriptRef.current || transcript || "").trim();
      if (onTranscript && finalText) {
        onTranscript(finalText);
      }
      onStateChange("transcribing");
    }
  };

  const isRecording = state === "recording";
  const displayText = interimText
    ? `${transcript} ${interimText}`.trim()
    : transcript;

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-10 flex items-center justify-center" style={{ width: 200, height: 200 }}>
        {/* Concentric ring 1 — outermost, slow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: "1px solid rgba(201, 169, 110, 0.1)",
            animation: "spin-slow 20s linear infinite",
          }}
        >
          {/* Small dot on the ring */}
          <div
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: isRecording
                ? "rgba(124, 106, 239, 0.7)"
                : "rgba(201, 169, 110, 0.4)",
              top: -3,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: isRecording
                ? "0 0 8px rgba(124, 106, 239, 0.5)"
                : "0 0 4px rgba(201, 169, 110, 0.2)",
            }}
          />
        </motion.div>

        {/* Concentric ring 2 — middle, reverse */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: 20,
            border: isRecording
              ? "1px solid rgba(124, 106, 239, 0.2)"
              : "1px solid rgba(201, 169, 110, 0.08)",
            animation: "spin-reverse 15s linear infinite",
            transition: "border-color 0.6s ease",
          }}
        >
          <div
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: isRecording
                ? "rgba(124, 106, 239, 0.6)"
                : "rgba(201, 169, 110, 0.3)",
              bottom: -2,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: isRecording
                ? "0 0 6px rgba(124, 106, 239, 0.4)"
                : "none",
            }}
          />
        </motion.div>

        {/* Concentric ring 3 — innermost, slowest */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: 38,
            border: isRecording
              ? "1px solid rgba(124, 106, 239, 0.15)"
              : "1px solid rgba(201, 169, 110, 0.06)",
            animation: "spin-slower 25s linear infinite",
            transition: "border-color 0.6s ease",
          }}
        />

        {/* Pulse aura when recording */}
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div
                className="absolute inset-4 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(124,106,239,0.1) 0%, transparent 70%)",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main button — centered via z-index over flex parent */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          className="relative z-10 rounded-full flex items-center justify-center transition-all duration-700 shrink-0"
          style={{
            width: 96,
            height: 96,
            background: isRecording
              ? "linear-gradient(135deg, rgba(124, 106, 239, 0.25), rgba(201, 169, 110, 0.15))"
              : "linear-gradient(135deg, rgba(20, 20, 50, 0.7), rgba(15, 15, 35, 0.5))",
            border: isRecording
              ? "1px solid rgba(124, 106, 239, 0.3)"
              : "1px solid rgba(201, 169, 110, 0.1)",
            backdropFilter: "blur(16px)",
            boxShadow: isRecording
              ? "0 0 40px rgba(124, 106, 239, 0.2), inset 0 0 30px rgba(124, 106, 239, 0.05)"
              : "0 0 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          <AnimatePresence mode="wait">
            {state === "idle" ? (
              <motion.div key="mic" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                <Mic className="w-8 h-8 text-gold" strokeWidth={1.2} />
              </motion.div>
            ) : (
              <motion.div key="stop" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                <Square className="w-6 h-6" fill="rgba(124, 106, 239, 0.7)" strokeWidth={0} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status text */}
      <div className="h-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={state}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="tracking-[0.25em] uppercase text-xs font-ui"
            style={{
              color: isRecording
                ? "rgba(124, 106, 239, 0.7)"
                : "var(--color-text-secondary)",
            }}
          >
            {state === "idle"
              ? "Touch to begin"
              : `Recording · ${formatTime(elapsed)}`}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Live transcript preview */}
      {isRecording && displayText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 max-w-lg text-center"
        >
          <p className="text-sm leading-relaxed font-editorial italic text-parchment-mid">
            {displayText}
            <motion.span
              className="inline-block w-0.5 h-4 bg-violet ml-1 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </p>
        </motion.div>
      )}

      {/* Speech recognition not supported warning */}
      {isRecording && !isSpeechRecognitionSupported() && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs font-ui text-text-ghost tracking-wider"
        >
          Speech recognition not available in this browser
        </motion.p>
      )}
    </div>
  );
}