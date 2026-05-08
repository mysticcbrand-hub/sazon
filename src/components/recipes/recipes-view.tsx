"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Heart, Clock, Flame, BookOpen, Sparkles, X, Loader2, ChefHat, Check, Trash2,
} from "lucide-react";
import { useRecipes } from "@/lib/hooks/use-recipes";
import { useAI } from "@/lib/hooks/use-ai";
import { useUIStore } from "@/lib/stores/ui-store";
import { DIFFICULTY_CONFIG } from "@/types/database";
import type { Recipe } from "@/types/database";
import { useState, useMemo, useCallback } from "react";

const TAG_COLORS: Record<string, string> = {
  "high-protein": "bg-red-100 text-red-700",
  quick: "bg-green-100 text-green-700",
  "gluten-free": "bg-purple-100 text-purple-700",
  fish: "bg-blue-100 text-blue-700",
  vegetarian: "bg-emerald-100 text-emerald-700",
  "meal-prep": "bg-amber-100 text-amber-700",
};

function RecipeCard({
  recipe, index, onToggleFavorite, onOpen,
}: {
  recipe: Recipe; index: number;
  onToggleFavorite: (id: string, fav: boolean) => void;
  onOpen: (recipe: Recipe) => void;
}) {
  const diff = DIFFICULTY_CONFIG[recipe.difficulty];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onOpen(recipe)}
      className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-text-muted)]/8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer active:scale-[0.98]"
    >
      <div className="h-36 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 relative">
        {recipe.cover_photo_url && <img src={recipe.cover_photo_url} alt={recipe.title} className="w-full h-full object-cover" />}
        <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(recipe.id, !recipe.is_favorite); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <Heart className={`w-4 h-4 ${recipe.is_favorite ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} />
        </button>
        <span className="absolute bottom-2 left-2 text-sm">{diff.emoji}</span>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2 leading-tight">{recipe.title}</h3>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          {recipe.prep_time_min && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.prep_time_min}min</span>}
          {recipe.macros.protein_g && <span className="inline-flex items-center gap-1"><Flame className="w-3 h-3" /> {recipe.macros.protein_g}g prot</span>}
        </div>
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={`px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600"}`}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CreateRecipePanel({ onClose }: { onClose: () => void }) {
  const { callAI, loading } = useAI();
  const { addRecipe } = useRecipes();
  const [prompt, setPrompt] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<Partial<Recipe> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGeneratedRecipe(null);
    setError(null);
    try {
      const result = await callAI("generate_recipe", { prompt: prompt.trim() });
      if (result && result.title) {
        setGeneratedRecipe(result);
      } else {
        setError("No se pudo generar la receta. Inténtalo de nuevo.");
      }
    } catch { setError("Error al conectar con la IA."); }
  };

  const handleSave = () => {
    if (generatedRecipe) {
      addRecipe.mutate(generatedRecipe);
      onClose();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 border border-[var(--color-text-muted)]/10 shadow-[var(--shadow-card)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text-primary)]">Crear receta con IA</h3>
        </div>
        <button onClick={onClose} className="tap-target text-[var(--color-text-muted)]"><X className="w-5 h-5" /></button>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">Describe lo que quieres cocinar</p>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
        placeholder='Ej: "Algo con pollo, rápido y sin gluten"' rows={3}
        className="w-full px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-background)] border border-[var(--color-text-muted)]/15 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none resize-none" />
      <motion.button whileTap={{ scale: 0.97 }} onClick={handleGenerate} disabled={loading || !prompt.trim()}
        className="w-full h-11 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</> : <><Sparkles className="w-4 h-4" /> Generar con IA</>}
      </motion.button>
      {error && <p className="text-sm text-[var(--color-expiry-danger)]">{error}</p>}
      {generatedRecipe && !loading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-[var(--color-background)] rounded-[var(--radius-md)] p-4 space-y-2">
            <h4 className="font-semibold text-[var(--color-text-primary)]">{generatedRecipe.title}</h4>
            <p className="text-sm text-[var(--color-text-secondary)]">{generatedRecipe.description}</p>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
            className="w-full h-11 rounded-[var(--radius-md)] bg-[var(--color-secondary)] text-white font-semibold text-sm flex items-center justify-center gap-2">
            ✅ Guardar en mi recetario
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
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = recipes;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q)));
    }
    if (filterTag) result = result.filter((r) => r.tags.includes(filterTag));
    return result;
  }, [recipes, search, filterTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    recipes.forEach((r) => r.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [recipes]);

  const handleToggleFavorite = (id: string, fav: boolean) => { toggleFavorite.mutate({ id, is_favorite: fav }); };

  const openRecipeDetail = useCallback((recipe: Recipe) => {
    const diff = DIFFICULTY_CONFIG[recipe.difficulty];
    openSheet(
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">{recipe.title}</h2>
          {recipe.description && <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{recipe.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {recipe.macros.protein_g && <span className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold"><Flame className="w-3.5 h-3.5" /> {recipe.macros.protein_g}g prot</span>}
          {recipe.macros.calories && <span className="px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-expiry-warn)]/10 text-[var(--color-expiry-warn)] text-xs font-semibold">{recipe.macros.calories} kcal</span>}
          {recipe.prep_time_min && <span className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-xs font-semibold"><Clock className="w-3.5 h-3.5" /> {recipe.prep_time_min} min</span>}
          <span className="px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-text-muted)]/10 text-xs font-semibold">{diff.emoji} {diff.label}</span>
        </div>
        {recipe.ingredients?.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">🧾 Ingredientes</h3>
            <div className="bg-[var(--color-background)] rounded-[var(--radius-md)] p-3 space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-primary)]">{ing.name}</span>
                  <span className="text-[var(--color-text-muted)] text-xs">{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {recipe.steps?.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">👨‍🍳 Preparación</h3>
            <div className="space-y-3">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">{step.order || i + 1}</span>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pt-1">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => { deleteRecipe.mutate(recipe.id); closeSheet(); }}
            className="h-11 px-4 rounded-[var(--radius-md)] border border-[var(--color-expiry-danger)]/20 text-[var(--color-expiry-danger)] text-sm font-medium flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
          <button onClick={() => { handleToggleFavorite(recipe.id, !recipe.is_favorite); closeSheet(); }}
            className="flex-1 h-11 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold text-sm flex items-center justify-center gap-2">
            <Heart className={`w-4 h-4 ${recipe.is_favorite ? "fill-white" : ""}`} /> {recipe.is_favorite ? "Quitar favorito" : "Añadir a favoritos"}
          </button>
        </div>
      </div>
    );
  }, [openSheet, closeSheet, deleteRecipe, handleToggleFavorite]);

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Recetario</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{recipes.length} receta{recipes.length !== 1 ? "s" : ""}</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreate(!showCreate)}
          className="h-10 px-4 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-medium text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Crear
        </motion.button>
      </div>
      <AnimatePresence>{showCreate && <CreateRecipePanel onClose={() => setShowCreate(false)} />}</AnimatePresence>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
        <input type="text" placeholder="Buscar recetas..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-text-muted)]/10 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none" />
      </div>
      {allTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-5 px-5">
          <button onClick={() => setFilterTag(null)} className={`shrink-0 px-3 py-1.5 rounded-[var(--radius-pill)] text-xs font-medium transition-colors ${!filterTag ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-text-muted)]/15"}`}>Todas</button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)} className={`shrink-0 px-3 py-1.5 rounded-[var(--radius-pill)] text-xs font-medium transition-colors ${filterTag === tag ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-text-muted)]/15"}`}>{tag}</button>
          ))}
        </div>
      )}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">{[0,1,2,3].map((i) => <div key={i} className="h-56 skeleton rounded-[var(--radius-lg)]" />)}</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 space-y-4">
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto"><BookOpen className="w-10 h-10 text-[var(--color-primary)]/60" /></div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">{search ? "Sin resultados" : "Tu recetario está vacío"}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">{search ? "Prueba con otros términos" : "Crea tu primera receta con IA"}</p>
          </div>
          {!search && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)}
              className="h-11 px-6 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold text-sm inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Crear con IA
            </motion.button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((recipe, i) => <RecipeCard key={recipe.id} recipe={recipe} index={i} onToggleFavorite={handleToggleFavorite} onOpen={openRecipeDetail} />)}
        </div>
      )}
    </div>
  );
}
