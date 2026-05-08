"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/lib/stores/ui-store";
import { X } from "lucide-react";

/* Bottom sheet — glass-strong level, iOS native curve */
const sheetVariants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
};

export function SheetModal() {
  const { isSheetOpen, sheetContent, closeSheet } = useUIStore();

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <>
          {/* Backdrop — subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSheet}
            className="fixed inset-0 z-[2000]"
            style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          />

          {/* Sheet — glass-strong with iOS spring curve */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.8 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) closeSheet();
            }}
            className="fixed bottom-0 left-0 right-0 z-[2001] glass-strong max-h-[85dvh] overflow-hidden flex flex-col"
            style={{ borderRadius: "var(--radius-xl) var(--radius-xl) 0 0" }}
          >
            {/* Drag handle — 36x4, centered */}
            <div className="flex justify-center pt-[var(--space-2)] pb-[var(--space-1)] shrink-0">
              <div
                className="rounded-full"
                style={{ width: 36, height: 4, background: "var(--color-text-tertiary)", opacity: 0.4 }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={closeSheet}
              className="absolute top-[var(--space-3)] right-[var(--space-4)] tap-target"
              style={{ color: "var(--color-text-tertiary)" }}
              aria-label="Cerrar"
            >
              <X style={{ width: 20, height: 20 }} />
            </button>

            {/* Content — scrollable with safe-area bottom */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ padding: "var(--space-2) var(--space-5) calc(var(--space-8) + var(--sab)) var(--space-5)" }}
            >
              {sheetContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
