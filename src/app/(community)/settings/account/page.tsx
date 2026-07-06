/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Key,
  Smartphone,
  LogOut,
  ChevronRight,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  ArrowLeft,
  Loader2,
  Send,
  Clock,
  MapPin,
  Laptop,
  Monitor,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth.store";
import { useI18n } from "@/i18n/LanguageProvider";
import { formatDateOnly, formatRelativeTime } from "@/lib/i18n-date";

type Step = "email" | "reset";

interface SessionData {
  id: string;
  device: string;
  device_type: "desktop" | "mobile" | "tablet";
  browser: string;
  platform: string;
  ip_address: string;
  location: string;
  last_activity: string;
  is_current: boolean;
  created_at: string;
}

export default function AccountSecurityPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { locale } = useI18n();

  // ── États ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(user?.email || "");
  const [code, setCode] = useState("");
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(
    null,
  );

  // ── Récupération de la session en cours ──────────────────────────────
  useEffect(() => {
    fetchCurrentSession();
  }, []);

  const fetchCurrentSession = async () => {
    setIsLoadingSession(true);
    try {
      // const response = await api.get("/auth/session");
      // const data = response.data.data || response.data;
      // setCurrentSession(data);
    } catch (error) {
      console.error("Erreur chargement session:", error);
      // Session par défaut
      setCurrentSession({
        id: "current",
        device: navigator.userAgent || "Appareil inconnu",
        device_type: /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
        browser: getBrowserName(),
        platform: navigator.platform || "Inconnu",
        ip_address: "IP inconnue",
        location: "Localisation inconnue",
        last_activity: new Date().toISOString(),
        is_current: true,
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoadingSession(false);
    }
  };

  // ── Détection du navigateur ──────────────────────────────────────────
  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    if (ua.includes("Opera")) return "Opera";
    return "Navigateur inconnu";
  };

  // ── Étape 1 : Envoyer le code ─────────────────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      await api.post("/auth/forgot-password", { email });
      setStep("reset");
      setResendTimer(60);
      toast.success("Un code de vérification a été envoyé à votre email");

      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erreur lors de l'envoi du code";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Étape 2 : Réinitialiser le mot de passe ──────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (passwords.new !== passwords.confirm) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwords.new.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères");
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (!code || code.length < 6) {
      setErrorMessage("Veuillez saisir le code de vérification reçu par email");
      toast.error("Code de vérification requis");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email,
        code,
        password: passwords.new,
        password_confirmation: passwords.confirm,
      });

      setSuccessMessage("Mot de passe modifié avec succès !");
      toast.success("Mot de passe modifié avec succès !");

      setTimeout(() => {
        setStep("email");
        setPasswords({ new: "", confirm: "" });
        setCode("");
        setSuccessMessage("");
        setEmail(user?.email || "");
      }, 3000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erreur lors de la réinitialisation";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Renvoyer le code ──────────────────────────────────────────────────
  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    try {
      await api.post("/auth/forgot-password", { email });
      setResendTimer(60);
      toast.success("Un nouveau code a été envoyé");

      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error("Erreur lors du renvoi du code");
    }
  };

  // ── Revenir en arrière ─────────────────────────────────────────────────
  const handleBack = () => {
    if (step === "email") {
      router.back();
    } else {
      setStep("email");
      setPasswords({ new: "", confirm: "" });
      setCode("");
      setErrorMessage("");
    }
  };

  // ── Formater la date ──────────────────────────────────────────────────
  const formatDate = (date: string) => {
    try {
      const d = new Date(date);
      const now = new Date();
      const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

      if (diff < 604800) return formatRelativeTime(d, locale);
      return formatDateOnly(d, locale);
    } catch {
      return date;
    }
  };

  // ── Rendu ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-500" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Compte & Sécurité
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {step === "email" && "Gérez la sécurité de votre compte"}
                  {step === "reset" && "Créez un nouveau mot de passe"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield size={16} className="text-green-950" />
              <span className="hidden sm:inline">Compte sécurisé</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle size={18} className="text-red-600" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* ── Carte : Changement de mot de passe ────────────────────── */}
          <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock size={18} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-base sm:text-lg">
                    {step === "email"
                      ? "Changer le mot de passe"
                      : "Nouveau mot de passe"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {step === "email"
                      ? "Un code de vérification sera envoyé à votre email"
                      : "Saisissez le code reçu et choisissez un mot de passe sécurisé"}
                  </p>
                </div>
              </div>

              {step === "email" ? (
                <form onSubmit={handleSendCode}>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className="px-5 py-2.5 bg-green-950 text-white font-semibold text-sm rounded-xl hover:bg-green-900 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Envoyer le code
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Code de vérification
                      </label>
                      <div className="relative">
                        <Key
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="Code à 6 chiffres"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition-all text-sm text-center tracking-[0.3em] font-mono"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs text-gray-400">
                          Code envoyé à {email}
                        </p>
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={resendTimer > 0}
                          className="text-xs font-medium text-green-950 hover:text-green-700 transition-colors disabled:opacity-50"
                        >
                          {resendTimer > 0
                            ? `Renvoyer dans ${resendTimer}s`
                            : "Renvoyer le code"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwords.new}
                          onChange={(e) =>
                            setPasswords({ ...passwords, new: e.target.value })
                          }
                          placeholder="Entrez votre nouveau mot de passe"
                          className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition-all text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        Minimum 8 caractères avec une majuscule, une minuscule
                        et un chiffre
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Confirmer le mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwords.confirm}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              confirm: e.target.value,
                            })
                          }
                          placeholder="Confirmez votre nouveau mot de passe"
                          className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition-all text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={
                          isLoading ||
                          !passwords.new ||
                          !passwords.confirm ||
                          !code
                        }
                        className="px-5 py-2.5 bg-green-950 text-white font-semibold text-sm rounded-xl hover:bg-green-900 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Lock size={16} />
                            Changer le mot de passe
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ── Carte : Session en cours ──────────────────────────────── */}
          <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Monitor size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-base sm:text-lg">
                    Session en cours
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {isLoadingSession
                      ? "Chargement..."
                      : "Détails de votre connexion actuelle"}
                  </p>
                </div>
              </div>

              {isLoadingSession ? (
                <div className="p-4 rounded-xl border border-gray-100 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-48 bg-gray-200 rounded mt-1" />
                    </div>
                  </div>
                </div>
              ) : currentSession ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-xl flex-shrink-0">
                        {currentSession.device_type === "mobile" ? "📱" : "💻"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {currentSession.device}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Monitor size={10} className="shrink-0" />
                            {currentSession.browser || "Navigateur inconnu"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe size={10} className="shrink-0" />
                            {currentSession.ip_address || "IP inconnue"}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={10} className="shrink-0" />
                            {currentSession.location || "Localisation inconnue"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} className="shrink-0" />
                            {formatDate(currentSession.last_activity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap">
                      ✓ Connecté
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-gray-200 text-center text-gray-500">
                  <p className="text-sm">Aucune session active détectée</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Carte : Authentification à deux facteurs ────────────── */}
          <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-base sm:text-lg">
                      Authentification à deux facteurs
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Ajoutez une couche de sécurité supplémentaire à votre
                      compte
                    </p>
                  </div>
                </div>
                <button className="px-5 py-2.5 bg-purple-50 text-purple-700 font-semibold text-sm rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-2 whitespace-nowrap">
                  Configurer
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Carte : Sécurité du compte ───────────────────────────── */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <Shield size={24} className="text-green-950 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Votre compte est sécurisé
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {currentSession
                    ? `✅ Connecté depuis ${formatDate(currentSession.last_activity)}`
                    : "🔐 Aucune session active détectée"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Dernière modification du mot de passe :{" "}
                  {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
