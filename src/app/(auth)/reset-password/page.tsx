"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return toast.error("Entrez les 6 chiffres du code.");

    setIsLoading(true);
    setError("");
    try {
      await authService.resetPassword({ ...form, code });
      toast.success("Mot de passe réinitialisé ! Connectez-vous.");
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-purple-100/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-2xl mb-4">
              <svg
                className="w-7 h-7 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nouveau mot de passe
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Entrez le code reçu et votre nouveau mot de passe
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Adresse email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Code de vérification
              </label>
              <OtpInput value={otp} onChange={setOtp} />
            </div>

            <Input
              label="Nouveau mot de passe"
              type="password"
              placeholder="Min. 8 caractères"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              className="bg-purple-600 hover:bg-purple-700"
            >
              Réinitialiser le mot de passe
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              ← Renvoyer un nouveau code
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
