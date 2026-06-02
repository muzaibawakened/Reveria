/**
 * useDreams Hook
 * 
 * Central data hook for dream CRUD operations.
 * Replaces the old localStorage approach with Supabase as the source of truth.
 * 
 * Features:
 * - Fetch all dreams on mount
 * - Create new dreams
 * - Delete dreams
 * - Realtime subscription (dreams update when AI finishes processing)
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

/**
 * Convert a Supabase row to the frontend dream format.
 * Maps snake_case DB columns → camelCase frontend fields.
 */
function rowToDream(row) {
  return {
    id: row.id,
    raw: row.raw,
    structured: row.structured || row.raw,
    title: row.title || "Untitled Dream",
    mood: row.mood || "Reflective",
    moodColor: row.mood_color || "#7c6aef",
    moodScore: row.mood_score ?? 0.5,
    tags: row.tags || [],
    entryType: row.entry_type || "voice",
    duration: row.duration || null,
    aiStatus: row.ai_status || "pending",
    timestamp: row.created_at,
  };
}

/**
 * Convert frontend dream object → Supabase insert/update format.
 */
function dreamToRow(dream) {
  return {
    raw: dream.raw,
    structured: dream.structured || null,
    title: dream.title || "Untitled Dream",
    mood: dream.mood || "Reflective",
    mood_color: dream.moodColor || "#7c6aef",
    mood_score: dream.moodScore ?? 0.5,
    tags: dream.tags || [],
    entry_type: dream.entryType || "voice",
    duration: dream.duration || null,
    ai_status: dream.aiStatus || "pending",
  };
}

export default function useDreams() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  // ---- FETCH all dreams on mount ----
  useEffect(() => {
    let cancelled = false;

    async function fetchDreams() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("dreams")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        if (!cancelled) {
          setDreams(data.map(rowToDream));
        }
      } catch (err) {
        console.error("Failed to fetch dreams:", err);
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDreams();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- REALTIME subscription ----
  // Listen for changes to dreams (AI processing updates, new dreams, deletions)
  useEffect(() => {
    const channel = supabase
      .channel("dreams-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",          // INSERT, UPDATE, DELETE
          schema: "public",
          table: "dreams",
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          setDreams((prev) => {
            switch (eventType) {
              case "INSERT": {
                // Avoid duplicates (we already add optimistically in createDream)
                const exists = prev.some((d) => d.id === newRow.id);
                if (exists) {
                  return prev.map((d) =>
                    d.id === newRow.id ? rowToDream(newRow) : d
                  );
                }
                return [rowToDream(newRow), ...prev];
              }

              case "UPDATE": {
                return prev.map((d) =>
                  d.id === newRow.id ? rowToDream(newRow) : d
                );
              }

              case "DELETE": {
                return prev.filter((d) => d.id !== oldRow.id);
              }

              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ---- CREATE a new dream ----
  const createDream = useCallback(async (dreamData) => {
    try {
      setError(null);
      const row = dreamToRow(dreamData);

      const { data, error: insertError } = await supabase
        .from("dreams")
        .insert(row)
        .select()
        .single();

      if (insertError) throw insertError;

      const newDream = rowToDream(data);

      // Optimistically add to local state (realtime will also update, but this is faster)
      setDreams((prev) => {
        const exists = prev.some((d) => d.id === newDream.id);
        if (exists) return prev;
        return [newDream, ...prev];
      });

      return newDream;
    } catch (err) {
      console.error("Failed to create dream:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // ---- DELETE a dream ----
  const deleteDream = useCallback(async (id) => {
    try {
      setError(null);

      // Optimistically remove from local state
      setDreams((prev) => prev.filter((d) => d.id !== id));

      const { error: deleteError } = await supabase
        .from("dreams")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error("Failed to delete dream:", err);
      setError(err.message);
      // Re-fetch to restore correct state on error
      const { data } = await supabase
        .from("dreams")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setDreams(data.map(rowToDream));
      throw err;
    }
  }, []);

  return {
    dreams,
    loading,
    error,
    createDream,
    deleteDream,
  };
}