"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/lib/stores/ui-store";
import { TabBar } from "@/components/layout/tab-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { SheetModal } from "@/components/ui/sheet-modal";
import { TodayView } from "@/components/today/today-view";
import { PantryView } from "@/components/pantry/pantry-view";
import { RecipesView } from "@/components/recipes/recipes-view";
import { FamilyView } from "@/components/family/family-view";
import { Suspense } from "react";

/* Layout root — 100dvh container with safe area boundaries */
const TAB_COMPONENTS = {
  hoy: TodayView,
  despensa: PantryView,
  recetario: RecipesView,
  familia: FamilyView,
} as const;

const screenTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
};

function AppShell() {
  const { activeTab } = useUIStore();
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div
      className="min-h-[100dvh]"
      style={{ background: "var(--color-bg-primary)" }}
    >
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area — bounded by safe area top and tab bar bottom */}
      <main className="md:ml-[240px]" style={{ paddingBottom: "var(--tab-bar-total)" }}>
        <div
          className="max-w-2xl mx-auto"
          style={{ padding: "max(var(--sat), 20px) var(--space-5) var(--space-4) var(--space-5)" }}
        >
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} {...screenTransition}>
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Tab bar — fixed bottom, glass-strong */}
      <TabBar />

      {/* Global sheet modal */}
      <SheetModal />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-[100dvh] flex items-center justify-center"
          style={{ background: "var(--color-bg-primary)" }}
        >
          <div
            className="rounded-full animate-spin"
            style={{
              width: 32,
              height: 32,
              border: "3px solid var(--color-bg-tertiary)",
              borderTopColor: "var(--color-accent)",
            }}
          />
        </div>
      }
    >
      <AppShell />
    </Suspense>
  );
}
