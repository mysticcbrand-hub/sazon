"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Family, FamilyMember } from "@/types/database";

const supabase = createClient();

export function useFamily() {
  const {
    data: family,
    isLoading: familyLoading,
    error: familyError,
  } = useQuery({
    queryKey: ["family"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("families")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data as Family;
    },
  });

  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ["family-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as FamilyMember[];
    },
  });

  return {
    family,
    members,
    isLoading: familyLoading || membersLoading,
    error: familyError || membersError,
  };
}
