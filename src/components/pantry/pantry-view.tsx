"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus, Search, AlertTriangle, Package, X } from "lucide-react";
import { usePantry } from "@/lib/hooks/use-pantry";
import { useAI } from "@/lib/hooks/use-ai";
import { PANTRY_CATEGORIES } from "@/types/database";
import type { PantryItem, PantryCategory } from "@/types/database";
import { useState, useMemo } from "react";

/* Pantry view — grid layout with expiry urgency, design system tokens */

function ExpiryBadge({ date }: { date: string | null }) {
  if (!date) return null;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  const [bg, color, text] = days < 0
    ? ["var(--color-accent-warm-light)", "var(--color-accent-warm)", "Caducado"]
    : days <= 2
      ? ["var(--color-accent-warm-light)", "var(--color-accent-warm)", `${days}d`]
      : days <= 5
        ? ["rgba(245,158,11,0.1)", "#F59E0B", `${days}d`]
        : ["var(--color-accent-light)", "var(--color-accent)", `${days}d`];
  return (
    <span style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", background: bg, color, fontSize: 11, fontWeight: 600 }}>{text}</span>
  );
}

function PantryItemRow({ item, index, onDelete }: { item: PantryItem; index: number; onDelete: (id: string) => void }) {
  const cat = PANTRY_CATEGORIES[item.category];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.03 }}
      style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-1)", borderBottom: "0.5px solid var(--color-separator)" }}
    >
      <span style={{ fontSize: 22, width: 32, textAlign: "center", flexShrink: 0 }}>{cat.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
        <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{item.quantity} {item.unit}</p>
      </div>
      <ExpiryBadge date={item.expiry_date} />
      <button onClick={() => onDelete(item.id)} className="tap-target" style={{ color: "var(--color-text-tertiary)", background: "none", border: "none", cursor: "pointer", transition: "color 150ms" }}>
        <X style={{ width: 16, height: 16 }} />
      </button>
    </motion.div>
  );
}

function AddItemForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (item: Partial<PantryItem>) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PantryCategory>("other");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("unidades");
  const [expiryDate, setExpiryDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), category, quantity: parseFloat(quantity) || 1, unit, expiry_date: expiryDate || null });
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    height: 44, padding: "0 var(--space-3)", borderRadius: "var(--radius-md)",
    background: "var(--color-bg-secondary)", border: "0.5px solid var(--color-separator)",
    fontSize: 15, color: "var(--color-text-primary)", outline: "none", width: "100%",
  };

  return (
    <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      onSubmit={handleSubmit} className="glass-card"
      style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)" }}>Añadir ingrediente</h3>
        <button type="button" onClick={onClose} className="tap-target" style={{ color: "var(--color-text-tertiary)", background: "none", border: "none", cursor: "pointer" }}><X style={{ width: 20, height: 20 }} /></button>
      </div>
      <input type="text" placeholder="Nombre del ingrediente" value={name} onChange={e => setName(e.target.value)} autoFocus style={inputStyle} />
      <select value={category} onChange={e => setCategory(e.target.value as PantryCategory)} style={inputStyle}>
        {Object.entries(PANTRY_CATEGORIES).map(([key, val]) => <option key={key} value={key}>{val.emoji} {val.label}</option>)}
      </select>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="0" step="0.5" style={{ ...inputStyle, width: 80 }} />
        <select value={unit} onChange={e => setUnit(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
          {["unidades","g","kg","ml","l","bolsa","paquete","lata","bote"].map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} style={inputStyle} />
      <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={!name.trim()}
        style={{ width: "100%", height: 54, borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", background: "var(--color-accent)", color: "white", fontSize: 17, fontWeight: 600, opacity: name.trim() ? 1 : 0.45 }}>
        Añadir a la despensa
      </motion.button>
    </motion.form>
  );
}

export function PantryView() {
  const { items, isLoading, addItem, deleteItem } = usePantry();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [scanMode, setScanMode] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q) || PANTRY_CATEGORIES[i.category].label.toLowerCase().includes(q));
  }, [items, search]);

  const grouped = useMemo(() => {
    const g: Record<PantryCategory, PantryItem[]> = {} as any;
    for (const item of filtered) { if (!g[item.category]) g[item.category] = []; g[item.category].push(item); }
    return g;
  }, [filtered]);

  const expiringCount = items.filter(i => {
    if (!i.expiry_date) return false;
    const days = Math.ceil((new Date(i.expiry_date).getTime() - Date.now()) / 86400000);
    return days <= 2 && days >= 0;
  }).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="text-display" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--color-text-primary)" }}>Despensa</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{items.length} ingrediente{items.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScanMode(true)}
            style={{ height: 36, padding: "0 14px", borderRadius: "var(--radius-md)", background: "var(--color-accent-light)", color: "var(--color-accent)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <Camera style={{ width: 16, height: 16 }} /> Escanear
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(!showAdd)}
            style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--color-accent)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus style={{ width: 18, height: 18 }} />
          </motion.button>
        </div>
      </div>

      {/* Expiry alert */}
      {expiringCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-accent-warm-light)", border: "0.5px solid var(--color-accent-warm)" }}>
          <AlertTriangle style={{ width: 18, height: 18, color: "var(--color-accent-warm)", flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "var(--color-text-primary)" }}>
            <strong>{expiringCount}</strong> ingrediente{expiringCount > 1 ? "s" : ""} caduca{expiringCount > 1 ? "n" : ""} pronto — la IA los prioriza
          </p>
        </motion.div>
      )}

      {/* Add/Scan forms */}
      <AnimatePresence>{showAdd && <AddItemForm onClose={() => setShowAdd(false)} onSubmit={(item) => addItem.mutate(item)} />}</AnimatePresence>
      <AnimatePresence>
        {scanMode && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="glass-card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-5)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "var(--radius-full)", background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera style={{ width: 28, height: 28, color: "var(--color-accent)" }} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)" }}>Escanear nevera con IA</h3>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>Haz una foto y la IA identificará tus ingredientes</p>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", width: "100%" }}>
              <label style={{ flex: 1, height: 44, borderRadius: "var(--radius-md)", background: "var(--color-accent)", color: "white", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
                <Camera style={{ width: 16, height: 16 }} /> Tomar foto
                <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={() => setScanMode(false)} />
              </label>
              <button onClick={() => setScanMode(false)}
                style={{ height: 44, padding: "0 16px", borderRadius: "var(--radius-md)", border: "0.5px solid var(--color-separator)", background: "transparent", color: "var(--color-text-secondary)", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--color-text-tertiary)" }} />
        <input type="text" placeholder="Buscar en tu despensa..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 16, borderRadius: "var(--radius-md)", background: "var(--color-bg-secondary)", border: "0.5px solid var(--color-separator)", fontSize: 15, color: "var(--color-text-primary)", outline: "none" }} />
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: "var(--radius-lg)" }} />)}
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "var(--space-12) 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.4 }}>
            <rect x="12" y="16" width="40" height="36" rx="4" stroke="var(--color-accent)" strokeWidth="1.5" />
            <path d="M8 16h48M24 16V10h16v6" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="32" y1="28" x2="32" y2="40" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="26" y1="34" x2="38" y2="34" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)" }}>Tu despensa está vacía</h3>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", maxWidth: 260 }}>Escanea tu nevera o añade ingredientes manualmente</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setScanMode(true)}
            style={{ height: 44, padding: "0 24px", borderRadius: "var(--radius-md)", background: "var(--color-accent)", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Camera style={{ width: 16, height: 16 }} /> Escanear nevera
          </motion.button>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {Object.entries(grouped).map(([cat, catItems]) => {
            const catMeta = PANTRY_CATEGORIES[cat as PantryCategory];
            return (
              <div key={cat}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: 18 }}>{catMeta.emoji}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>{catMeta.label}</h3>
                  <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>({catItems.length})</span>
                </div>
                <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-lg)", padding: "0 var(--space-3)" }}>
                  <AnimatePresence>
                    {catItems.map((item, i) => <PantryItemRow key={item.id} item={item} index={i} onDelete={(id) => deleteItem.mutate(id)} />)}
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
