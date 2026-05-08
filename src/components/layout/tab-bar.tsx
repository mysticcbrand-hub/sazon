"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, ShoppingBasket, BookOpen, Users } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import type { TabId } from "@/types/database";

/* Tab bar — Apple HIG native feel, glass-strong level */
const tabs: { id: TabId; label: string; icon: typeof UtensilsCrossed }[] = [
  { id: "hoy", label: "Hoy", icon: UtensilsCrossed },
  { id: "despensa", label: "Despensa", icon: ShoppingBasket },
  { id: "recetario", label: "Recetas", icon: BookOpen },
  { id: "familia", label: "Familia", icon: Users },
];

export function TabBar() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden">
      <div
        className="glass-strong"
        style={{ height: "var(--tab-bar-total)", paddingBottom: "var(--sab)" }}
      >
        <div className="flex items-center justify-around h-[49px] max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 600, damping: 30, duration: 0.08 }}
                className="relative flex flex-col items-center justify-center gap-[2px] flex-1 h-full"
                aria-label={tab.label}
                role="tab"
                aria-selected={isActive}
              >
                <Icon
                  className="transition-colors duration-150"
                  style={{
                    width: 24,
                    height: 24,
                    color: isActive ? "var(--color-accent)" : "var(--color-text-tertiary)",
                    strokeWidth: isActive ? 2.2 : 1.5,
                    fill: isActive ? "currentColor" : "none",
                  }}
                />
                <span
                  className="transition-colors duration-150"
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                    lineHeight: 1,
                    color: isActive ? "var(--color-accent)" : "var(--color-text-tertiary)",
                  }}
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
