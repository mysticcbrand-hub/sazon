"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useCallback } from "react";
import type { AIAction } from "@/types/database";

const supabase = createClient();

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAI = useCallback(
    async (action: AIAction, payload: Record<string, unknown> = {}) => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-proxy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ action, payload }),
          }
        );

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(errBody || "AI request failed");
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error inesperado";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const streamAI = useCallback(
    async (
      action: AIAction,
      payload: Record<string, unknown>,
      onChunk: (text: string) => void
    ) => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-proxy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ action, payload, stream: true }),
          }
        );

        if (!response.ok) {
          throw new Error("AI stream failed");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No stream reader");

        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          onChunk(fullText);
        }

        return fullText;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error inesperado";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { callAI, streamAI, loading, error };
}
