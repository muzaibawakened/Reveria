// @ts-nocheck
// ============================================
// Supabase Edge Function: transcribe-audio
// ============================================
// Accepts an audio file (WebM/Opus from MediaRecorder),
// sends it to Groq's Whisper API for transcription,
// and returns the transcript text.
// ============================================

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured in Supabase secrets");
    }

    // Get the audio file from the request
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No audio file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log file info for debugging
    console.log(
      `Received audio: ${audioFile.name}, type: ${audioFile.type}, size: ${audioFile.size} bytes`
    );

    if (audioFile.size === 0) {
      return new Response(
        JSON.stringify({ error: "Audio file is empty (0 bytes)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build FormData for Groq API
    const groqFormData = new FormData();
    groqFormData.append("file", audioFile, audioFile.name || "recording.webm");
    groqFormData.append("model", "whisper-large-v3-turbo");
    groqFormData.append("language", "en");
    groqFormData.append("response_format", "json");
    groqFormData.append("temperature", "0");

    // Send to Groq Whisper API
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: groqFormData,
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error(`Groq API error (${groqResponse.status}):`, errorText);
      throw new Error(
        `Groq transcription failed (${groqResponse.status}): ${errorText}`
      );
    }

    const groqResult = await groqResponse.json();
    const transcript = groqResult.text || "";
    console.log("Transcription result:", transcript);

    return new Response(
      JSON.stringify({ transcript: transcript.trim() }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Transcription error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});