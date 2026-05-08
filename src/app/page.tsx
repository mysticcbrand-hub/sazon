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
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const TAB_COMPONENTS = {
  hoy: TodayView,
  despensa: PantryView,
  recetario: RecipesView,
  familia: FamilyView,
} as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

function AppShellContent() {
  const { activeTab, setActiveTab } = useUIStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sync tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam in TAB_COMPONENTS) {
      setActiveTab(tabParam as keyof typeof TAB_COMPONENTS);
    }
  }, [searchParams, setActiveTab]);

  // Update URL when tab changes
  useEffect(() => {
    const current = new URLSearchParams(window.location.search);
    if (current.get("tab") !== activeTab) {
      router.replace(`/?tab=${activeTab}`, { scroll: false });
    }
  }, [activeTab, router]);

  const tabOrder = ["hoy", "despensa", "recetario", "familia"];
  const currentIndex = tabOrder.indexOf(activeTab);
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-[100dvh] bg-[var(--color-background)]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — safe-area top padding for iOS PWA */}
      <main className="md:ml-[240px] pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-5 pt-[max(var(--sat),24px)] md:pt-8">
          <AnimatePresence mode="wait" custom={currentIndex}>
            <motion.div
              key={activeTab}
              custom={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.25,
              }}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile tab bar */}
      <TabBar />

      {/* Sheet modal (global) */}
      <SheetModal />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[var(--color-background)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    }>
      <AppShellContent />
    </Suspense>
  );
}
