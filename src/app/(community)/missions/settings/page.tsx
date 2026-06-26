/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Bell,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  Eye,
  Star,
  Settings2,
  Globe,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  Search,
  X,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  BellRing,
  BellOff,
  Shield,
  User,
  Key,
  Globe2,
  MailCheck,
  PhoneCall,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface SettingsData {
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  new_application_notifications: boolean;
  status_change_notifications: boolean;
  reminder_notifications: boolean;
  default_radius: number;
  default_duration: string;
  default_remuneration_type: string;
  show_phone: boolean;
  show_email: boolean;
  auto_accept_applications: boolean;
  profile_visibility: "public" | "private" | "community";
  show_mission_history: boolean;
  show_ratings: boolean;
}

export default function MissionSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsData>({
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: false,
    new_application_notifications: true,
    status_change_notifications: true,
    reminder_notifications: true,
    default_radius: 50,
    default_duration: "flexible",
    default_remuneration_type: "volunteer",
    show_phone: false,
    show_email: false,
    auto_accept_applications: false,
    profile_visibility: "community",
    show_mission_history: true,
    show_ratings: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/missions/settings");
      const data = response.data.data || response.data;
      if (data) {
        setSettings({ ...settings, ...data });
      }
    } catch (err: any) {
      console.error("Erreur chargement paramètres:", err);
      if (err.response?.status !== 404) {
        setError("Impossible de charger les paramètres");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/missions/settings", settings);
      setSuccess("Paramètres enregistrés avec succès !");
      toast.success("Paramètres enregistrés !");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error("Erreur sauvegarde:", err);
      setError("Erreur lors de l'enregistrement des paramètres");
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSettings();
    setRefreshing(false);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <SettingsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-950 transition-colors mb-2"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Paramètres des missions
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gérez vos préférences pour les missions
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-950 hover:bg-green-900 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Erreur</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-700">Succès</p>
              <p className="text-sm text-green-600">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notifications */}
          <SettingsCard
            title="Notifications"
            icon={<Bell className="w-5 h-5 text-green-950" />}
            description="Gérez vos préférences de notifications"
          >
            <div className="space-y-4">
              <ToggleField
                label="Activer les notifications"
                description="Recevoir des notifications pour les missions"
                value={settings.notifications_enabled}
                onChange={(value) =>
                  setSettings({ ...settings, notifications_enabled: value })
                }
              />

              {settings.notifications_enabled && (
                <>
                  <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                    <ToggleField
                      label="Notifications par email"
                      description="Recevoir des notifications par email"
                      value={settings.email_notifications}
                      onChange={(value) =>
                        setSettings({ ...settings, email_notifications: value })
                      }
                    />
                    <ToggleField
                      label="Notifications push"
                      description="Recevoir des notifications push"
                      value={settings.push_notifications}
                      onChange={(value) =>
                        setSettings({ ...settings, push_notifications: value })
                      }
                    />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <ToggleField
                    label="Nouvelles candidatures"
                    description="Être notifié quand quelqu'un postule"
                    value={settings.new_application_notifications}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        new_application_notifications: value,
                      })
                    }
                  />
                  <ToggleField
                    label="Changements de statut"
                    description="Être notifié quand le statut change"
                    value={settings.status_change_notifications}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        status_change_notifications: value,
                      })
                    }
                  />
                  <ToggleField
                    label="Rappels"
                    description="Recevoir des rappels pour les missions"
                    value={settings.reminder_notifications}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        reminder_notifications: value,
                      })
                    }
                  />
                </>
              )}
            </div>
          </SettingsCard>

          {/* Préférences par défaut */}
          <SettingsCard
            title="Préférences par défaut"
            icon={<Settings2 className="w-5 h-5 text-green-950" />}
            description="Configurez vos préférences pour les nouvelles missions"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Rayon de recherche
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={settings.default_radius}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        default_radius: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-950"
                  />
                  <span className="text-sm font-semibold text-gray-900 min-w-[40px]">
                    {settings.default_radius} km
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Durée par défaut
                </label>
                <select
                  value={settings.default_duration}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      default_duration: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition bg-white"
                >
                  <option value="hours">Heures</option>
                  <option value="day">Journée</option>
                  <option value="days">Jours</option>
                  <option value="weeks">Semaines</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Type de rémunération
                </label>
                <select
                  value={settings.default_remuneration_type}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      default_remuneration_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition bg-white"
                >
                  <option value="volunteer">Bénévolat</option>
                  <option value="paid">Rémunérée</option>
                  <option value="fixed">Montant fixe</option>
                  <option value="negotiable">À négocier</option>
                </select>
              </div>

              <ToggleField
                label="Auto-acceptation"
                description="Accepter automatiquement les candidatures"
                value={settings.auto_accept_applications}
                onChange={(value) =>
                  setSettings({ ...settings, auto_accept_applications: value })
                }
              />
            </div>
          </SettingsCard>

          {/* Visibilité */}
          <SettingsCard
            title="Visibilité"
            icon={<Globe className="w-5 h-5 text-green-950" />}
            description="Contrôlez qui peut voir vos informations"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibilité du profil
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      value: "public",
                      label: "Public",
                      icon: <Globe2 size={14} />,
                    },
                    {
                      value: "community",
                      label: "Communauté",
                      icon: <Users size={14} />,
                    },
                    {
                      value: "private",
                      label: "Privé",
                      icon: <Lock size={14} />,
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setSettings({
                          ...settings,
                          profile_visibility: option.value as any,
                        })
                      }
                      className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition border-2 ${
                        settings.profile_visibility === option.value
                          ? "border-green-950 bg-green-50 text-green-950"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <ToggleField
                  label="Historique des missions"
                  description="Afficher vos missions passées"
                  value={settings.show_mission_history}
                  onChange={(value) =>
                    setSettings({ ...settings, show_mission_history: value })
                  }
                />
                <ToggleField
                  label="Évaluations"
                  description="Afficher vos évaluations"
                  value={settings.show_ratings}
                  onChange={(value) =>
                    setSettings({ ...settings, show_ratings: value })
                  }
                />
              </div>
            </div>
          </SettingsCard>

          {/* Confidentialité */}
          <SettingsCard
            title="Confidentialité"
            icon={<Shield className="w-5 h-5 text-green-950" />}
            description="Contrôlez vos informations personnelles"
          >
            <div className="space-y-4">
              <ToggleField
                label="Afficher le téléphone"
                description="Rendre votre numéro visible aux candidats"
                value={settings.show_phone}
                onChange={(value) =>
                  setSettings({ ...settings, show_phone: value })
                }
              />
              <ToggleField
                label="Afficher l'email"
                description="Rendre votre email visible aux candidats"
                value={settings.show_email}
                onChange={(value) =>
                  setSettings({ ...settings, show_email: value })
                }
              />
            </div>
          </SettingsCard>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleBack}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-green-950 hover:bg-green-900 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────

function SettingsCard({
  title,
  icon,
  description,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="p-5 flex-1">{children}</div>
    </div>
  );
}

function ToggleField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${
          value ? "bg-green-950" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-1" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className=" rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-0.5" />
            </div>
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mt-1" />
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions Skeleton */}
      <div className="flex gap-3">
        <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
        <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
