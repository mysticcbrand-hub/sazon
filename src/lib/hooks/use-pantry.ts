"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PantryItem } from "@/types/database";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const supabase = createClient();

export function usePantry() {
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pantry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pantry_items")
        .select("*")
        .order("category")
        .order("name");
      if (error) throw error;
      return data as PantryItem[];
    },
  });

  const addItem = useMutation({
    mutationFn: async (item: Partial<PantryItem>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("pantry_items")
        .insert({ ...item, family_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as PantryItem;
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ["pantry"] });
      const prev = queryClient.getQueryData<PantryItem[]>(["pantry"]);
      const optimistic = {
        id: `temp-${Date.now()}`,
        family_id: "",
        name: newItem.name || "",
        category: newItem.category || "other",
        quantity: newItem.quantity || 1,
        unit: newItem.unit || "unidades",
        expiry_date: newItem.expiry_date || null,
        barcode: null,
        added_by: null,
        added_at: new Date().toISOString(),
        low_threshold: 1,
        photo_url: null,
      } as PantryItem;
      queryClient.setQueryData<PantryItem[]>(["pantry"], (old) => [
        ...(old || []),
        optimistic,
      ]);
      return { prev };
    },
    onError: (_err, _item, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["pantry"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<PantryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("pantry_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as PantryItem;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pantry_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["pantry"] });
      const prev = queryClient.getQueryData<PantryItem[]>(["pantry"]);
      queryClient.setQueryData<PantryItem[]>(["pantry"], (old) =>
        old?.filter((i) => i.id !== id)
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["pantry"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("pantry-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pantry_items" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pantry"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { items, isLoading, error, addItem, updateItem, deleteItem };
}
