"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Clock,
  Flame,
  ChevronRight,
  Wand2,
  ShoppingCart,
  RefreshCw,
  Check,
  Loader2,
  ChefHat,
} from "lucide-react";
import { useFamily } from "@/lib/hooks/use-family";
import { useDailyMenu } from "@/lib/hooks/use-daily-menu";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAI } from "@/lib/hooks/use-ai";
import { DIFFICULTY_CONFIG } from "@/types/database";
import type { MealOption } from "@/types/database";
import { useState, useCallback } from "react";

const mealLabels: Record<string, string> = {
  breakfast: "🌅 Desayuno",
  lunch: "☀️ Comida",
  dinner: "🌙 Cena",
};

function MealCard({ meal, index }: { meal: MealOption; index: number }) {
  const { openSheet, closeSheet } = useUIStore();
  const diff = DIFFICULTY_CONFIG[meal.difficulty || "medium"];
  const [cooked, setCooked] = useState(false);

  const handleCook = useCallback(() => {
    setCooked(true);
    setTimeout(() => closeSheet(), 1500);
  }, [closeSheet]);

  const openDetail = useCallback(() => {
    openSheet(
      <div className="space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
            {meal.title}
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{meal.description}</p>
        </div>

        {/* Macros bar */}
        <div className="flex gap-2">
          {meal.protein_g > 0 && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold">
              <Flame className="w-3.5 h-3.5" /> {meal.protein_g}g prot
            </span>
          )}
          {meal.prep_time_min > 0 && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" /> {meal.prep_time_min} min
            </span>
          )}
          <span className="px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-text-muted)]/10 text-xs font-semibold">
            {diff.emoji} {diff.label}
          </span>
        </div>

        {/* Ingredients */}
        {meal.recipe && meal.recipe.ingredients && (
          <div className="space-y-2">
            <h3 className="font-semibold text-[var(--color-text-primary)] text-sm flex items-center gap-2">
              🧾 Ingredientes
            </h3>
            <div className="bg-[var(--color-background)] rounded-[var(--radius-md)] p-3 space-y-1.5">
              {meal.recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-primary)]">{ing.name}</span>
                  <span className="text-[var(--color-text-muted)] text-xs">
                    {ing.quantity} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        {meal.recipe && meal.recipe.steps && (
          <div className="space-y-2">
            <h3 className="font-semibold text-[var(--color-text-primary)] text-sm flex items-center gap-2">
              👨‍🍳 Preparación
            </h3>
            <div className="space-y-3">
              {meal.recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                    {step.order || i + 1}
                  </span>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pt-1">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cook button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleCook}
          disabled={cooked}
          className={`w-full h-13 rounded-[var(--radius-lg)] font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            cooked
              ? "bg-[var(--color-secondary)] text-white"
              : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white"
          }`}
        >
          {cooked ? (
            <>
              <Check className="w-5 h-5" /> ¡Registrado! Buen provecho 🎉
            </>
          ) : (
            <>
              <ChefHat className="w-5 h-5" /> Voy a cocinar esto
            </>
          )}
        </motion.button>
      </div>
    );
  }, [meal, openSheet, handleCook, cooked, diff, closeSheet]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.97 }}
      onClick={openDetail}
      className="shrink-0 w-[280px] h-[180px] rounded-[var(--radius-lg)] overflow-hidden relative group text-left"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/80 to-[var(--color-secondary)]/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-semibold text-base leading-tight line-clamp-2 drop-shadow-sm">
          {meal.title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
            <Flame className="w-3 h-3" /> {meal.protein_g}g prot
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
            <Clock className="w-3 h-3" /> {meal.prep_time_min}min
          </span>
          <span className="text-xs">{diff.emoji}</span>
        </div>
      </div>

      {meal.missing_ingredients && meal.missing_ingredients.length > 0 && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-expiry-warn)] text-white text-[10px] font-semibold">
          Faltan {meal.missing_ingredients.length}
        </div>
      )}
    </motion.button>
  );
}

function MealSection({ label, meals }: { label: string; meals: MealOption[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] px-1">{label}</h2>
      {meals.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar -mx-5 px-5">
          {meals.map((meal, i) => (
            <MealCard key={`${meal.title}-${i}`} meal={meal} index={i} />
          ))}
        </div>
      ) : (
        <SkeletonCards />
      )}
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="flex gap-3 overflow-hidden -mx-5 px-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="shrink-0 w-[280px] h-[180px] rounded-[var(--radius-lg)] skeleton" />
      ))}
    </div>
  );
}

export function TodayView() {
  const { family } = useFamily();
  const { menu, isLoading } = useDailyMenu();
  const { callAI, loading: aiLoading, error: aiError } = useAI();
  const { openSheet } = useUIStore();
  const [menuData, setMenuData] = useState<{ lunch: MealOption[]; dinner: MealOption[] } | null>(null);
  const [generating, setGenerating] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
  const dateStr = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  const lunchMeals = menuData?.lunch || menu?.lunch || [];
  const dinnerMeals = menuData?.dinner || menu?.dinner || [];

  const handleGenerateMenu = async () => {
    setGenerating(true);
    try {
      // Read goals from family settings
      const goals = (family?.settings as any)?.nutritional_goals || [];
      const result = await callAI("generate_briefing", { goals });
      if (result && (result.lunch || result.dinner)) {
        setMenuData({ lunch: result.lunch || [], dinner: result.dinner || [] });
      }
    } catch {
      // Error shown via aiError
    } finally {
      setGenerating(false);
    }
  };

  const handleShoppingList = async () => {
    const currentMenu = { lunch: lunchMeals, dinner: dinnerMeals };
    // Collect missing ingredients from menu
    const missing: string[] = [];
    [...lunchMeals, ...dinnerMeals].forEach((m) => {
      if (m.missing_ingredients) missing.push(...m.missing_ingredients);
    });

    openSheet(
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-4xl">🛒</div>
          <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
            Lista de la compra
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Basada en tu menú de hoy
          </p>
        </div>

        {missing.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Te falta:</h3>
            <div className="bg-[var(--color-background)] rounded-[var(--radius-md)] p-3 space-y-2">
              {missing.map((item, i) => (
                <label key={i} className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded accent-[var(--color-primary)]" />
                  <span className="text-[var(--color-text-primary)]">{item}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[var(--color-secondary)]/10 rounded-[var(--radius-md)] p-4 text-center">
            <p className="text-sm text-[var(--color-secondary)] font-medium">
              ✅ ¡Tienes todo lo necesario en tu despensa!
            </p>
          </div>
        )}

        {/* All ingredients from menu recipes */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Todos los ingredientes del menú:</h3>
          <div className="bg-[var(--color-background)] rounded-[var(--radius-md)] p-3 space-y-2">
            {[...lunchMeals, ...dinnerMeals]
              .filter((m) => m.recipe?.ingredients)
              .flatMap((m) => m.recipe!.ingredients)
              .map((ing, i) => (
                <label key={i} className="flex items-center justify-between text-sm cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded accent-[var(--color-primary)]" />
                    <span className="text-[var(--color-text-primary)]">{ing.name}</span>
                  </div>
                  <span className="text-[var(--color-text-muted)] text-xs">
                    {ing.quantity} {ing.unit}
                  </span>
                </label>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const handleSurprise = async () => {
    try {
      const result = await callAI("surprise_me", {});
      if (result) {
        openSheet(
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="text-5xl">✨</div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                {result.title || "¡Sorpresa deliciosa!"}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {result.description}
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              {result.protein_g && (
                <span className="px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold">
                  {result.protein_g}g prot
                </span>
              )}
              {result.prep_time_min && (
                <span className="px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-xs font-semibold">
                  {result.prep_time_min} min
                </span>
              )}
            </div>

            {result.recipe?.ingredients && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">🧾 Ingredientes</h3>
                <div className="bg-[var(--color-background)] rounded-[var(--radius-md)] p-3 space-y-1.5">
                  {result.recipe.ingredients.map((ing: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{ing.name}</span>
                      <span className="text-[var(--color-text-muted)] text-xs">{ing.quantity} {ing.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.recipe?.steps && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">👨‍🍳 Pasos</h3>
                <div className="space-y-3">
                  {result.recipe.steps.map((step: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                        {step.order || i + 1}
                      </span>
                      <p className="text-sm text-[var(--color-text-secondary)] pt-1">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
    } catch {
      // Error handled in hook
    }
  };

  const hasMenu = lunchMeals.length > 0 || dinnerMeals.length > 0;

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{greeting} 👋</h1>
        <p className="text-sm text-[var(--color-text-secondary)] capitalize">{dateStr}</p>
        {family && <p className="text-xs text-[var(--color-text-muted)]">{family.name}</p>}
      </motion.div>

      {/* Error banner */}
      {aiError && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-expiry-danger)]/10 border border-[var(--color-expiry-danger)]/20">
          <p className="text-sm text-[var(--color-expiry-danger)]">{aiError}</p>
        </div>
      )}

      {/* Generate menu CTA — shown when no menu */}
      {!hasMenu && !generating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 space-y-4"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-secondary)]/15 flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-[var(--color-primary)]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">
              ¿Qué comemos hoy?
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto">
              Deja que la IA sugiera un menú personalizado para tu familia
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleGenerateMenu}
            disabled={aiLoading}
            className="h-12 px-8 rounded-[var(--radius-lg)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-[var(--shadow-fab)]"
          >
            <Sparkles className="w-5 h-5" /> Generar menú con IA
          </motion.button>
        </motion.div>
      )}

      {/* Generating state */}
      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] mx-auto"
          />
          <div className="space-y-1">
            <p className="font-semibold text-[var(--color-text-primary)]">Cocinando ideas...</p>
            <p className="text-sm text-[var(--color-text-secondary)]">La IA está analizando tu despensa y preferencias</p>
          </div>
        </motion.div>
      )}

      {/* Shopping list banner */}
      {hasMenu && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShoppingList}
          className="w-full flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-secondary)]/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[var(--color-secondary)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Lista de la compra</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Ver ingredientes del menú</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
        </motion.button>
      )}

      {/* Meal Sections */}
      {hasMenu && (
        <>
          {lunchMeals.length > 0 && <MealSection label={mealLabels.lunch} meals={lunchMeals} />}
          {dinnerMeals.length > 0 && <MealSection label={mealLabels.dinner} meals={dinnerMeals} />}

          {/* Regenerate button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerateMenu}
            disabled={generating || aiLoading}
            className="w-full h-11 rounded-[var(--radius-md)] border border-[var(--color-text-muted)]/15 text-sm font-medium text-[var(--color-text-secondary)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} /> Regenerar menú
          </motion.button>
        </>
      )}

      {/* Surprise FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleSurprise}
        disabled={aiLoading}
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[var(--shadow-fab)] flex items-center justify-center disabled:opacity-60"
        aria-label="Sorpréndeme"
      >
        {aiLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Wand2 className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
}
