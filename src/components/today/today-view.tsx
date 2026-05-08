"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock, Flame, ChevronRight, Wand2, ShoppingCart, RefreshCw, Check, Loader2, ChefHat } from "lucide-react";
import { useFamily } from "@/lib/hooks/use-family";
import { useDailyMenu } from "@/lib/hooks/use-daily-menu";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAI } from "@/lib/hooks/use-ai";
import type { MealOption } from "@/types/database";
import { useState, useCallback } from "react";

/* Today view — hero screen, Opal-inspired minimal layout */

const DIFF: Record<string, { label: string; emoji: string }> = {
  easy: { label: "Fácil", emoji: "⚡" },
  medium: { label: "Media", emoji: "🔥" },
  hard: { label: "Elaborada", emoji: "👨‍🍳" },
};

function MealCard({ meal, index }: { meal: MealOption; index: number }) {
  const { openSheet, closeSheet } = useUIStore();
  const [cooked, setCooked] = useState(false);
  const diff = DIFF[meal.difficulty || "medium"];

  const handleCook = useCallback(() => {
    setCooked(true);
    setTimeout(() => closeSheet(), 1200);
  }, [closeSheet]);

  const openDetail = useCallback(() => {
    openSheet(
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <h2 className="text-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}>
            {meal.title}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--color-text-secondary)" }}>{meal.description}</p>
          {(meal as any).por_que_hoy && (
            <p style={{ fontSize: 13, color: "var(--color-accent)", fontWeight: 500, fontStyle: "italic" }}>
              💡 {(meal as any).por_que_hoy}
            </p>
          )}
        </div>

        {/* Macro pills */}
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {meal.protein_g > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: "var(--radius-full)", background: "var(--color-accent-light)", color: "var(--color-accent)", fontSize: 13, fontWeight: 600 }}>
              <Flame style={{ width: 14, height: 14 }} /> {meal.protein_g}g prot
            </span>
          )}
          {meal.prep_time_min > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: "var(--radius-full)", background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)", fontSize: 13, fontWeight: 600 }}>
              <Clock style={{ width: 14, height: 14 }} /> {meal.prep_time_min} min
            </span>
          )}
          <span style={{ padding: "6px 12px", borderRadius: "var(--radius-full)", background: "var(--color-bg-secondary)", fontSize: 13, fontWeight: 500 }}>
            {diff.emoji} {diff.label}
          </span>
        </div>

        {/* Ingredients */}
        {meal.recipe?.ingredients && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Ingredientes</h3>
            <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
              {meal.recipe.ingredients.map((ing, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < meal.recipe!.ingredients.length - 1 ? "0.5px solid var(--color-separator)" : "none" }}>
                  <span style={{ fontSize: 15, color: "var(--color-text-primary)" }}>{ing.name}</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        {meal.recipe?.steps && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Preparación</h3>
            {meal.recipe.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: "flex", gap: "var(--space-3)" }}
              >
                <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "var(--radius-full)", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                  {step.order || i + 1}
                </span>
                <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--color-text-secondary)", paddingTop: 4 }}>{step.text}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Cook button — primary action */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCook}
          disabled={cooked}
          style={{
            width: "100%", height: 54, borderRadius: "var(--radius-md)", border: "none", cursor: "pointer",
            background: cooked ? "#22C55E" : "var(--color-accent)",
            color: "white", fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: cooked ? 1 : 1, transition: "background 200ms",
          }}
        >
          {cooked ? <><Check style={{ width: 20, height: 20 }} /> ¡Buen provecho!</> : <><ChefHat style={{ width: 20, height: 20 }} /> Voy a cocinar esto</>}
        </motion.button>
      </div>
    );
  }, [meal, openSheet, handleCook, cooked, diff, closeSheet]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
      onClick={openDetail}
      className="glass-card"
      style={{
        flexShrink: 0, width: 272, borderRadius: "var(--radius-lg)", overflow: "hidden",
        textAlign: "left", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column",
      }}
    >
      {/* Color gradient top — instead of image */}
      <div style={{ height: 100, background: `linear-gradient(135deg, var(--color-accent), var(--color-accent-warm))`, position: "relative" }}>
        {meal.missing_ingredients && meal.missing_ingredients.length > 0 && (
          <span style={{ position: "absolute", top: 8, right: 8, padding: "3px 8px", borderRadius: "var(--radius-full)", background: "var(--color-accent-warm)", color: "white", fontSize: 10, fontWeight: 700 }}>
            Faltan {meal.missing_ingredients.length}
          </span>
        )}
        <div style={{ position: "absolute", bottom: 8, left: 12, display: "flex", gap: 6 }}>
          <span style={{ padding: "3px 8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", color: "white", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
            <Clock style={{ width: 11, height: 11 }} /> {meal.prep_time_min}min
          </span>
          <span style={{ padding: "3px 8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", color: "white", fontSize: 11, fontWeight: 600 }}>
            {diff.emoji}
          </span>
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: "var(--space-3) var(--space-4) var(--space-4)" }}>
        <h3 className="text-display" style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.3, letterSpacing: "-0.01em", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {meal.title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 13, color: "var(--color-accent)", fontWeight: 600 }}>{meal.protein_g}g prot</span>
          <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>·</span>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{meal.prep_time_min} min</span>
        </div>
      </div>
    </motion.button>
  );
}

function MealSection({ label, meals }: { label: string; meals: MealOption[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <h2 className="text-display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>{label}</h2>
      <div className="hide-scrollbar" style={{ display: "flex", gap: "var(--space-3)", overflowX: "auto", margin: "0 calc(var(--space-5) * -1)", padding: "0 var(--space-5)", paddingBottom: "var(--space-2)" }}>
        {meals.map((meal, i) => <MealCard key={`${meal.title}-${i}`} meal={meal} index={i} />)}
      </div>
    </div>
  );
}

export function TodayView() {
  const { family } = useFamily();
  const { menu } = useDailyMenu();
  const { callAI, loading: aiLoading, error: aiError } = useAI();
  const { openSheet } = useUIStore();
  const [menuData, setMenuData] = useState<{ lunch: MealOption[]; dinner: MealOption[] } | null>(null);
  const [generating, setGenerating] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días ☀️" : hour < 20 ? "Buenas tardes 🌤" : "Buenas noches 🌙";

  const lunchMeals = menuData?.lunch || menu?.lunch || [];
  const dinnerMeals = menuData?.dinner || menu?.dinner || [];
  const hasMenu = lunchMeals.length > 0 || dinnerMeals.length > 0;
  const totalSuggestions = lunchMeals.length + dinnerMeals.length;

  const handleGenerateMenu = async () => {
    setGenerating(true);
    try {
      const goals = (family?.settings as any)?.nutritional_goals || [];
      const result = await callAI("generate_briefing", { goals });
      if (result?.lunch || result?.dinner) setMenuData({ lunch: result.lunch || [], dinner: result.dinner || [] });
    } catch {} finally { setGenerating(false); }
  };

  const handleShoppingList = () => {
    const missing: string[] = [];
    [...lunchMeals, ...dinnerMeals].forEach(m => { if (m.missing_ingredients) missing.push(...m.missing_ingredients); });
    const allIngredients = [...lunchMeals, ...dinnerMeals].filter(m => m.recipe?.ingredients).flatMap(m => m.recipe!.ingredients);

    openSheet(
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "var(--space-2)", alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShoppingCart style={{ width: 24, height: 24, color: "var(--color-accent)" }} />
          </div>
          <h2 className="text-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}>Lista de la compra</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Basada en tu menú de hoy</p>
        </div>
        {missing.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-accent-warm)" }}>Te falta comprar</h3>
            <div style={{ background: "var(--color-accent-warm-light)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
              {missing.map((item, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < missing.length-1 ? "0.5px solid var(--color-separator)" : "none", cursor: "pointer" }}>
                  <input type="checkbox" style={{ width: 18, height: 18, accentColor: "var(--color-accent)" }} />
                  <span style={{ fontSize: 15, color: "var(--color-text-primary)" }}>{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {allIngredients.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Todos los ingredientes</h3>
            <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
              {allIngredients.map((ing, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < allIngredients.length-1 ? "0.5px solid var(--color-separator)" : "none", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input type="checkbox" style={{ width: 18, height: 18, accentColor: "var(--color-accent)" }} />
                    <span style={{ fontSize: 15, color: "var(--color-text-primary)" }}>{ing.name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{ing.quantity} {ing.unit}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {missing.length === 0 && allIngredients.length === 0 && (
          <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
            <p style={{ fontSize: 15, color: "var(--color-accent)", fontWeight: 500 }}>✅ Tienes todo lo necesario</p>
          </div>
        )}
      </div>
    );
  };

  const handleSurprise = async () => {
    try {
      const result = await callAI("surprise_me", {});
      if (result) openSheet(
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 40 }}>✨</p>
            <h2 className="text-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text-primary)", marginTop: 8 }}>{result.title}</h2>
            <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginTop: 8 }}>{result.description}</p>
          </div>
          {result.recipe?.ingredients && (
            <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
              {result.recipe.ingredients.map((ing: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < result.recipe.ingredients.length-1 ? "0.5px solid var(--color-separator)" : "none" }}>
                  <span style={{ fontSize: 15 }}>{ing.name}</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          )}
          {result.recipe?.steps && result.recipe.steps.map((s: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 12 }}>
              <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "var(--radius-full)", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{s.order||i+1}</span>
              <p style={{ fontSize: 15, color: "var(--color-text-secondary)", paddingTop: 4 }}>{s.text}</p>
            </div>
          ))}
        </div>
      );
    } catch {}
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Hero greeting */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-display" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--color-text-primary)", lineHeight: 1.2 }}>
          {greeting}
        </h1>
        {hasMenu && (
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginTop: 4 }}>
            SAZÓN encontró {totalSuggestions} ideas para hoy
          </p>
        )}
        {family && <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginTop: 2 }}>{family.name}</p>}
      </motion.div>

      {/* Error */}
      {aiError && (
        <div style={{ padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-accent-warm-light)", border: "0.5px solid var(--color-accent-warm)" }}>
          <p style={{ fontSize: 13, color: "var(--color-accent-warm)" }}>{aiError}</p>
        </div>
      )}

      {/* Empty state — generate CTA */}
      {!hasMenu && !generating && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "var(--space-12) 0 var(--space-8)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-5)" }}>
          {/* SVG illustration — minimal fork/knife */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.6 }}>
            <circle cx="40" cy="40" r="38" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d="M30 25v12c0 2.2 1.8 4 4 4h0c2.2 0 4-1.8 4-4V25M34 41v14M46 25l-2 16h4l-2-16zM46 45v10" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <h3 className="text-display" style={{ fontSize: 24, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>¿Qué comemos hoy?</h3>
            <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginTop: 8, maxWidth: 260, margin: "8px auto 0" }}>
              La IA analiza tu despensa y preferencias para sugerirte el menú perfecto
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerateMenu}
            disabled={aiLoading}
            style={{
              height: 54, padding: "0 32px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer",
              background: "var(--color-accent)", color: "white", fontSize: 17, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "var(--shadow-fab)",
            }}
          >
            <Sparkles style={{ width: 20, height: 20 }} /> Generar menú con IA
          </motion.button>
        </motion.div>
      )}

      {/* Generating state */}
      {generating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "var(--space-12) 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
            <Loader2 style={{ width: 32, height: 32, color: "var(--color-accent)" }} />
          </motion.div>
          <p style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)" }}>Cocinando ideas...</p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Analizando despensa y preferencias</p>
        </motion.div>
      )}

      {/* Shopping list banner */}
      {hasMenu && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShoppingList}
          className="glass-card"
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "var(--space-4)", borderRadius: "var(--radius-lg)", cursor: "pointer", border: "none", textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingCart style={{ width: 20, height: 20, color: "var(--color-accent)" }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Lista de la compra</p>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Ver ingredientes del menú</p>
            </div>
          </div>
          <ChevronRight style={{ width: 20, height: 20, color: "var(--color-text-tertiary)" }} />
        </motion.button>
      )}

      {/* Meal sections */}
      {lunchMeals.length > 0 && <MealSection label="☀️ Comida" meals={lunchMeals} />}
      {dinnerMeals.length > 0 && <MealSection label="🌙 Cena" meals={dinnerMeals} />}

      {/* Regenerate */}
      {hasMenu && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerateMenu}
          disabled={generating || aiLoading}
          style={{
            width: "100%", height: 44, borderRadius: "var(--radius-md)",
            border: "0.5px solid var(--color-separator)", background: "transparent",
            fontSize: 15, fontWeight: 500, color: "var(--color-text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
            opacity: generating ? 0.5 : 1,
          }}
        >
          <RefreshCw style={{ width: 16, height: 16 }} className={generating ? "animate-spin" : ""} /> Regenerar menú
        </motion.button>
      )}

      {/* Surprise FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleSurprise}
        disabled={aiLoading}
        style={{
          position: "fixed", bottom: "calc(var(--tab-bar-total) + var(--space-4))", right: "var(--space-5)",
          zIndex: 900, width: 56, height: 56, borderRadius: "var(--radius-full)",
          background: "var(--color-accent)", color: "white", border: "none", cursor: "pointer",
          boxShadow: "var(--shadow-fab)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: aiLoading ? 0.5 : 1,
        }}
        aria-label="Sorpréndeme"
      >
        {aiLoading ? <Loader2 style={{ width: 22, height: 22 }} className="animate-spin" /> : <Wand2 style={{ width: 24, height: 24 }} />}
      </motion.button>
    </div>
  );
}
