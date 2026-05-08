"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/lib/stores/ui-store";
import { X } from "lucide-react";

export function SheetModal() {
  const { isSheetOpen, sheetContent, closeSheet } = useUIStore();

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSheet}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) {
                closeSheet();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[61] bg-[var(--color-surface)] rounded-t-[var(--radius-xl)] shadow-[var(--shadow-sheet)] max-h-[90dvh] overflow-hidden flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--color-text-muted)]/30" />
            </div>

            {/* Close button */}
            <button
              onClick={closeSheet}
              className="absolute top-3 right-4 tap-target text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2 safe-bottom">
              {sheetContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
