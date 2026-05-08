"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, ShoppingBasket, BookOpen, Users, ChefHat } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import type { TabId } from "@/types/database";

const tabs: { id: TabId; label: string; icon: typeof UtensilsCrossed }[] = [
  { id: "hoy", label: "Hoy", icon: UtensilsCrossed },
  { id: "despensa", label: "Despensa", icon: ShoppingBasket },
  { id: "recetario", label: "Recetario", icon: BookOpen },
  { id: "familia", label: "Familia", icon: Users },
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-[100dvh] fixed left-0 top-0 bg-[var(--color-surface)] border-r border-[var(--color-text-muted)]/10 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-[var(--color-text-muted)]/10">
        <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center">
          <ChefHat className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
        <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
          SAZÓN
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative w-full flex items-center gap-3 h-11 px-3 rounded-[var(--radius-md)] transition-colors duration-150 text-left"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 rounded-[var(--radius-md)] bg-[var(--color-primary)]/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`relative w-5 h-5 ${
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)]"
                }`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`relative text-sm font-medium ${
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--color-text-muted)]/10">
        <p className="text-xs text-[var(--color-text-muted)]">SAZÓN v1.0</p>
      </div>
    </aside>
  );
}
