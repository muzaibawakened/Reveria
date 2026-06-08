/**
 * useGroqStructuring Hook
 *
 * Calls Groq's LLM API directly from the browser to structure a raw dream
 * transcription into a poetic title, mood, tags, and structured text.
 * Replaces the broken edge function approach (MIMO was never configured).
 */
import { useState, useCallback } from "react";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are a poetic dream interpreter. Given a raw dream transcription, respond with a JSON object containing:
- "title": A short, evocative title (2-5 words, no quotes)
- "structured": A refined, literary retelling of the dream (1-2 sentences, written in first person past tense, poetic and evocative)
- "mood": A single word mood descriptor (e.g., "Surreal", "Haunting", "Lucid", "Ethereal", "Wonder", "Peaceful", "Anxious", "Mysterious")
- "mood_color": A hex color code that captures the mood
- "mood_score": A float from 0.0 to 1.0 representing emotional intensity
- "tags": An array of 2-4 lowercase thematic tags

Respond ONLY with valid JSON. No markdown, no explanation.`;

export default function useGroqStructuring() {
  const [structuring, setStructuring] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const structureDream = useCallback(async (rawText) => {
    setStructuring(true);
    setError(null);
    setResult(null);

    try {
      console.log("[useGroqStructuring] Starting structuring for:", rawText.substring(0, 100) + "...");

      if (!GROQ_API_KEY) {
        throw new Error("VITE_GROQ_API_KEY is not set in environment");
      }

      // Add a 20-second timeout so we don't hang forever
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("[useGroqStructuring] Aborting after 20s timeout");
        controller.abort();
      }, 20000);

      console.log("[useGroqStructuring] Sending request to Groq...", {
        model: "llama-3.1-8b-instant",
        textLength: rawText.length,
        hasKey: !!GROQ_API_KEY,
      });

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: `Here is the raw dream transcription:\n\n"${rawText}"` },
            ],
            temperature: 0.8,
            max_tokens: 500,
            response_format: { type: "json_object" },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log("[useGroqStructuring] Got response:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content;

      if (!aiContent) {
        throw new Error("No content in Groq response");
      }

      // Parse JSON (strip code fences if present)
      const cleaned = aiContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(cleaned);

      const dreamResult = {
        title: parsed.title || "Untitled Dream",
        structured: parsed.structured || rawText,
        mood: parsed.mood || "Reflective",
        moodColor: parsed.mood_color || "#7c6aef",
        moodScore: parsed.mood_score ?? 0.5,
        tags: parsed.tags || [],
        aiStatus: "done",
      };

      setResult(dreamResult);
      setStructuring(false);
      return dreamResult;
    } catch (err) {
      console.error("Dream structuring failed:", err);
      setError(err.message);
      setStructuring(false);
      // Return fallback so the dream still saves
      const fallback = {
        title: "A Dream Remembered",
        structured: rawText,
        mood: "Reflective",
        moodColor: "#7c6aef",
        moodScore: 0.5,
        tags: ["dream", "memory"],
        aiStatus: "error",
      };
      setResult(fallback);
      return fallback;
    }
  }, []);

  return { structureDream, structuring, result, error };
}