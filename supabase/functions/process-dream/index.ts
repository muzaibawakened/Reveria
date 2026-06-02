// @ts-nocheck
// ============================================
// Supabase Edge Function: process-dream
// ============================================
// Triggered by a database webhook when a new dream is inserted
// with ai_status = 'pending'. Uses MIMO (OpenAI-compatible API)
// to generate structured dream content, title, mood, and tags.
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MIMO_API_KEY = Deno.env.get("MIMO_API_KEY");
const MIMO_BASE_URL = Deno.env.get("MIMO_BASE_URL") || "https://api.mimo.com/v1";
const MIMO_MODEL = Deno.env.get("MIMO_MODEL") || "mimo-default";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse the incoming webhook payload
    const payload = await req.json();
    const dream = payload.record;

    if (!dream || !dream.id) {
      return new Response(
        JSON.stringify({ error: "No dream record in payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Skip if already processed
    if (dream.ai_status === "done") {
      return new Response(
        JSON.stringify({ message: "Already processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for DB updates
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mark as processing
    await supabase
      .from("dreams")
      .update({ ai_status: "processing" })
      .eq("id", dream.id);

    // Build the prompt for MIMO
    const systemPrompt = `You are a poetic dream interpreter. Given a raw dream transcription, respond with a JSON object containing:
- "title": A short, evocative title (2-5 words, no quotes)
- "structured": A refined, literary retelling of the dream (1-2 sentences, written in first person past tense, poetic and evocative)
- "mood": A single word mood descriptor (e.g., "Surreal", "Haunting", "Lucid", "Ethereal", "Wonder", "Peaceful", "Anxious", "Mysterious")
- "mood_color": A hex color code that captures the mood
- "mood_score": A float from 0.0 to 1.0 representing emotional intensity
- "tags": An array of 2-4 lowercase thematic tags

Respond ONLY with valid JSON. No markdown, no explanation.`;

    const userPrompt = `Here is the raw dream transcription:\n\n"${dream.raw}"`;

    // Call MIMO API (OpenAI-compatible)
    const mimoResponse = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MIMO_API_KEY}`,
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!mimoResponse.ok) {
      const errorText = await mimoResponse.text();
      throw new Error(`MIMO API error (${mimoResponse.status}): ${errorText}`);
    }

    const mimoData = await mimoResponse.json();
    const aiContent = mimoData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content in MIMO response");
    }

    // Parse the AI response
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = aiContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      throw new Error(`Failed to parse AI response as JSON: ${aiContent}`);
    }

    // Update the dream with AI-generated content
    const { error: updateError } = await supabase
      .from("dreams")
      .update({
        title: parsed.title || "Untitled Dream",
        structured: parsed.structured || dream.raw,
        mood: parsed.mood || "Reflective",
        mood_color: parsed.mood_color || "#7c6aef",
        mood_score: parsed.mood_score ?? 0.5,
        tags: parsed.tags || [],
        ai_status: "done",
        ai_error: null,
      })
      .eq("id", dream.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, dream_id: dream.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing dream:", error.message);

    // Try to mark the dream as errored
    try {
      const payload = await req.clone().json();
      const dreamId = payload?.record?.id;
      if (dreamId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from("dreams")
          .update({
            ai_status: "error",
            ai_error: error.message,
          })
          .eq("id", dreamId);
      }
    } catch (e) {
      // Silently fail if we can't update the error status
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});