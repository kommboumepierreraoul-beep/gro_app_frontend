"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await authService.forgotPassword(email);
      setSuccess(res.message);
      setTimeout(
        () => router.push(`/reset-password?email=${encodeURIComponent(email)}`),
        2000,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── IMAGE DE FOND ── */}
      <img
        src="/images/cover-log.jpg"
        alt="Agriculture"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay vert semi-transparent */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(4,120,87,0.55) 0%, rgba(6,78,59,0.45) 100%)",
        }}
      />

      {/* ── BOUTON RETOUR (haut gauche) ── */}
      <Link
        href="/login"
        className="absolute top-6 left-6 z-20 flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-105"
        style={{
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </Link>

      {/* ── CARTE ── */}
      <div
        className="relative z-10 w-full max-w-md mx-5 rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow:
            "0 24px 64px rgba(0,60,40,0.22), 0 4px 16px rgba(0,60,40,0.10)",
        }}
      >
        {!success ? (
          <>
            {/* Icône */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                  boxShadow: "0 4px 16px rgba(5,150,105,0.18)",
                }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "#059669" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
            </div>

            {/* Titre */}
            <div className="text-center mb-7">
              <h2 className="text-2xl font-bold" style={{ color: "#042f20" }}>
                Mot de passe oublié ?
              </h2>
              <p
                className="text-sm mt-2 leading-relaxed"
                style={{ color: "#5a8a72" }}
              >
                Entrez votre adresse e-mail pour recevoir les instructions de
                réinitialisation.
              </p>
            </div>

            {success && (
              <div className="mb-4">
                <Alert type="success" message={success} />
              </div>
            )}
            {error && (
              <div className="mb-4">
                <Alert type="error" message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Adresse email"
                type="email"
                placeholder="user@agripulse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="rounded-xl"
                style={{
                  background: "#f0fdf8",
                  border: error ? "1.5px solid #dc2626" : "1.5px solid #c6ead8",
                }}
              />

              <Button
                type="submit"
                isLoading={isLoading}
                fullWidth
                disabled={!email}
                className="w-full py-4 rounded-xl text-[15px] font-bold"
                style={{
                  background:
                    email && !isLoading
                      ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                      : "#a7c5b8",
                  boxShadow:
                    email && !isLoading
                      ? "0 4px 20px rgba(5,150,105,0.30)"
                      : "none",
                }}
              >
                {isLoading ? "Envoi en cours…" : "Envoyer le code"}
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: "#8ab89e" }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la connexion
              </Link>
            </form>
          </>
        ) : (
          /* ── ÉTAT : EMAIL ENVOYÉ ── */
          <div className="text-center py-4">
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                  boxShadow: "0 4px 16px rgba(5,150,105,0.2)",
                }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "#059669" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "#042f20" }}
            >
              Email envoyé !
            </h2>
            <p
              className="text-sm leading-relaxed mb-2"
              style={{ color: "#5a8a72" }}
            >
              Un code de réinitialisation a été envoyé à
            </p>
            <p
              className="text-sm font-semibold mb-8"
              style={{ color: "#059669" }}
            >
              {email}
            </p>
            <p className="text-sm mb-6" style={{ color: "#8ab89e" }}>
              Vérifiez votre boîte mail et vos spams.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                boxShadow: "0 4px 16px rgba(5,150,105,0.25)",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
