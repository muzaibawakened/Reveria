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

export default function useDreams(userId) {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  // ---- FETCH all dreams on mount (scoped to this user) ----
  useEffect(() => {
    if (!userId) return; // wait until auth is ready
    let cancelled = false;

    async function fetchDreams() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("dreams")
          .select("*")
          .eq("user_id", userId)
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
  }, [userId]);

  // ---- REALTIME subscription (scoped to this user) ----
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`dreams-realtime-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dreams",
          filter: `user_id=eq.${userId}`,
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
  }, [userId]);

  // ---- CREATE a new dream (attached to this user) ----
  const createDream = useCallback(async (dreamData) => {
    if (!userId) throw new Error("Not authenticated");
    try {
      setError(null);
      const row = { ...dreamToRow(dreamData), user_id: userId };

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
  }, [userId]);

  // ---- DELETE a dream ----
  const deleteDream = useCallback(async (id) => {
    if (!userId) return;
    try {
      setError(null);

      // Optimistically remove from local state
      setDreams((prev) => prev.filter((d) => d.id !== id));

      const { error: deleteError } = await supabase
        .from("dreams")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error("Failed to delete dream:", err);
      setError(err.message);
      // Re-fetch to restore correct state on error
      const { data } = await supabase
        .from("dreams")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data) setDreams(data.map(rowToDream));
      throw err;
    }
  }, [userId]);

  // ---- UPDATE a dream ----
  const updateDream = useCallback(async (id, updates) => {
    if (!userId) return;
    try {
      setError(null);
      
      // Convert frontend fields back to snake_case if necessary
      const rowUpdates = { ...updates };
      if (updates.moodColor) rowUpdates.mood_color = updates.moodColor;
      if (updates.moodScore !== undefined) rowUpdates.mood_score = updates.moodScore;
      if (updates.entryType) rowUpdates.entry_type = updates.entryType;
      if (updates.aiStatus) rowUpdates.ai_status = updates.aiStatus;
      
      delete rowUpdates.moodColor;
      delete rowUpdates.moodScore;
      delete rowUpdates.entryType;
      delete rowUpdates.aiStatus;
      delete rowUpdates.timestamp; // created_at shouldn't be manually updated

      const { data, error: updateError } = await supabase
        .from("dreams")
        .update(rowUpdates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedDream = rowToDream(data);

      // Optimistically update local state
      setDreams((prev) => prev.map((d) => (d.id === id ? updatedDream : d)));

      return updatedDream;
    } catch (err) {
      console.error("Failed to update dream:", err);
      setError(err.message);
      throw err;
    }
  }, [userId]);

  // ---- BACKUP — download dreams as a JSON file ----
  const backupDreams = useCallback(() => {
    if (!dreams.length) return;
    const blob = new Blob([JSON.stringify(dreams, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reveria-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dreams]);

  // ---- RESTORE — import dreams from a JSON backup file ----
  const restoreDreams = useCallback(async (file) => {
    if (!userId) throw new Error("Not authenticated");
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error("Invalid backup file format.");

      // Deduplicate: skip dreams that match existing raw+timestamp
      const existingKeys = new Set(dreams.map((d) => `${d.raw}|${d.timestamp}`));

      const toInsert = imported
        .filter((d) => d.raw && !existingKeys.has(`${d.raw}|${d.timestamp}`))
        .map((d) => ({ ...dreamToRow(d), user_id: userId }));

      if (!toInsert.length) return 0;

      const { data, error: insertError } = await supabase
        .from("dreams")
        .insert(toInsert)
        .select();

      if (insertError) throw insertError;

      const newDreams = data.map(rowToDream);
      setDreams((prev) => {
        const merged = [...newDreams, ...prev];
        merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return merged;
      });

      return newDreams.length;
    } catch (err) {
      console.error("Failed to restore dreams:", err);
      throw err;
    }
  }, [userId, dreams]);

  return {
    dreams,
    loading,
    error,
    createDream,
    deleteDream,
    updateDream,
    backupDreams,
    restoreDreams,
  };
}
