"use client";
import { useState, useRef, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

// ── Constantes avatar ────────────────────────────────────────────────────────
const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function RegisterPage() {
  const { register, isLoading } = useAuth();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    avatar: "", // URL base64 envoyée au backend
  });

  // Avatar — état local UI
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const processFile = (file: File) => {
    setAvatarError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError("Format non supporté. Utilisez JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setAvatarError(`Fichier trop lourd. Maximum ${MAX_SIZE_MB} Mo.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAvatarPreview(base64);
      setForm((prev) => ({ ...prev, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarError("");
    setForm((prev) => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const set = (field: string) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(form);
  };

  // ── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-emerald-100/50 p-8">
          {/* Header */}
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
            {/* ── Avatar ──────────────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-3 mb-2">
              {/* Aperçu ou zone de dépôt */}
              {avatarPreview ? (
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-emerald-200 shadow-lg">
                    <Image
                      src={avatarPreview}
                      alt="Aperçu avatar"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Overlay modification au survol */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  {/* Bouton supprimer */}
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition"
                    title="Supprimer la photo"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                // Zone drag & drop
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`
                    w-24 h-24 rounded-full border-2 border-dashed cursor-pointer
                    flex flex-col items-center justify-center transition-all
                    ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-50 scale-105"
                        : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50"
                    }
                  `}
                >
                  <svg
                    className="w-7 h-7 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-xs text-gray-400 mt-1">Photo</span>
                </div>
              )}

              {/* Label + instruction */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Photo de profil{" "}
                  <span className="text-gray-400 font-normal">(optionnel)</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  JPG, PNG, WEBP — max {MAX_SIZE_MB} Mo
                </p>
              </div>

              {/* Bouton choisir (si pas de preview) */}
              {!avatarPreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Choisir une photo
                </button>
              )}

              {/* Erreur avatar */}
              {avatarError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {avatarError}
                </p>
              )}
            </div>

            {/* Input fichier caché */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* ── Champs texte ─────────────────────────────────────────── */}
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
