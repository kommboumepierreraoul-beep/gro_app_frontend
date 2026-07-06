"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  BellRing,
  BellOff,
  Mail,
  Smartphone,
  MessageCircle,
  Heart,
  MessageSquare,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  Users,
  Star,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  message_alerts: boolean;
  post_likes: boolean;
  comments: boolean;
  new_followers: boolean;
  mission_updates: boolean;
  newsletter: boolean;
  system_updates: boolean;
}

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    message_alerts: true,
    post_likes: false,
    comments: true,
    new_followers: true,
    mission_updates: true,
    newsletter: false,
    system_updates: true,
  });

  useEffect(() => {
    // Simuler le chargement des préférences
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      // Simuler l'appel API
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
      toast.success("Préférences enregistrées !");
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
    setPreferences({
      email_notifications: true,
      push_notifications: true,
      message_alerts: true,
      post_likes: false,
      comments: true,
      new_followers: true,
      mission_updates: true,
      newsletter: false,
      system_updates: true,
    });
    toast.success("Préférences réinitialisées");
  };

  if (loading) {
    return <NotificationSkeleton />;
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Bell size={24} className="text-amber-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Préférences de notifications
                  </h1>
                  <p className="text-sm text-gray-500">
                    Gérez comment et quand vous recevez des notifications
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
              Préférences enregistrées avec succès !
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Actives"
            value={Object.values(preferences).filter(Boolean).length}
            total={Object.keys(preferences).length}
            icon={<BellRing className="w-4 h-4 text-green-950" />}
            color="bg-green-50"
          />
          <StatCard
            label="Email"
            value={preferences.email_notifications ? 1 : 0}
            total={1}
            icon={<Mail className="w-4 h-4 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            label="Push"
            value={preferences.push_notifications ? 1 : 0}
            total={1}
            icon={<Smartphone className="w-4 h-4 text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            label="Réseaux"
            value={
              [
                preferences.new_followers,
                preferences.post_likes,
                preferences.comments,
              ].filter(Boolean).length
            }
            total={3}
            icon={<Users className="w-4 h-4 text-amber-600" />}
            color="bg-amber-50"
          />
        </div>

        {/* Grille des préférences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Notifications par email */}
          <PreferenceCard
            icon={<Mail className="w-5 h-5 text-blue-600" />}
            title="Notifications par email"
            description="Recevez les notifications par email"
            value={preferences.email_notifications}
            onChange={() => handleToggle("email_notifications")}
            color="blue"
          />

          {/* Notifications push */}
          <PreferenceCard
            icon={<Smartphone className="w-5 h-5 text-purple-600" />}
            title="Notifications push"
            description="Recevez les notifications sur votre appareil"
            value={preferences.push_notifications}
            onChange={() => handleToggle("push_notifications")}
            color="purple"
          />

          {/* Alertes de messages */}
          <PreferenceCard
            icon={<MessageCircle className="w-5 h-5 text-emerald-600" />}
            title="Alertes de messages"
            description="Soyez notifié des nouveaux messages"
            value={preferences.message_alerts}
            onChange={() => handleToggle("message_alerts")}
            color="emerald"
          />

          {/* J'aimes sur les posts */}
          <PreferenceCard
            icon={<Heart className="w-5 h-5 text-rose-600" />}
            title="J'aimes sur les posts"
            description="Soyez notifié des likes sur vos posts"
            value={preferences.post_likes}
            onChange={() => handleToggle("post_likes")}
            color="rose"
          />

          {/* Commentaires */}
          <PreferenceCard
            icon={<MessageSquare className="w-5 h-5 text-indigo-600" />}
            title="Commentaires"
            description="Soyez notifié des nouveaux commentaires"
            value={preferences.comments}
            onChange={() => handleToggle("comments")}
            color="indigo"
          />

          {/* Nouveaux followers */}
          <PreferenceCard
            icon={<Users className="w-5 h-5 text-cyan-600" />}
            title="Nouveaux followers"
            description="Soyez notifié des nouveaux abonnés"
            value={preferences.new_followers}
            onChange={() => handleToggle("new_followers")}
            color="cyan"
          />

          {/* Mises à jour des missions */}
          <PreferenceCard
            icon={<Star className="w-5 h-5 text-amber-600" />}
            title="Mises à jour des missions"
            description="Soyez notifié des changements sur vos missions"
            value={preferences.mission_updates}
            onChange={() => handleToggle("mission_updates")}
            color="amber"
          />

          {/* Newsletter */}
          <PreferenceCard
            icon={<Globe className="w-5 h-5 text-green-600" />}
            title="Newsletter"
            description="Recevez notre newsletter hebdomadaire"
            value={preferences.newsletter}
            onChange={() => handleToggle("newsletter")}
            color="green"
          />

          {/* Mises à jour système */}
          <PreferenceCard
            icon={<Clock className="w-5 h-5 text-gray-600" />}
            title="Mises à jour système"
            description="Soyez informé des mises à jour de la plateforme"
            value={preferences.system_updates}
            onChange={() => handleToggle("system_updates")}
            color="gray"
          />
        </div>

        {/* Footer */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Vous pouvez modifier ces préférences à tout moment. Certaines
            notifications peuvent être obligatoires pour le bon fonctionnement
            de la plateforme.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  total,
  icon,
  color,
}: {
  label: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`${color} rounded-xl p-3 text-center`}>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        {icon}
        <span className="text-lg font-bold text-gray-900">{percentage}%</span>
      </div>
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="text-[10px] text-gray-400">
        {value}/{total} activé{total > 1 ? "s" : ""}
      </p>
    </div>
  );
}

function PreferenceCard({
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
    purple: "border-purple-100 hover:border-purple-200",
    emerald: "border-emerald-100 hover:border-emerald-200",
    rose: "border-rose-100 hover:border-rose-200",
    indigo: "border-indigo-100 hover:border-indigo-200",
    cyan: "border-cyan-100 hover:border-cyan-200",
    amber: "border-amber-100 hover:border-amber-200",
    green: "border-green-100 hover:border-green-200",
    gray: "border-gray-100 hover:border-gray-200",
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

// ── Skeleton ─────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
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
              <div className="h-2 w-12 bg-gray-300 rounded mx-auto mt-1" />
            </div>
          ))}
        </div>

        {/* Preferences Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 p-4 animate-pulse"
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
        <div className="mt-6 p-4 bg-gray-200 rounded-xl animate-pulse">
          <div className="h-3 w-96 bg-gray-300 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}
