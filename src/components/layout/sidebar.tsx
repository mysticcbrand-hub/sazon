"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, ShoppingBasket, BookOpen, Users, ChefHat } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import type { TabId } from "@/types/database";

/* Sidebar — desktop navigation, hidden on mobile */
const tabs: { id: TabId; label: string; icon: typeof UtensilsCrossed }[] = [
  { id: "hoy", label: "Hoy", icon: UtensilsCrossed },
  { id: "despensa", label: "Despensa", icon: ShoppingBasket },
  { id: "recetario", label: "Recetas", icon: BookOpen },
  { id: "familia", label: "Familia", icon: Users },
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 z-50"
      style={{ width: 240, height: "100dvh", background: "var(--color-bg-secondary)", borderRight: "0.5px solid var(--color-separator)" }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "0 var(--space-6)", height: 64, borderBottom: "0.5px solid var(--color-separator)" }}>
        <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChefHat style={{ width: 20, height: 20, color: "white" }} strokeWidth={1.5} />
        </div>
        <span className="text-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>SAZÓN</span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "var(--space-4) var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", gap: "var(--space-3)", height: 44, padding: "0 var(--space-3)", borderRadius: "var(--radius-md)", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", transition: "all 150ms" }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  style={{ position: "absolute", inset: 0, borderRadius: "var(--radius-md)", background: "var(--color-accent-light)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon style={{ position: "relative", width: 20, height: 20, color: isActive ? "var(--color-accent)" : "var(--color-text-tertiary)", transition: "color 150ms" }} strokeWidth={isActive ? 2 : 1.5} />
              <span style={{ position: "relative", fontSize: 15, fontWeight: 500, color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)", transition: "color 150ms" }}>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "var(--space-4) var(--space-6)", borderTop: "0.5px solid var(--color-separator)" }}>
        <p style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>SAZÓN v1.1</p>
      </div>
    </aside>
  );
}
