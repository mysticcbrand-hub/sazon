"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Heart, Clock, Flame, Sparkles, X, Loader2, Trash2, BookOpen } from "lucide-react";
import { useRecipes } from "@/lib/hooks/use-recipes";
import { useAI } from "@/lib/hooks/use-ai";
import { useUIStore } from "@/lib/stores/ui-store";
import type { Recipe } from "@/types/database";
import { useState, useMemo, useCallback } from "react";

/* Recipes view — grid layout with glass-card, AI generation, detail sheet */

const DIFF: Record<string, { label: string; emoji: string }> = {
  easy: { label: "Fácil", emoji: "⚡" },
  medium: { label: "Media", emoji: "🔥" },
  hard: { label: "Elaborada", emoji: "👨‍🍳" },
};

function RecipeCard({ recipe, index, onFav, onOpen }: { recipe: Recipe; index: number; onFav: (id: string, f: boolean) => void; onOpen: (r: Recipe) => void }) {
  const diff = DIFF[recipe.difficulty] || DIFF.medium;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpen(recipe)}
      className="glass-card"
      style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", cursor: "pointer" }}
    >
      {/* Color header */}
      <div style={{ height: 100, background: "linear-gradient(135deg, var(--color-accent), rgba(45,106,79,0.6))", position: "relative" }}>
        {recipe.cover_photo_url && <img src={recipe.cover_photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        <button onClick={e => { e.stopPropagation(); onFav(recipe.id, !recipe.is_favorite); }}
          style={{ position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart style={{ width: 16, height: 16, color: recipe.is_favorite ? "var(--color-accent-warm)" : "var(--color-text-tertiary)", fill: recipe.is_favorite ? "currentColor" : "none" }} />
        </button>
        <span style={{ position: "absolute", bottom: 6, left: 8, padding: "2px 8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", color: "white", fontSize: 10, fontWeight: 600 }}>{diff.emoji} {diff.label}</span>
      </div>
      <div style={{ padding: "var(--space-3)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{recipe.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          {recipe.prep_time_min && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: "var(--color-text-secondary)" }}><Clock style={{ width: 12, height: 12 }} />{recipe.prep_time_min}min</span>}
          {recipe.prep_time_min && recipe.macros?.protein_g && <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>·</span>}
          {recipe.macros?.protein_g && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: "var(--color-accent)" }}><Flame style={{ width: 12, height: 12 }} />{recipe.macros.protein_g}g</span>}
        </div>
      </div>
    </motion.div>
  );
}

function CreatePanel({ onClose }: { onClose: () => void }) {
  const { callAI, loading } = useAI();
  const { addRecipe } = useRecipes();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setResult(null); setError(null);
    try {
      const r = await callAI("generate_recipe", { prompt: prompt.trim() });
      if (r?.title) setResult(r); else setError("No se pudo generar. Inténtalo de nuevo.");
    } catch { setError("Error de conexión con la IA."); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      className="glass-card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles style={{ width: 18, height: 18, color: "var(--color-accent)" }} />
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)" }}>Crear con IA</h3>
        </div>
        <button onClick={onClose} className="tap-target" style={{ color: "var(--color-text-tertiary)", background: "none", border: "none", cursor: "pointer" }}><X style={{ width: 20, height: 20 }} /></button>
      </div>
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder='Ej: "Algo con pollo, rápido y sin gluten"' rows={3}
        style={{ width: "100%", padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-bg-secondary)", border: "0.5px solid var(--color-separator)", fontSize: 15, color: "var(--color-text-primary)", outline: "none", resize: "none", fontFamily: "inherit" }} />
      <motion.button whileTap={{ scale: 0.97 }} onClick={generate} disabled={loading || !prompt.trim()}
        className={loading ? "btn-loading" : ""}
        style={{ width: "100%", height: 54, borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", background: loading ? undefined : "var(--color-accent)", color: "white", fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: !prompt.trim() && !loading ? 0.45 : 1 }}>
        {loading ? <><Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> Generando...</> : <><Sparkles style={{ width: 18, height: 18 }} /> Generar</>}
      </motion.button>
      {error && <p style={{ fontSize: 13, color: "var(--color-accent-warm)" }}>{error}</p>}
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <h4 style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)" }}>{result.title}</h4>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{result.description}</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { addRecipe.mutate(result); onClose(); }}
            style={{ width: "100%", height: 44, borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", background: "var(--color-accent)", color: "white", fontSize: 15, fontWeight: 600, marginTop: 4 }}>
            ✅ Guardar en recetario
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

export function RecipesView() {
  const { recipes, isLoading, toggleFavorite, deleteRecipe } = useRecipes();
  const { openSheet, closeSheet } = useUIStore();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let r = recipes;
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter(x => x.title.toLowerCase().includes(q) || x.tags.some(t => t.includes(q))); }
    if (filter === "favorites") r = r.filter(x => x.is_favorite);
    else if (filter) r = r.filter(x => x.tags.includes(filter));
    return r;
  }, [recipes, search, filter]);

  const handleFav = (id: string, f: boolean) => toggleFavorite.mutate({ id, is_favorite: f });

  const openDetail = useCallback((recipe: Recipe) => {
    const diff = DIFF[recipe.difficulty] || DIFF.medium;
    openSheet(
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <div>
          <h2 className="text-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}>{recipe.title}</h2>
          {recipe.description && <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginTop: 8 }}>{recipe.description}</p>}
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {recipe.macros?.protein_g && <span style={{ padding: "6px 12px", borderRadius: "var(--radius-full)", background: "var(--color-accent-light)", color: "var(--color-accent)", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><Flame style={{ width: 14, height: 14 }} /> {recipe.macros.protein_g}g prot</span>}
          {recipe.macros?.calories && <span style={{ padding: "6px 12px", borderRadius: "var(--radius-full)", background: "var(--color-accent-warm-light)", color: "var(--color-accent-warm)", fontSize: 13, fontWeight: 600 }}>{recipe.macros.calories} kcal</span>}
          {recipe.prep_time_min && <span style={{ padding: "6px 12px", borderRadius: "var(--radius-full)", background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><Clock style={{ width: 14, height: 14 }} /> {recipe.prep_time_min} min</span>}
          <span style={{ padding: "6px 12px", borderRadius: "var(--radius-full)", background: "var(--color-bg-secondary)", fontSize: 13, fontWeight: 500 }}>{diff.emoji} {diff.label}</span>
        </div>
        {recipe.ingredients?.length > 0 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Ingredientes</h3>
            <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
              {recipe.ingredients.map((ing, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < recipe.ingredients.length - 1 ? "0.5px solid var(--color-separator)" : "none" }}>
                  <span style={{ fontSize: 15 }}>{ing.name}</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {recipe.steps?.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Preparación</h3>
            {recipe.steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ display: "flex", gap: 12 }}>
                <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "var(--radius-full)", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{s.order || i + 1}</span>
                <p style={{ fontSize: 15, color: "var(--color-text-secondary)", paddingTop: 4, lineHeight: 1.5 }}>{s.text}</p>
              </motion.div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button onClick={() => { deleteRecipe.mutate(recipe.id); closeSheet(); }}
            style={{ height: 44, padding: "0 16px", borderRadius: "var(--radius-md)", border: "0.5px solid var(--color-accent-warm)", background: "transparent", color: "var(--color-accent-warm)", fontSize: 15, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Trash2 style={{ width: 16, height: 16 }} /> Eliminar
          </button>
          <button onClick={() => { handleFav(recipe.id, !recipe.is_favorite); closeSheet(); }}
            style={{ flex: 1, height: 44, borderRadius: "var(--radius-md)", border: "none", background: "var(--color-accent)", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Heart style={{ width: 16, height: 16, fill: recipe.is_favorite ? "white" : "none" }} /> {recipe.is_favorite ? "Quitar favorito" : "Favorito"}
          </button>
        </div>
      </div>
    );
  }, [openSheet, closeSheet, deleteRecipe, handleFav]);

  const filters = [{ id: null, label: "Todas" }, { id: "favorites", label: "⭐ Favoritas" }, { id: "quick", label: "⚡ Rápidas" }, { id: "high-protein", label: "💪 Proteína" }, { id: "fish", label: "🐟 Pescado" }, { id: "vegetarian", label: "🌱 Vegetal" }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="text-display" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--color-text-primary)" }}>Recetas</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{recipes.length} receta{recipes.length !== 1 ? "s" : ""}</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreate(!showCreate)}
          style={{ height: 36, padding: "0 14px", borderRadius: "var(--radius-md)", background: "var(--color-accent)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus style={{ width: 16, height: 16 }} /> Crear
        </motion.button>
      </div>

      <AnimatePresence>{showCreate && <CreatePanel onClose={() => setShowCreate(false)} />}</AnimatePresence>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--color-text-tertiary)" }} />
        <input type="text" placeholder="Buscar recetas..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 16, borderRadius: "var(--radius-md)", background: "var(--color-bg-secondary)", border: "0.5px solid var(--color-separator)", fontSize: 15, color: "var(--color-text-primary)", outline: "none" }} />
      </div>

      {/* Filters */}
      <div className="hide-scrollbar" style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto", margin: "0 calc(var(--space-5) * -1)", padding: "0 var(--space-5)" }}>
        {filters.map(f => (
          <button key={f.id || "all"} onClick={() => setFilter(f.id)}
            style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "var(--radius-full)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 150ms",
              background: filter === f.id ? "var(--color-accent)" : "var(--color-bg-secondary)",
              color: filter === f.id ? "white" : "var(--color-text-secondary)" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "var(--space-12) 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.4 }}>
            <rect x="10" y="8" width="44" height="48" rx="4" stroke="var(--color-accent)" strokeWidth="1.5" />
            <line x1="18" y1="20" x2="46" y2="20" stroke="var(--color-accent)" strokeWidth="1.5" />
            <line x1="18" y1="28" x2="38" y2="28" stroke="var(--color-accent)" strokeWidth="1.5" />
            <line x1="18" y1="36" x2="42" y2="36" stroke="var(--color-accent)" strokeWidth="1.5" />
          </svg>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)" }}>
            {search ? "Sin resultados" : "Tu recetario está vacío"}
          </h3>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", maxWidth: 260 }}>
            {search ? "Prueba con otros términos" : "La IA puede crear tu primera receta"}
          </p>
          {!search && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)}
              style={{ height: 44, padding: "0 24px", borderRadius: "var(--radius-md)", background: "var(--color-accent)", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Sparkles style={{ width: 16, height: 16 }} /> Crear con IA
            </motion.button>
          )}
        </motion.div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          {filtered.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} onFav={handleFav} onOpen={openDetail} />)}
        </div>
      )}
    </div>
  );
}
