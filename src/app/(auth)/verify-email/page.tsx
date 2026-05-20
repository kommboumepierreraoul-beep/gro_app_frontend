"use client";
import { useState, useEffect } from "react";
import { OtpInput } from "@/components/ui/OtpIput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const { verifyEmail, isLoading, user } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(600); // 10 minutes
  const [resending, setResending] = useState(false);

  // Compte à rebours
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return toast.error("Entrez les 6 chiffres du code.");
    await verifyEmail(code);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerificationCode();
      toast.success("Nouveau code envoyé !");
      setTimer(600);
      setOtp(Array(6).fill(""));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Vérifiez votre email
          </h1>
          <p className="text-gray-500 text-sm mb-2">
            Code envoyé à{" "}
            <span className="font-semibold text-gray-800">
              {user?.email ?? "votre email"}
            </span>
          </p>

          {/* Timer */}
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
              timer > 120
                ? "bg-green-100 text-green-700"
                : timer > 0
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {timer > 0
              ? `⏱ Expire dans ${formatTimer(timer)}`
              : "⚠️ Code expiré"}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <OtpInput value={otp} onChange={setOtp} />

            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              disabled={timer === 0}
            >
              Vérifier mon email
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">
              Vous n&apos;avez pas reçu le code ?
            </p>
            <button
              onClick={handleResend}
              disabled={resending || timer > 540} // throttle 1 min
              className="text-sm text-blue-600 font-semibold hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resending ? "Envoi..." : "Renvoyer le code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
