/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Globe,
  Globe2,
  Lock,
  Users,
  Eye,
  EyeOff,
  MessageCircle,
  UserCheck,
  UserX,
  Activity,
  Calendar,
  Camera,
  MapPin,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface PrivacySettings {
  profile_public: boolean;
  allow_messages: boolean;
  show_activity: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  allow_tagging: boolean;
  show_online_status: boolean;
  block_messages_from_non_followers: boolean;
  show_birthdate: boolean;
}

export default function PrivacyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState<PrivacySettings>({
    profile_public: true,
    allow_messages: true,
    show_activity: true,
    show_email: false,
    show_phone: false,
    show_location: true,
    allow_tagging: true,
    show_online_status: true,
    block_messages_from_non_followers: false,
    show_birthdate: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
      toast.success("Paramètres de confidentialité enregistrés !");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleReset = () => {
    setSettings({
      profile_public: true,
      allow_messages: true,
      show_activity: true,
      show_email: false,
      show_phone: false,
      show_location: true,
      allow_tagging: true,
      show_online_status: true,
      block_messages_from_non_followers: false,
      show_birthdate: false,
    });
    toast.success("Paramètres réinitialisés");
  };

  if (loading) {
    return <PrivacySkeleton />;
  }

  // Statistiques
  const totalSettings = Object.keys(settings).length;
  const activeSettings = Object.values(settings).filter(Boolean).length;
  const privacyLevel = Math.round((activeSettings / totalSettings) * 100);

  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className=" rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-950 transition-colors mb-2"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Shield size={24} className="text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Confidentialité
                  </h1>
                  <p className="text-sm text-gray-500">
                    Gérez vos paramètres de confidentialité et de sécurité
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
              >
                Réinitialiser
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

        {/* Succès */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-green-700">
              Paramètres enregistrés avec succès !
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Niveau de confidentialité"
            value={`${privacyLevel}%`}
            icon={<Shield className="w-4 h-4 text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            label="Paramètres actifs"
            value={`${activeSettings}/${totalSettings}`}
            icon={<Lock className="w-4 h-4 text-green-950" />}
            color="bg-green-50"
          />
          <StatCard
            label="Profil"
            value={settings.profile_public ? "Public" : "Privé"}
            icon={
              settings.profile_public ? (
                <Globe2 className="w-4 h-4 text-blue-600" />
              ) : (
                <Lock className="w-4 h-4 text-amber-600" />
              )
            }
            color={settings.profile_public ? "bg-blue-50" : "bg-amber-50"}
          />
          <StatCard
            label="Messages"
            value={settings.allow_messages ? "Ouverts" : "Fermés"}
            icon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
            color="bg-emerald-50"
          />
        </div>

        {/* Grid des paramètres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Visibilité du profil */}
          <PrivacyCard
            icon={<Globe2 className="w-5 h-5 text-blue-600" />}
            title="Profil public"
            description="Votre profil est visible par tous les utilisateurs"
            value={settings.profile_public}
            onChange={() => handleToggle("profile_public")}
            color="blue"
          />

          {/* Messages privés */}
          <PrivacyCard
            icon={<MessageCircle className="w-5 h-5 text-emerald-600" />}
            title="Messages privés"
            description="Autoriser les utilisateurs à vous envoyer des messages"
            value={settings.allow_messages}
            onChange={() => handleToggle("allow_messages")}
            color="emerald"
          />

          {/* Activité */}
          <PrivacyCard
            icon={<Activity className="w-5 h-5 text-amber-600" />}
            title="Afficher l'activité"
            description="Les autres peuvent voir votre activité sur la plateforme"
            value={settings.show_activity}
            onChange={() => handleToggle("show_activity")}
            color="amber"
          />

          {/* Email */}
          <PrivacyCard
            icon={<Eye className="w-5 h-5 text-rose-600" />}
            title="Afficher l'email"
            description="Votre email est visible par les autres utilisateurs"
            value={settings.show_email}
            onChange={() => handleToggle("show_email")}
            color="rose"
          />

          {/* Téléphone */}
          <PrivacyCard
            icon={<Phone className="w-5 h-5 text-indigo-600" />}
            title="Afficher le téléphone"
            description="Votre numéro de téléphone est visible par les autres"
            value={settings.show_phone}
            onChange={() => handleToggle("show_phone")}
            color="indigo"
          />

          {/* Localisation */}
          <PrivacyCard
            icon={<MapPin className="w-5 h-5 text-cyan-600" />}
            title="Afficher la localisation"
            description="Votre localisation est visible dans vos publications"
            value={settings.show_location}
            onChange={() => handleToggle("show_location")}
            color="cyan"
          />

          {/* Tagging */}
          <PrivacyCard
            icon={<UserCheck className="w-5 h-5 text-green-600" />}
            title="Autoriser le tagging"
            description="Les utilisateurs peuvent vous taguer dans leurs publications"
            value={settings.allow_tagging}
            onChange={() => handleToggle("allow_tagging")}
            color="green"
          />

          {/* Statut en ligne */}
          <PrivacyCard
            icon={<UserCheck className="w-5 h-5 text-purple-600" />}
            title="Statut en ligne"
            description="Les autres voient quand vous êtes en ligne"
            value={settings.show_online_status}
            onChange={() => handleToggle("show_online_status")}
            color="purple"
          />

          {/* Bloquer messages non-followers */}
          <PrivacyCard
            icon={<UserX className="w-5 h-5 text-red-600" />}
            title="Bloquer les non-abonnés"
            description="Seuls vos abonnés peuvent vous envoyer des messages"
            value={settings.block_messages_from_non_followers}
            onChange={() => handleToggle("block_messages_from_non_followers")}
            color="red"
          />

          {/* Date de naissance */}
          <PrivacyCard
            icon={<Calendar className="w-5 h-5 text-orange-600" />}
            title="Afficher la date de naissance"
            description="Votre date de naissance est visible sur votre profil"
            value={settings.show_birthdate}
            onChange={() => handleToggle("show_birthdate")}
            color="orange"
          />
        </div>

        {/* Footer */}
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800">
                Vos données sont protégées
              </p>
              <p className="text-xs text-purple-600">
                Nous respectons votre vie privée. Vos données sont sécurisées et
                utilisées conformément à notre politique de confidentialité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`${color} rounded-xl p-3 text-center`}>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        {icon}
        <span className="text-lg font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-xs font-medium text-gray-600">{label}</p>
    </div>
  );
}

function PrivacyCard({
  icon,
  title,
  description,
  value,
  onChange,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onChange: () => void;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "border-blue-100 hover:border-blue-200",
    emerald: "border-emerald-100 hover:border-emerald-200",
    amber: "border-amber-100 hover:border-amber-200",
    rose: "border-rose-100 hover:border-rose-200",
    indigo: "border-indigo-100 hover:border-indigo-200",
    cyan: "border-cyan-100 hover:border-cyan-200",
    green: "border-green-100 hover:border-green-200",
    purple: "border-purple-100 hover:border-purple-200",
    red: "border-red-100 hover:border-red-200",
    orange: "border-orange-100 hover:border-orange-200",
  };

  return (
    <div
      className={`
         rounded-xl 
        border ${colorMap[color] || "border-gray-100"} 
        p-4 
        transition-all duration-200
        hover:shadow-sm
        flex items-start justify-between gap-4
      `}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>

      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-1 ${
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

// ── Composant Phone ─────────────────────────────────────────────────────

function Phone(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────

function PrivacySkeleton() {
  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Skeleton */}
        <div className="rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                <div>
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-1" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl p-3 animate-pulse">
              <div className="h-6 w-12 bg-gray-300 rounded mx-auto mb-1" />
              <div className="h-3 w-16 bg-gray-300 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Privacy Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className=" rounded-xl border border-gray-100 p-4 animate-pulse"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-48 bg-gray-200 rounded mt-1" />
                  </div>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded-full mt-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-purple-200 rounded animate-pulse shrink-0" />
            <div>
              <div className="h-4 w-48 bg-purple-200 rounded animate-pulse" />
              <div className="h-3 w-96 bg-purple-200 rounded animate-pulse mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
