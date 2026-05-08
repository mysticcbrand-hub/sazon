"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Plus,
  Search,
  AlertTriangle,
  Package,
  X,
} from "lucide-react";
import { usePantry } from "@/lib/hooks/use-pantry";
import { useAI } from "@/lib/hooks/use-ai";
import { PANTRY_CATEGORIES } from "@/types/database";
import type { PantryItem, PantryCategory } from "@/types/database";
import { useState, useMemo } from "react";

function ExpiryBadge({ date }: { date: string | null }) {
  if (!date) return null;
  const now = new Date();
  const expiry = new Date(date);
  const days = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) {
    return (
      <span className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-expiry-danger)]/10 text-[var(--color-expiry-danger)] text-[10px] font-semibold">
        Caducado
      </span>
    );
  }
  if (days <= 2) {
    return (
      <span className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-expiry-danger)]/10 text-[var(--color-expiry-danger)] text-[10px] font-semibold">
        {days}d
      </span>
    );
  }
  if (days <= 5) {
    return (
      <span className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-expiry-warn)]/10 text-[var(--color-expiry-warn)] text-[10px] font-semibold">
        {days}d
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-expiry-ok)]/10 text-[var(--color-expiry-ok)] text-[10px] font-semibold">
      {days}d
    </span>
  );
}

function PantryItemRow({
  item,
  index,
  onDelete,
}: {
  item: PantryItem;
  index: number;
  onDelete: (id: string) => void;
}) {
  const cat = PANTRY_CATEGORIES[item.category];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 py-3 px-1 border-b border-[var(--color-text-muted)]/8 last:border-0"
    >
      <span className="text-xl w-8 text-center shrink-0">{cat.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {item.name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {item.quantity} {item.unit}
        </p>
      </div>
      <ExpiryBadge date={item.expiry_date} />
      <button
        onClick={() => onDelete(item.id)}
        className="tap-target text-[var(--color-text-muted)] hover:text-[var(--color-expiry-danger)] transition-colors"
        aria-label={`Eliminar ${item.name}`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function AddItemForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (item: Partial<PantryItem>) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PantryCategory>("other");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("unidades");
  const [expiryDate, setExpiryDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      category,
      quantity: parseFloat(quantity) || 1,
      unit,
      expiry_date: expiryDate || null,
    });
    onClose();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onSubmit={handleSubmit}
      className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-4 space-y-3 border border-[var(--color-text-muted)]/10 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--color-text-primary)]">
          Añadir ingrediente
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="tap-target text-[var(--color-text-muted)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Nombre del ingrediente"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="w-full h-11 px-3 rounded-[var(--radius-md)] bg-[var(--color-background)] border border-[var(--color-text-muted)]/15 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
      />

      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PantryCategory)}
          className="flex-1 h-11 px-3 rounded-[var(--radius-md)] bg-[var(--color-background)] border border-[var(--color-text-muted)]/15 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          {Object.entries(PANTRY_CATEGORIES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.emoji} {val.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0"
          step="0.5"
          className="w-20 h-11 px-3 rounded-[var(--radius-md)] bg-[var(--color-background)] border border-[var(--color-text-muted)]/15 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="flex-1 h-11 px-3 rounded-[var(--radius-md)] bg-[var(--color-background)] border border-[var(--color-text-muted)]/15 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option value="unidades">Unidades</option>
          <option value="g">Gramos</option>
          <option value="kg">Kilos</option>
          <option value="ml">Mililitros</option>
          <option value="l">Litros</option>
          <option value="bolsa">Bolsa</option>
          <option value="paquete">Paquete</option>
          <option value="lata">Lata</option>
          <option value="bote">Bote</option>
        </select>
      </div>

      <input
        type="date"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        className="w-full h-11 px-3 rounded-[var(--radius-md)] bg-[var(--color-background)] border border-[var(--color-text-muted)]/15 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
        placeholder="Fecha de caducidad"
      />

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={!name.trim()}
        className="w-full h-11 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold text-sm disabled:opacity-50"
      >
        Añadir a la despensa
      </motion.button>
    </motion.form>
  );
}

export function PantryView() {
  const { items, isLoading, addItem, deleteItem } = usePantry();
  const { callAI, loading: aiLoading } = useAI();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [scanMode, setScanMode] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        PANTRY_CATEGORIES[i.category].label.toLowerCase().includes(q)
    );
  }, [items, search]);

  const grouped = useMemo(() => {
    const groups: Record<PantryCategory, PantryItem[]> = {} as any;
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered]);

  const expiringCount = items.filter((i) => {
    if (!i.expiry_date) return false;
    const days = Math.ceil(
      (new Date(i.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days <= 2 && days >= 0;
  }).length;

  const handleAdd = (item: Partial<PantryItem>) => {
    addItem.mutate(item);
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Despensa
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {items.length} ingredientes
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setScanMode(true)}
            className="h-10 px-4 rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium text-sm flex items-center gap-2"
          >
            <Camera className="w-4 h-4" /> Escanear
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(!showAdd)}
            className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Expiry alert */}
      {expiringCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-expiry-warn)]/10 border border-[var(--color-expiry-warn)]/20"
        >
          <AlertTriangle className="w-5 h-5 text-[var(--color-expiry-warn)] shrink-0" />
          <p className="text-sm text-[var(--color-text-primary)]">
            <strong>{expiringCount}</strong> ingrediente{expiringCount > 1 ? "s" : ""} caduca
            {expiringCount > 1 ? "n" : ""} pronto — la IA los prioriza hoy
          </p>
        </motion.div>
      )}

      {/* Add item form */}
      <AnimatePresence>
        {showAdd && (
          <AddItemForm
            onClose={() => setShowAdd(false)}
            onSubmit={handleAdd}
          />
        )}
      </AnimatePresence>

      {/* Scan mode overlay */}
      <AnimatePresence>
        {scanMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 border border-[var(--color-text-muted)]/10 shadow-[var(--shadow-card)] text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              Escanear nevera con IA
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Haz una foto de tu nevera o despensa y la IA identificará los ingredientes automáticamente.
            </p>
            <div className="flex gap-2">
              <label className="flex-1 h-11 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer">
                <Camera className="w-4 h-4" /> Tomar foto
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // In production, upload to Supabase Storage + call AI
                    setScanMode(false);
                  }}
                />
              </label>
              <button
                onClick={() => setScanMode(false)}
                className="h-11 px-4 rounded-[var(--radius-md)] border border-[var(--color-text-muted)]/20 text-sm text-[var(--color-text-secondary)] font-medium"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Buscar en tu despensa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-text-muted)]/10 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
        />
      </div>

      {/* Category groups */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 space-y-4"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-[var(--color-primary)]/60" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              Tu despensa está vacía
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Empieza escaneando tu nevera o añadiendo ingredientes
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setScanMode(true)}
            className="h-11 px-6 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold text-sm inline-flex items-center gap-2"
          >
            <Camera className="w-4 h-4" /> Escanear nevera
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([cat, catItems]) => {
            const catMeta = PANTRY_CATEGORIES[cat as PantryCategory];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{catMeta.emoji}</span>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {catMeta.label}
                  </h3>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    ({catItems.length})
                  </span>
                </div>
                <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-3 border border-[var(--color-text-muted)]/8">
                  <AnimatePresence>
                    {catItems.map((item, i) => (
                      <PantryItemRow
                        key={item.id}
                        item={item}
                        index={i}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
