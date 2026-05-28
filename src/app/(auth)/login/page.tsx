"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ── Restaurer l'email mémorisé au montage ─────────────────────────────────
  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    if (savedEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rememberMe) {
      localStorage.setItem("remember_email", form.email);
    } else {
      localStorage.removeItem("remember_email");
    }

    await login(form);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
            <p className="text-gray-500 text-sm mt-1">
              Bienvenue, connectez-vous à votre compte
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              label="Adresse email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />

            {/* Mot de passe + toggle visibilité */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={
                    showPwd
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPwd ? (
                    /* Icône œil barré — mot de passe visible */
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    /* Icône œil — mot de passe masqué */
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Se souvenir de moi + Mot de passe oublié */}
            <div className="flex items-center justify-between">
              {/* Checkbox Se souvenir de moi */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  {/* Checkbox custom */}
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      rememberMe
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300 bg-white group-hover:border-blue-400"
                    }`}
                  >
                    {rememberMe && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 group-hover:text-gray-800 transition select-none">
                  Se souvenir de moi
                </span>
              </label>

              {/* Lien mot de passe oublié */}
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" isLoading={isLoading} fullWidth>
              Se connecter
            </Button>
          </form>

          {/* Séparateur + Google */}
          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">ou</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = "http://localhost:8000/api/auth/google";
              }}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition text-sm text-gray-700 font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.9-6.9C35.9 2.34 30.45 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.03 6.23C12.6 13.16 17.85 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.14-3.08-.4-4.55H24v9.1h12.8c-.55 2.95-2.24 5.46-4.78 7.17l7.36 5.73c4.3-3.97 6.6-9.83 6.6-17.45z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.6 28.45A14.5 14.5 0 019.5 24c0-1.57.27-3.09.74-4.5L2.2 13.22A23.9 23.9 0 000 24c0 3.84.9 7.5 2.56 10.78l8.04-6.33z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.14 15.9-5.84l-7.36-5.73c-2.05 1.38-4.66 2.2-8.54 2.2-6.15 0-11.4-3.66-13.8-8.9l-8.03 6.23C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Continuer avec Google
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
