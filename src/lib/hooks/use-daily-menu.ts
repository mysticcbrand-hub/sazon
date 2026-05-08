"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { DailyMenu } from "@/types/database";

const supabase = createClient();

export function useDailyMenu() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const {
    data: menu,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["daily-menu", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_menu")
        .select("*")
        .eq("date", today)
        .maybeSingle();
      if (error) throw error;
      return data as DailyMenu | null;
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("daily-menu-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_menu" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["daily-menu"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { menu, isLoading, error };
}
