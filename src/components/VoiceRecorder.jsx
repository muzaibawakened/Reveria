import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square } from "lucide-react";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// ─── Component ───────────────────────────────────────────────────────
export default function VoiceRecorder({ state, onStateChange, onTranscript, onDurationChange, onError }) {
  const [elapsed, setElapsed] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) setSpeechSupported(false);
  }, []);

  // Timer
  useEffect(() => {
    let interval;
    if (state === "recording") {
      setElapsed(0);
      interval = setInterval(() => {
        setElapsed((t) => { const next = t + 1; onDurationChange?.(next); return next; });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state, onDurationChange]);

  // Start MediaRecorder when recording begins
  useEffect(() => {
    if (state !== "recording") return;
    let cancelled = false;
    isStoppingRef.current = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        chunksRef.current = [];

        // Pick the best MIME type Groq supports — prefer webm/opus (best quality/size)
        const mimeType = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/mp4",
        ].find((m) => MediaRecorder.isTypeSupported(m)) || "";

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
        recorder.start(250); // smaller chunks — collect every 250ms for better completeness
        console.log("[VoiceRecorder] Started. mimeType:", recorder.mimeType);
      } catch (err) {
        console.error("[VoiceRecorder] Failed to start:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") setSpeechSupported(false);
        onStateChange("idle");
      }
    })();

    return () => { cancelled = true; };
  }, [state, onStateChange]);

  // Send audio blob directly to Groq — no conversion needed, it supports webm/ogg/mp4
  async function transcribeAudio(audioBlob, mimeType) {
    // Determine file extension from MIME type
    const ext = mimeType.includes("ogg") ? "ogg"
      : mimeType.includes("mp4") ? "mp4"
      : "webm";

    const formData = new FormData();
    formData.append("file", audioBlob, `recording-${Date.now()}.${ext}`);
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("language", "en");
    formData.append("response_format", "json");
    formData.append("temperature", "0");
    formData.append(
      "prompt",
      "Dream journal entry. Personal narration describing a dream. Transcribe every word exactly as spoken."
    );

    console.log("[VoiceRecorder] Sending to Groq:", { size: audioBlob.size, type: audioBlob.type, ext });

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: formData,
    });

    if (!response.ok) {
      const t = await response.text();
      throw new Error(`Groq API error (${response.status}): ${t}`);
    }
    const result = await response.json();
    if (!result?.text) throw new Error("No transcript returned from Groq API");
    return result.text;
  }

  const handleClick = async () => {
    if (state === "idle") {
      onStateChange("recording");
    } else if (state === "recording") {
      if (isStoppingRef.current) return;
      isStoppingRef.current = true;

      try {
        const recorder = mediaRecorderRef.current;
        const mimeType = recorder?.mimeType || "audio/webm";

        // Stop MediaRecorder — wait for onstop so final ondataavailable fires first
        if (recorder && recorder.state === "recording") {
          await new Promise((resolve) => { recorder.onstop = resolve; recorder.stop(); });
        }

        // Release the mic
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const chunks = chunksRef.current;
        chunksRef.current = [];

        console.log("[VoiceRecorder] Chunks collected:", chunks.length, "total bytes:", chunks.reduce((s, c) => s + c.size, 0));

        if (chunks.length === 0) {
          onError?.("No audio was captured. Make sure your mic is working.");
          onTranscript?.("");
          onStateChange("idle");
          return;
        }

        const audioBlob = new Blob(chunks, { type: mimeType });
        console.log("[VoiceRecorder] Audio blob ready:", { size: audioBlob.size, type: audioBlob.type });

        if (audioBlob.size < 500) {
          onError?.("Recording was too short or captured no audio.");
          onTranscript?.("");
          onStateChange("idle");
          return;
        }

        // Send directly to Groq — no conversion
        onStateChange("transcribing");
        try {
          const transcript = await transcribeAudio(audioBlob, mimeType);
          console.log("[VoiceRecorder] Transcript:", transcript);
          onTranscript?.(transcript);
        } catch (err) {
          console.error("[VoiceRecorder] Transcription failed:", err);
          onError?.(`Transcription failed: ${err.message}`);
          onTranscript?.("");
        }
        onStateChange("idle");
      } catch (err) {
        console.error("[VoiceRecorder] Stop error:", err);
        onError?.(`Recording error: ${err.message}`);
        onStateChange("idle");
      }
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const isRecording = state === "recording";

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-10 flex items-center justify-center" style={{ width: 200, height: 200 }}>
        {/* Concentric ring 1 — outermost, slow */}
        <motion.div className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(201, 169, 110, 0.1)", animation: "spin-slow 20s linear infinite" }}>
          <div className="absolute w-1.5 h-1.5 rounded-full" style={{ background: isRecording ? "rgba(124, 106, 239, 0.7)" : "rgba(201, 169, 110, 0.4)", top: -3, left: "50%", transform: "translateX(-50%)", boxShadow: isRecording ? "0 0 8px rgba(124, 106, 239, 0.5)" : "0 0 4px rgba(201, 169, 110, 0.2)" }} />
        </motion.div>

        {/* Concentric ring 2 — middle, reverse */}
        <motion.div className="absolute rounded-full" style={{ inset: 20, border: isRecording ? "1px solid rgba(124, 106, 239, 0.2)" : "1px solid rgba(201, 169, 110, 0.08)", animation: "spin-reverse 15s linear infinite", transition: "border-color 0.6s ease" }}>
          <div className="absolute w-1 h-1 rounded-full" style={{ background: isRecording ? "rgba(124, 106, 239, 0.6)" : "rgba(201, 169, 110, 0.3)", bottom: -2, left: "50%", transform: "translateX(-50%)", boxShadow: isRecording ? "0 0 6px rgba(124, 106, 239, 0.4)" : "none" }} />
        </motion.div>

        {/* Concentric ring 3 — innermost, slowest */}
        <motion.div className="absolute rounded-full" style={{ inset: 38, border: isRecording ? "1px solid rgba(124, 106, 239, 0.15)" : "1px solid rgba(201, 169, 110, 0.06)", animation: "spin-slower 25s linear infinite", transition: "border-color 0.6s ease" }} />

        {/* Pulse aura when recording */}
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div className="absolute inset-4 rounded-full" style={{ background: "radial-gradient(circle, rgba(124,106,239,0.1) 0%, transparent 70%)" }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }} exit={{ opacity: 0 }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
              <motion.div className="absolute inset-4 rounded-full" style={{ background: "radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)" }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }} exit={{ opacity: 0 }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} />
            </>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleClick} className="relative z-10 rounded-full flex items-center justify-center transition-all duration-700 shrink-0" style={{ width: 96, height: 96, background: isRecording ? "linear-gradient(135deg, rgba(124, 106, 239, 0.25), rgba(201, 169, 110, 0.15))" : "linear-gradient(135deg, rgba(20, 20, 50, 0.7), rgba(15, 15, 35, 0.5))", border: isRecording ? "1px solid rgba(124, 106, 239, 0.3)" : "1px solid rgba(201, 169, 110, 0.1)", backdropFilter: "blur(16px)", boxShadow: isRecording ? "0 0 40px rgba(124, 106, 239, 0.2), inset 0 0 30px rgba(124, 106, 239, 0.05)" : "0 0 30px rgba(0, 0, 0, 0.3)" }}>
          <AnimatePresence mode="wait">
            {state === "idle" ? (
              <motion.div key="mic" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                <Mic className="w-8 h-8 text-gold" strokeWidth={1.2} />
              </motion.div>
            ) : state === "transcribing" ? (
              <motion.div key="processing" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, rotate: 360 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.6, rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}>
                <div className="w-6 h-6 rounded-full border-2 border-violet border-t-transparent" />
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
          <motion.p key={state} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }} className="tracking-[0.25em] uppercase text-xs font-ui" style={{ color: isRecording ? "rgba(124, 106, 239, 0.7)" : "var(--color-text-secondary)" }}>
            {state === "idle" ? "Touch to begin" : state === "transcribing" ? "Transcribing your dream…" : `Recording · ${formatTime(elapsed)}`}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Audio level indicator */}
      {isRecording && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6 flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div key={i} className="w-0.5 rounded-full" style={{ background: "rgba(124, 106, 239, 0.5)" }} animate={{ height: [4, 12 + Math.random() * 8, 4] }} transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.1 }} />
          ))}
        </motion.div>
      )}

      {!speechSupported && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-xs font-ui text-text-ghost tracking-wider text-center max-w-xs">
          Microphone access denied or not available — try allowing mic permissions in your browser settings
        </motion.p>
      )}
    </div>
  );
}