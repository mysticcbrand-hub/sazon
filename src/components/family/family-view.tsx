"use client";

import { motion } from "framer-motion";
import { User, Plus, Fish, Dumbbell, Leaf, XCircle, Wheat, LogOut, Moon, Sun } from "lucide-react";
import { useFamily } from "@/lib/hooks/use-family";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useUIStore } from "@/lib/stores/ui-store";
import type { FamilyMember } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const supabase = createClient();

const GOALS = [
  { id: "fish", label: "Más pescado", desc: "2-3 recetas de pescado por semana", emoji: "🐟" },
  { id: "protein", label: "Alta proteína", desc: "Priorizar recetas con +25g por ración", emoji: "💪" },
  { id: "vegetables", label: "Más vegetales", desc: "Al menos 2 raciones de verdura por comida", emoji: "🥦" },
  { id: "less-processed", label: "Menos procesados", desc: "Reducir ultraprocesados", emoji: "🚫" },
  { id: "low-carb", label: "Menos carbohidratos", desc: "Alternativas bajas en carbs", emoji: "🌾" },
];

function MemberCard({ member }: { member: FamilyMember }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-text-muted)]/8">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center shrink-0">
        {member.avatar_url ? (
          <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-[var(--color-primary)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{member.name}</p>
        <p className="text-xs text-[var(--color-text-muted)] capitalize">{member.role}</p>
      </div>
      {member.preferences.allergies.length > 0 && (
        <div className="flex gap-1">
          {member.preferences.allergies.slice(0, 2).map((a) => (
            <span key={a} className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-expiry-danger)]/10 text-[var(--color-expiry-danger)] text-[10px] font-medium">{a}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function AddMemberForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const addMember = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("family_members").insert({ name: name.trim(), family_id: user.id });
      if (error) throw error;
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ["family-members"] }); onClose(); },
  });
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="flex gap-2 pt-2">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del miembro" autoFocus className="flex-1 h-11 px-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-text-muted)]/15 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none" />
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => addMember.mutate()} disabled={!name.trim() || addMember.isPending} className="h-11 px-4 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white text-sm font-medium disabled:opacity-50">Añadir</motion.button>
      </div>
    </motion.div>
  );
}

export function FamilyView() {
  const { family, members, isLoading } = useFamily();
  const router = useRouter();
  const { theme, setTheme } = useUIStore();
  const queryClient = useQueryClient();
  const [showAddMember, setShowAddMember] = useState(false);

  // Load saved goals from family settings
  const savedGoals: string[] = (family?.settings as any)?.nutritional_goals || [];
  const [activeGoals, setActiveGoals] = useState<Set<string>>(new Set(savedGoals));
  const [goalsSaving, setGoalsSaving] = useState(false);

  // Sync when family data loads
  useEffect(() => {
    if (family?.settings) {
      const goals = (family.settings as any)?.nutritional_goals || [];
      setActiveGoals(new Set(goals));
    }
  }, [family]);

  // Persist goals to Supabase
  const saveGoals = useCallback(async (goals: Set<string>) => {
    setGoalsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const currentSettings = (family?.settings as Record<string, unknown>) || {};
      await supabase.from("families").update({
        settings: { ...currentSettings, nutritional_goals: Array.from(goals) },
      }).eq("id", user.id);
      queryClient.invalidateQueries({ queryKey: ["family"] });
    } finally {
      setGoalsSaving(false);
    }
  }, [family, queryClient]);

  const toggleGoal = (goalId: string) => {
    setActiveGoals((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      saveGoals(next);
      return next;
    });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Familia</h1>
          {family && <p className="text-sm text-[var(--color-text-secondary)]">{family.name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={toggleTheme} className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-text-muted)]/10 flex items-center justify-center" aria-label="Cambiar tema">
            {theme === "dark" ? <Sun className="w-5 h-5 text-[var(--color-text-secondary)]" /> : <Moon className="w-5 h-5 text-[var(--color-text-secondary)]" />}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout} className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-expiry-danger)]/10 flex items-center justify-center" aria-label="Cerrar sesión">
            <LogOut className="w-5 h-5 text-[var(--color-expiry-danger)]" />
          </motion.button>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Miembros</h2>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAddMember(!showAddMember)} className="h-8 px-3 rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Añadir
          </motion.button>
        </div>
        {showAddMember && <AddMemberForm onClose={() => setShowAddMember(false)} />}
        {isLoading ? (
          <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-[72px] skeleton rounded-[var(--radius-lg)]" />)}</div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto"><User className="w-8 h-8 text-[var(--color-primary)]/60" /></div>
            <p className="text-sm text-[var(--color-text-secondary)]">Añade a los miembros de tu familia</p>
          </div>
        ) : (
          <div className="space-y-2">{members.map((m) => <MemberCard key={m.id} member={m} />)}</div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Objetivos nutricionales</h2>
          {goalsSaving && <span className="text-xs text-[var(--color-primary)] animate-pulse">Guardando...</span>}
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">La IA aplicará estos objetivos en todas las sugerencias</p>
        <div className="space-y-2">
          {GOALS.map((goal) => {
            const isActive = activeGoals.has(goal.id);
            return (
              <motion.button key={goal.id} whileTap={{ scale: 0.98 }} onClick={() => toggleGoal(goal.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border transition-all text-left ${isActive ? "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5" : "border-[var(--color-text-muted)]/10 bg-[var(--color-surface)]"}`}>
                <span className="text-xl">{goal.emoji}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"}`}>{goal.label}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{goal.desc}</p>
                </div>
                <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${isActive ? "bg-[var(--color-primary)]" : "bg-[var(--color-text-muted)]/20"}`}>
                  <motion.div animate={{ x: isActive ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {family && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Cuenta</h2>
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-4 border border-[var(--color-text-muted)]/8 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Email</span>
              <span className="text-[var(--color-text-primary)] font-medium">{family.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Miembro desde</span>
              <span className="text-[var(--color-text-primary)] font-medium">{new Date(family.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
