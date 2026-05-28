"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(form);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-2xl mb-4 shadow-lg shadow-emerald-200">
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Créer un compte
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Rejoignez-nous en quelques secondes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Prénom"
                placeholder="Jean"
                value={form.firstname}
                onChange={set("firstname")}
                required
              />
              <Input
                label="Nom"
                placeholder="Dupont"
                value={form.lastname}
                onChange={set("lastname")}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={set("email")}
              required
            />
            <Input
              label="Téléphone (optionnel)"
              type="tel"
              placeholder="+237600000000"
              value={form.phone}
              onChange={set("phone")}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="Min. 8 caractères"
              value={form.password}
              onChange={set("password")}
              required
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              value={form.password_confirmation}
              onChange={set("password_confirmation")}
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              className="bg-emerald-500 hover:bg-emerald-600 mt-2"
            >
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
