"use client";

import { motion } from "framer-motion";
import { User, Plus, LogOut, Moon, Sun, Check } from "lucide-react";
import { useFamily } from "@/lib/hooks/use-family";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useUIStore } from "@/lib/stores/ui-store";
import type { FamilyMember } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* Family view — member management + nutritional goals persistence */
const supabase = createClient();

const GOALS = [
  { id: "fish", label: "Más pescado", desc: "2-3 recetas de pescado/semana", emoji: "🐟" },
  { id: "protein", label: "Alta proteína", desc: "+25g proteína por ración", emoji: "💪" },
  { id: "vegetables", label: "Más vegetales", desc: "2+ raciones de verdura/comida", emoji: "🥦" },
  { id: "less-processed", label: "Sin procesados", desc: "Reducir ultraprocesados", emoji: "🚫" },
  { id: "low-carb", label: "Bajo en carbs", desc: "Alternativas bajas en carbohidratos", emoji: "🌾" },
];

function MemberCard({ member }: { member: FamilyMember }) {
  const initials = member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ width: 44, height: 44, borderRadius: "var(--radius-full)", background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {member.avatar_url ? (
          <img src={member.avatar_url} alt={member.name} style={{ width: "100%", height: "100%", borderRadius: "var(--radius-full)", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-accent)" }}>{initials}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>{member.name}</p>
        <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", textTransform: "capitalize" }}>{member.role}</p>
      </div>
      {member.preferences?.allergies?.length > 0 && (
        <div style={{ display: "flex", gap: 4 }}>
          {member.preferences.allergies.slice(0, 2).map(a => (
            <span key={a} style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--color-accent-warm-light)", color: "var(--color-accent-warm)", fontSize: 11, fontWeight: 600 }}>{a}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function FamilyView() {
  const { family, members, isLoading } = useFamily();
  const router = useRouter();
  const { theme, setTheme } = useUIStore();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const savedGoals: string[] = (family?.settings as any)?.nutritional_goals || [];
  const [activeGoals, setActiveGoals] = useState<Set<string>>(new Set(savedGoals));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (family?.settings) setActiveGoals(new Set((family.settings as any)?.nutritional_goals || []));
  }, [family]);

  const saveGoals = useCallback(async (goals: Set<string>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const settings = (family?.settings as Record<string, unknown>) || {};
      await supabase.from("families").update({ settings: { ...settings, nutritional_goals: Array.from(goals) } }).eq("id", user.id);
      queryClient.invalidateQueries({ queryKey: ["family"] });
    } finally { setSaving(false); }
  }, [family, queryClient]);

  const toggleGoal = (id: string) => {
    setActiveGoals(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveGoals(next);
      return next;
    });
  };

  const addMember = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No auth");
      await supabase.from("family_members").insert({ name: newName.trim(), family_id: user.id });
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ["family-members"] }); setNewName(""); setShowAdd(false); },
  });

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="text-display" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--color-text-primary)" }}>Familia</h1>
          {family && <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginTop: 2 }}>{family.name}</p>}
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggleTheme} style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--color-bg-secondary)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {theme === "dark" ? <Sun style={{ width: 18, height: 18, color: "var(--color-text-secondary)" }} /> : <Moon style={{ width: 18, height: 18, color: "var(--color-text-secondary)" }} />}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--color-accent-warm-light)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogOut style={{ width: 18, height: 18, color: "var(--color-accent-warm)" }} />
          </motion.button>
        </div>
      </div>

      {/* Members */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>Miembros</h2>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(!showAdd)} style={{ height: 32, padding: "0 12px", borderRadius: "var(--radius-md)", background: "var(--color-accent-light)", color: "var(--color-accent)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <Plus style={{ width: 14, height: 14 }} /> Añadir
          </motion.button>
        </div>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ display: "flex", gap: "var(--space-2)" }}>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre" autoFocus style={{ flex: 1, height: 44, padding: "0 var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-bg-secondary)", border: "0.5px solid var(--color-separator)", fontSize: 15, color: "var(--color-text-primary)", outline: "none" }} />
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => addMember.mutate()} disabled={!newName.trim()} style={{ height: 44, padding: "0 16px", borderRadius: "var(--radius-md)", background: "var(--color-accent)", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, opacity: newName.trim() ? 1 : 0.45 }}>OK</motion.button>
          </motion.div>
        )}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>{[0,1].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: "var(--radius-lg)" }} />)}</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-10) 0" }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: "0 auto", opacity: 0.4 }}>
              <circle cx="32" cy="24" r="10" stroke="var(--color-accent)" strokeWidth="1.5" />
              <path d="M12 52c0-11 9-20 20-20s20 9 20 20" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginTop: "var(--space-3)" }}>Añade a los miembros de tu familia</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {members.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <MemberCard member={m} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Nutritional Goals — persisted */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>Objetivos nutricionales</h2>
          {saving && <span style={{ fontSize: 11, color: "var(--color-accent)", fontWeight: 500 }}>Guardando...</span>}
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>La IA aplica estos objetivos en cada sugerencia</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {GOALS.map(goal => {
            const active = activeGoals.has(goal.id);
            return (
              <motion.button key={goal.id} whileTap={{ scale: 0.98 }} onClick={() => toggleGoal(goal.id)}
                className={active ? "glass-card" : ""}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "var(--space-3)",
                  padding: "var(--space-3)", borderRadius: "var(--radius-lg)", cursor: "pointer", textAlign: "left",
                  background: active ? undefined : "var(--color-bg-secondary)",
                  border: active ? "0.5px solid var(--color-accent)" : "0.5px solid transparent",
                  transition: "all 150ms",
                }}
              >
                <span style={{ fontSize: 24 }}>{goal.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 500, color: active ? "var(--color-accent)" : "var(--color-text-primary)" }}>{goal.label}</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{goal.desc}</p>
                </div>
                {/* Toggle */}
                <div style={{ width: 44, height: 26, borderRadius: "var(--radius-full)", background: active ? "var(--color-accent)" : "var(--color-bg-tertiary)", padding: 2, transition: "background 150ms", flexShrink: 0 }}>
                  <motion.div animate={{ x: active ? 18 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} style={{ width: 22, height: 22, borderRadius: "var(--radius-full)", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Account */}
      {family && (
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>Cuenta</h2>
          <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, padding: "4px 0" }}>
              <span style={{ color: "var(--color-text-tertiary)" }}>Email</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{family.email}</span>
            </div>
            <div style={{ height: 0.5, background: "var(--color-separator)", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, padding: "4px 0" }}>
              <span style={{ color: "var(--color-text-tertiary)" }}>Miembro desde</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{new Date(family.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
