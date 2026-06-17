"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function AccountSecurityPage() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (passwords.new !== passwords.confirm) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwords.new.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsSubmitting(true);

    // Simuler l'appel API
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage("Mot de passe modifié avec succès !");
      setShowPasswordForm(false);
      setPasswords({ current: "", new: "", confirm: "" });

      // Cacher le message après 3 secondes
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1000);
  };

  const activeSessions = [
    {
      device: "Chrome sur Windows",
      location: "Paris, France",
      lastActive: "Actif maintenant",
      current: true,
    },
    {
      device: "Safari sur iPhone",
      location: "Lyon, France",
      lastActive: "Il y a 2 heures",
      current: false,
    },
    {
      device: "Firefox sur MacBook",
      location: "Marseille, France",
      lastActive: "Il y a 3 jours",
      current: false,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#154212]/10 flex items-center justify-center">
            <Shield size={20} className="text-[#154212]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#191c18]">
              Compte & Sécurité
            </h1>
            <p className="text-xs sm:text-sm text-[#72796e] mt-0.5">
              Gérez la sécurité de votre compte
            </p>
          </div>
        </div>
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="mb-6 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" />
          <p className="text-xs sm:text-sm text-emerald-700">
            {successMessage}
          </p>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Section: Changer le mot de passe */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#c2c9bb]/20 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock size={18} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#191c18] text-base sm:text-lg">
                    Changer le mot de passe
                  </h2>
                  <p className="text-xs sm:text-sm text-[#72796e] mt-0.5">
                    Modifiez votre mot de passe régulièrement pour plus de
                    sécurité
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-xs sm:text-sm font-semibold text-[#154212] hover:text-[#2d5a27] transition-colors flex items-center gap-1"
              >
                {showPasswordForm ? "Annuler" : "Modifier"}
                <ChevronRight
                  size={14}
                  className={`transition-transform ${showPasswordForm ? "rotate-90" : ""}`}
                />
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#72796e] mb-1.5">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="current"
                      placeholder="Entrez votre mot de passe actuel"
                      value={passwords.current}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 pr-10 border border-[#c2c9bb]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition-all text-sm"
                      required={showPasswordForm}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#72796e] hover:text-[#154212]"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#72796e] mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="new"
                      placeholder="Entrez votre nouveau mot de passe"
                      value={passwords.new}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 pr-10 border border-[#c2c9bb]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition-all text-sm"
                      required={showPasswordForm}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#72796e] hover:text-[#154212]"
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#72796e] mt-1.5">
                    Minimum 6 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#72796e] mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm"
                      placeholder="Confirmez votre nouveau mot de passe"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 pr-10 border border-[#c2c9bb]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition-all text-sm"
                      required={showPasswordForm}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#72796e] hover:text-[#154212]"
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
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-[#154212] text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-[#2d5a27] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Key size={14} />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Section: Connexions actives */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#c2c9bb]/20 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[#191c18] text-base sm:text-lg">
                  Connexions actives
                </h2>
                <p className="text-xs sm:text-sm text-[#72796e] mt-0.5">
                  Gérez vos sessions actives sur tous les appareils
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {activeSessions.map((session, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                    session.current
                      ? "bg-emerald-50 border border-emerald-200"
                      : "hover:bg-[#f3f4ed]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      {session.device.includes("Chrome") && "🌐"}
                      {session.device.includes("Safari") && "🌍"}
                      {session.device.includes("Firefox") && "🦊"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#191c18]">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 text-[10px] font-normal text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            En cours
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#72796e] mt-0.5">
                        {session.location} · {session.lastActive}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#c2c9bb]/20">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-semibold text-xs sm:text-sm rounded-xl hover:bg-red-100 transition-colors">
                <LogOut size={14} />
                Déconnecter tous les appareils
              </button>
              <p className="text-xs text-[#72796e] text-center mt-3">
                Cette action vous déconnectera de tous vos appareils sauf
                celui-ci
              </p>
            </div>
          </div>
        </div>

        {/* Section: Sécurité supplémentaire */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#c2c9bb]/20 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-[#191c18] text-base sm:text-lg">
                  Authentification à deux facteurs
                </h2>
                <p className="text-xs sm:text-sm text-[#72796e] mt-0.5 mb-3">
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </p>
                <button className="text-xs sm:text-sm font-semibold text-[#154212] hover:text-[#2d5a27] transition-colors flex items-center gap-1">
                  Configurer
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
