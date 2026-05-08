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
      <div
        className="bg-[var(--color-surface)]/80 backdrop-blur-2xl border-t border-[var(--color-text-muted)]/8"
        style={{ paddingBottom: "var(--sab)" }}
      >
        <div className="flex items-center justify-around h-[49px] max-w-lg mx-auto px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.1 }}
                className="relative flex flex-col items-center justify-center gap-[2px] w-full h-full"
                aria-label={tab.label}
                role="tab"
                aria-selected={isActive}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[var(--color-primary)]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1 : 0.92, y: isActive ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Icon
                    className={`w-[22px] h-[22px] transition-colors duration-150 ${
                      isActive
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)]"
                    }`}
                    strokeWidth={isActive ? 2.3 : 1.6}
                    fill={isActive ? "currentColor" : "none"}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium leading-none transition-colors duration-150 ${
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
