/**
 * useAuth Hook
 *
 * Handles Supabase Anonymous Authentication.
 *
 * On first load, Supabase creates a silent anonymous session for the user.
 * This generates a unique `user_id` stored in their browser localStorage.
 * Returning visitors on the same device get the same session → same dreams.
 * A different person on a different device gets a different session → their own dreams.
 *
 * No signup, no email, no password. Completely invisible to the user.
 */
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function useAuth() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // 1. Check if a session already exists (returning visitor)
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession) {
        setSession(existingSession);
        setAuthLoading(false);
      } else {
        // 2. No session → sign in anonymously (first-time visitor)
        supabase.auth
          .signInAnonymously()
          .then(({ data, error }) => {
            if (error) {
              console.error("Anonymous sign-in failed:", error.message);
            } else {
              setSession(data.session);
            }
          })
          .finally(() => setAuthLoading(false));
      }
    });

    // 3. Listen for any future auth changes (e.g. token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, authLoading, userId: session?.user?.id ?? null };
}
