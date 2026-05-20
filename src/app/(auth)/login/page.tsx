"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            <Input
              label="Adresse email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <div className="flex justify-end">
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

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
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
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition"
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
