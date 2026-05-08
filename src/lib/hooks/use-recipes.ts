"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Recipe } from "@/types/database";

const supabase = createClient();

export function useRecipes() {
  const queryClient = useQueryClient();

  const {
    data: recipes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Recipe[];
    },
  });

  const addRecipe = useMutation({
    mutationFn: async (recipe: Partial<Recipe>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("recipes")
        .insert({ ...recipe, family_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Recipe;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({
      id,
      is_favorite,
    }: {
      id: string;
      is_favorite: boolean;
    }) => {
      const { error } = await supabase
        .from("recipes")
        .update({ is_favorite })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, is_favorite }) => {
      await queryClient.cancelQueries({ queryKey: ["recipes"] });
      const prev = queryClient.getQueryData<Recipe[]>(["recipes"]);
      queryClient.setQueryData<Recipe[]>(["recipes"], (old) =>
        old?.map((r) => (r.id === id ? { ...r, is_favorite } : r))
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(["recipes"], context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["recipes"] });
      const prev = queryClient.getQueryData<Recipe[]>(["recipes"]);
      queryClient.setQueryData<Recipe[]>(["recipes"], (old) =>
        old?.filter((r) => r.id !== id)
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(["recipes"], context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  return { recipes, isLoading, error, addRecipe, toggleFavorite, deleteRecipe };
}
