"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ChefHat, Mail, ArrowRight, Sparkles, Loader2 } from "lucide-react";

/* Login page — minimal, warm, organic accent */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (authError) setError("No pudimos enviar el enlace. Inténtalo de nuevo.");
    else setSent(true);
  };

  return (
    <div
      className="flex flex-col justify-center"
      style={{ minHeight: "100dvh", padding: "0 var(--space-6)", background: "var(--color-bg-primary)" }}
    >
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", top: -120, right: -120, width: 380, height: 380, borderRadius: "50%", background: "var(--color-accent)", opacity: 0.06, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: -160, left: -160, width: 420, height: 420, borderRadius: "50%", background: "var(--color-accent-warm)", opacity: 0.04, filter: "blur(80px)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", width: "100%", maxWidth: 360, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
          style={{ marginBottom: "var(--space-8)", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <div style={{ width: 72, height: 72, borderRadius: "var(--radius-xl)", background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-fab)", marginBottom: "var(--space-5)" }}>
            <ChefHat style={{ width: 36, height: 36, color: "white" }} strokeWidth={1.5} />
          </div>
          <h1 className="text-display" style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.05em", color: "var(--color-text-primary)" }}>SAZÓN</h1>
          <p style={{ marginTop: "var(--space-2)", fontSize: 15, color: "var(--color-text-secondary)", textAlign: "center", maxWidth: 260, lineHeight: 1.5 }}>
            Tu chef familiar con inteligencia artificial
          </p>
        </motion.div>

        {!sent ? (
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            onSubmit={handleLogin}
            style={{ width: "100%", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
          >
            {/* Email input */}
            <div style={{ position: "relative" }}>
              <Mail style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "var(--color-text-tertiary)" }} />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" autoComplete="email" required
                style={{
                  width: "100%", height: 54, paddingLeft: 44, paddingRight: 16,
                  borderRadius: "var(--radius-lg)", background: "var(--color-bg-secondary)",
                  border: "0.5px solid var(--color-separator)", fontSize: 17,
                  color: "var(--color-text-primary)", outline: "none",
                }}
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: 13, color: "var(--color-accent-warm)", padding: "0 var(--space-1)" }}>
                {error}
              </motion.p>
            )}

            {/* Submit button — primary action */}
            <motion.button
              type="submit" disabled={loading || !email.trim()} whileTap={{ scale: 0.97 }}
              className={loading ? "btn-loading" : ""}
              style={{
                width: "100%", height: 54, borderRadius: "var(--radius-md)", border: "none", cursor: "pointer",
                background: loading ? undefined : "var(--color-accent)", color: "white",
                fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: !email.trim() && !loading ? 0.45 : 1, transition: "opacity 150ms",
                boxShadow: "var(--shadow-fab)",
              }}
            >
              {loading ? (
                <Loader2 style={{ width: 20, height: 20 }} className="animate-spin" />
              ) : (
                <>Enviar enlace mágico <ArrowRight style={{ width: 18, height: 18 }} /></>
              )}
            </motion.button>

            <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: 1.5, marginTop: "var(--space-1)" }}>
              Sin contraseñas. Te enviamos un enlace seguro a tu email.
            </p>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            style={{ width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}
          >
            <div style={{ width: 56, height: 56, borderRadius: "var(--radius-full)", background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ width: 28, height: 28, color: "var(--color-accent)" }} />
            </div>
            <div>
              <h2 className="text-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}>¡Enlace enviado!</h2>
              <p style={{ marginTop: "var(--space-2)", fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                Revisa tu bandeja en <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong> y haz clic en el enlace mágico.
              </p>
            </div>
            <button onClick={() => { setSent(false); setEmail(""); }}
              style={{ fontSize: 15, fontWeight: 500, color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer" }}>
              Usar otro email
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ position: "fixed", bottom: "var(--space-8)", left: 0, right: 0, textAlign: "center", fontSize: 12, color: "var(--color-text-tertiary)" }}
      >
        Hecho con 🧡 para familias que aman comer bien
      </motion.p>
    </div>
  );
}
