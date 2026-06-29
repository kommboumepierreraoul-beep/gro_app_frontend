/* app/development/page.tsx */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Code2,
  Sparkles,
  Clock,
  Rocket,
  Coffee,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
  Users,
  MessageCircle,
  Bell,
  Briefcase,
  Calendar,
  Map,
  FileText,
  HelpCircle,
} from "lucide-react";

export default function DevelopmentPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    {
      id: "video-call",
      name: "Appels vidéo",
      icon: Users,
      description: "Communication en temps réel avec vos contacts",
      color: "#2d5a27",
      status: "95%",
    },
    {
      id: "ai-chat",
      name: "Chat IA avancé",
      icon: Sparkles,
      description: "Assistant intelligent pour vos missions",
      color: "#7c3aed",
      status: "80%",
    },
    {
      id: "missions-map",
      name: "Carte interactive",
      icon: Map,
      description: "Visualisation des missions en temps réel",
      color: "#0d6efd",
      status: "70%",
    },
    {
      id: "notifications",
      name: "Notifications push",
      icon: Bell,
      description: "Alertes en temps réel sur vos activités",
      color: "#805533",
      status: "60%",
    },
    {
      id: "calendar",
      name: "Agenda partagé",
      icon: Calendar,
      description: "Planification collaborative des missions",
      color: "#dc2626",
      status: "50%",
    },
    {
      id: "analytics",
      name: "Tableaux de bord",
      icon: Briefcase,
      description: "Analyses avancées et statistiques",
      color: "#2563eb",
      status: "40%",
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const openFeatureModal = (featureId: string) => {
    setSelectedFeature(featureId);
    setIsModalOpen(true);
  };

  const getFeature = (id: string) => features.find((f) => f.id === id);

  return (
    <div className="min-h-screen bg-[#f9faf2]">
      {/* Header */}
      <div className="border-b border-[rgba(194,201,187,0.3)] bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-all"
              >
                <ArrowLeft size={20} className="text-[#72796e]" />
              </button>
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#154212]" />
                <h1 className="text-lg font-semibold text-[#191c18]">
                  Développement
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-[#72796e]">En cours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-[#154212] to-[#2d5a27] rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="w-6 h-6 text-[#bcf0ae]" />
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/10 border border-white/20">
              🚀 Nouvelles fonctionnalités
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Fonctionnalités en développement
          </h2>
          <p className="text-white/80 text-sm max-w-2xl">
            Découvrez les nouvelles fonctionnalités qui arrivent bientôt sur
            AgriPulse.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => openFeatureModal(feature.id)}
                className="text-left bg-white rounded-xl p-5 border border-[rgba(194,201,187,0.2)] hover:border-[#154212] hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${feature.color}15`,
                      color: feature.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#f9faf2] border border-[rgba(194,201,187,0.2)] text-[#72796e]">
                    {feature.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#191c18] mb-1">
                  {feature.name}
                </h3>
                <p className="text-xs text-[#72796e]">{feature.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal simple */}
      {isModalOpen && selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const feature = getFeature(selectedFeature);
                  const Icon = feature?.icon || Code2;
                  return (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${feature?.color || "#154212"}15`,
                        color: feature?.color || "#154212",
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  );
                })()}
                <h3 className="text-lg font-semibold text-[#191c18]">
                  {getFeature(selectedFeature)?.name || selectedFeature}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-all"
              >
                <X className="w-5 h-5 text-[#72796e]" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4">
              <p className="text-sm text-[#72796e]">
                {getFeature(selectedFeature)?.description ||
                  "Cette fonctionnalité est en cours de développement."}
              </p>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-[#191c18]">
                    Avancement
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#72796e]">Progression</span>
                  <span className="font-medium text-[#154212]">
                    {getFeature(selectedFeature)?.status || "0%"}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#e2e3dc] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: getFeature(selectedFeature)?.status || "0%",
                      background: "linear-gradient(90deg, #154212, #2d5a27)",
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#191c18]">
                      Version bêta
                    </p>
                    <p className="text-xs text-[#72796e]">
                      Fonctionnalité en développement actif.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[rgba(194,201,187,0.2)]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-[#72796e] hover:text-[#191c18] transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  alert("📢 Vous serez informé !");
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium bg-[#154212] text-white rounded-lg hover:bg-[#2d5a27] transition-all"
              >
                Être informé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
