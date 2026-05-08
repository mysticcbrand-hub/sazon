"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ChefHat, Mail, ArrowRight, Sparkles } from "lucide-react";

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
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError("No pudimos enviar el enlace. Inténtalo de nuevo.");
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-6 bg-[var(--color-background)]">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--color-primary)] opacity-[0.07] blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-[var(--color-secondary)] opacity-[0.05] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm mx-auto flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-lg mb-5">
            <ChefHat className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
            SAZÓN
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-secondary)] text-center max-w-[260px] leading-relaxed">
            Tu chef familiar con inteligencia artificial
          </p>
        </motion.div>

        {!sent ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleLogin}
            className="w-full space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                required
                className="w-full h-14 pl-12 pr-4 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border-2 border-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200 shadow-sm text-base"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-[var(--color-expiry-danger)] px-1"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading || !email.trim()}
              whileTap={{ scale: 0.97 }}
              className="w-full h-14 rounded-[var(--radius-lg)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Enviar enlace mágico
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <p className="text-center text-xs text-[var(--color-text-muted)] mt-4 leading-relaxed">
              Sin contraseñas. Te enviamos un enlace seguro a tu email para acceder.
            </p>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-full text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--color-secondary)]/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-[var(--color-secondary)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                ¡Enlace enviado!
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Revisa tu bandeja de entrada en{" "}
                <span className="font-medium text-[var(--color-text-primary)]">{email}</span>
                {" "}y haz clic en el enlace mágico para entrar.
              </p>
            </div>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-sm text-[var(--color-primary)] font-medium hover:underline"
            >
              Usar otro email
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="fixed bottom-8 left-0 right-0 text-center text-xs text-[var(--color-text-muted)]"
      >
        Hecho con 🧡 para familias que aman comer bien
      </motion.p>
    </div>
  );
}
