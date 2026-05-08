"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, ShoppingBasket, BookOpen, Users } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import type { TabId } from "@/types/database";

const tabs: { id: TabId; label: string; icon: typeof UtensilsCrossed }[] = [
  { id: "hoy", label: "Hoy", icon: UtensilsCrossed },
  { id: "despensa", label: "Despensa", icon: ShoppingBasket },
  { id: "recetario", label: "Recetario", icon: BookOpen },
  { id: "familia", label: "Familia", icon: Users },
];

export function TabBar() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl border-t border-[var(--color-text-muted)]/10 safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center gap-0.5 w-full h-full tap-target"
                aria-label={tab.label}
                role="tab"
                aria-selected={isActive}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[var(--color-primary)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{
                    scale: isActive ? 1 : 0.9,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    className={`w-[22px] h-[22px] transition-colors duration-200 ${
                      isActive
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)]"
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
