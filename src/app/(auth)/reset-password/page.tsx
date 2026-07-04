"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpIput";
import { Alert } from "@/components/ui/Alert";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [form, setForm] = useState({
    email: emailFromUrl,
    password: "",
    password_confirmation: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isTouched, setIsTouched] = useState({
    password: false,
    password_confirmation: false,
  });

  // ── Vérification de la force du mot de passe ──────────────────────
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    setPasswordStrength(strength);
  };

  // ── Vérification des champs ──────────────────────────────────────
  const passwordsMatch =
    form.password === form.password_confirmation && form.password !== "";
  const isPasswordValid = form.password.length >= 8;
  const isFormValid =
    isPasswordValid && passwordsMatch && otp.join("").length === 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return toast.error("Entrez les 6 chiffres du code.");

    if (!isPasswordValid) {
      return toast.error(
        "Le mot de passe doit contenir au moins 8 caractères.",
      );
    }

    if (!passwordsMatch) {
      return toast.error("Les mots de passe ne correspondent pas.");
    }

    setIsLoading(true);
    setError("");
    try {
      await authService.resetPassword({ ...form, code });
      toast.success("Mot de passe réinitialisé ! Connectez-vous.");
      router.push("/login");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la réinitialisation",
      );
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
        href="/forgot-password"
        className="absolute top-6 left-6 z-20 flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-105"
        style={{
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </Link>

      {/* ── CARTE ── */}
      <div
        className="relative z-10 w-full max-w-[420px] mx-5 rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow:
            "0 24px 64px rgba(0,60,40,0.22), 0 4px 16px rgba(0,60,40,0.10)",
        }}
      >
        {/* Stepper visuel */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shadow"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            }}
          >
            1
          </div>
          <div className="w-12 h-0.5" style={{ background: "#d1fae5" }} />
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shadow"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            }}
          >
            2
          </div>
          <div className="w-12 h-0.5" style={{ background: "#d1fae5" }} />
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shadow"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            }}
          >
            3
          </div>
        </div>

        {/* Icône */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
              boxShadow: "0 4px 16px rgba(5,150,105,0.18)",
            }}
          >
            <Lock
              className="w-8 h-8"
              style={{ color: "#059669" }}
              strokeWidth={1.8}
            />
          </div>
        </div>

        {/* Titre */}
        <div className="text-center mb-6">
          <h2 className="text-[22px] font-bold" style={{ color: "#042f20" }}>
            Nouveau mot de passe
          </h2>
          <p
            className="text-[14px] mt-1 leading-relaxed"
            style={{ color: "#5a8a72" }}
          >
            Entrez le code reçu et votre nouveau mot de passe
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email - READONLY */}
          <div className="space-y-1.5">
            <label
              className="block text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: "#3d7a5e" }}
            >
              Adresse email
            </label>
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                style={{ color: "#7ab89a" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="agriculteur@agripulse.com"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-[14px] transition-all outline-none cursor-not-allowed"
                style={{
                  background: "#e8f5ef",
                  border: "1.5px solid #c6ead8",
                  color: "#5a8a72",
                  opacity: 0.8,
                }}
                required
                readOnly
              />
            </div>
          </div>

          {/* Code OTP */}
          <div>
            <label
              className="block text-[12px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#3d7a5e" }}
            >
              Code de vérification
            </label>
            <div className="flex justify-center">
              <OtpInput value={otp} onChange={setOtp} />
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div className="space-y-1.5">
            <label
              className="block text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: "#3d7a5e" }}
            >
              Nouveau mot de passe
            </label>
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                style={{ color: "#7ab89a" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  checkPasswordStrength(e.target.value);
                  setIsTouched({ ...isTouched, password: true });
                }}
                placeholder="Min. 8 caractères"
                className="w-full pl-10 pr-12 py-3.5 rounded-xl text-[14px] transition-all outline-none"
                style={{
                  background: "#f0fdf8",
                  border:
                    form.password && !isPasswordValid && isTouched.password
                      ? "1.5px solid #dc2626"
                      : form.password && isPasswordValid
                        ? "1.5px solid #059669"
                        : "1.5px solid #c6ead8",
                  color: "#042f20",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#059669";
                  e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.12)";
                }}
                onBlur={(e) => {
                  if (
                    !(form.password && !isPasswordValid && isTouched.password)
                  ) {
                    e.target.style.borderColor = "#c6ead8";
                  }
                  e.target.style.boxShadow = "none";
                }}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                style={{ color: "#7ab89a" }}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Indicateur de force du mot de passe */}
            {form.password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 h-1.5">
                  <div
                    className={`flex-1 rounded-full transition-all ${
                      passwordStrength >= 1 ? "bg-red-500" : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full transition-all ${
                      passwordStrength >= 2 ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full transition-all ${
                      passwordStrength >= 3 ? "bg-yellow-500" : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full transition-all ${
                      passwordStrength >= 4 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs" style={{ color: "#8ab89e" }}>
                    {passwordStrength === 0 && "Très faible"}
                    {passwordStrength === 1 && "Faible"}
                    {passwordStrength === 2 && "Moyen"}
                    {passwordStrength === 3 && "Fort"}
                    {passwordStrength === 4 && "Très fort ✓"}
                  </p>
                  {isTouched.password && form.password && (
                    <span
                      className="text-xs"
                      style={{ color: isPasswordValid ? "#059669" : "#dc2626" }}
                    >
                      {isPasswordValid ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Valide
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          {8 - form.password.length} caractères restants
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div className="space-y-1.5">
            <label
              className="block text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: "#3d7a5e" }}
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                style={{ color: "#7ab89a" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.password_confirmation}
                onChange={(e) => {
                  setForm({ ...form, password_confirmation: e.target.value });
                  setIsTouched({ ...isTouched, password_confirmation: true });
                }}
                placeholder="Confirmez votre mot de passe"
                className="w-full pl-10 pr-12 py-3.5 rounded-xl text-[14px] transition-all outline-none"
                style={{
                  background: "#f0fdf8",
                  border:
                    form.password_confirmation &&
                    !passwordsMatch &&
                    isTouched.password_confirmation
                      ? "1.5px solid #dc2626"
                      : form.password_confirmation && passwordsMatch
                        ? "1.5px solid #059669"
                        : "1.5px solid #c6ead8",
                  color: "#042f20",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#059669";
                  e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.12)";
                }}
                onBlur={(e) => {
                  if (
                    !(
                      form.password_confirmation &&
                      !passwordsMatch &&
                      isTouched.password_confirmation
                    )
                  ) {
                    e.target.style.borderColor = "#c6ead8";
                  }
                  e.target.style.boxShadow = "none";
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                style={{ color: "#7ab89a" }}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Message de confirmation */}
            {isTouched.password_confirmation && form.password_confirmation && (
              <div className="mt-1">
                {passwordsMatch ? (
                  <p
                    className="text-xs flex items-center gap-1"
                    style={{ color: "#059669" }}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Les mots de passe correspondent
                  </p>
                ) : (
                  <p
                    className="text-xs flex items-center gap-1"
                    style={{ color: "#dc2626" }}
                  >
                    <XCircle className="w-3 h-3" />
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bouton de réinitialisation */}
          <Button
            type="submit"
            isLoading={isLoading}
            fullWidth
            disabled={!isFormValid}
            className="w-full py-4 rounded-xl text-[15px] font-bold"
            style={{
              background:
                isFormValid && !isLoading
                  ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                  : "#a7c5b8",
              boxShadow:
                isFormValid && !isLoading
                  ? "0 4px 20px rgba(5,150,105,0.30)"
                  : "none",
            }}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Réinitialisation en cours...
              </>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </Button>

          {/* Lien retour */}
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid #e5f0ea" }}>
            <Link
              href="/forgot-password"
              className="flex items-center justify-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-70"
              style={{ color: "#8ab89e" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Renvoyer un nouveau code
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center relative">
          <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
