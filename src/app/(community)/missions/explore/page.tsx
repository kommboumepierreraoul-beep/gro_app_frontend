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
  Github,
  Twitter,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Users,
  MessageCircle,
  Bell,
  Settings,
  Home,
  Briefcase,
  Calendar,
  Map,
  FileText,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-[#f9faf2]">
      {/* ─── Navigation ─────────────────────────────────────────────── */}
      <div className="border-b border-[rgba(194,201,187,0.3)] bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-all duration-200 group"
              >
                <ArrowLeft
                  size={20}
                  className="text-[#72796e] group-hover:text-[#154212]"
                />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#154212] flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-[#191c18]">
                  Espace Développement
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#72796e] bg-[#f9faf2] px-3 py-1 rounded-full border border-[rgba(194,201,187,0.3)]">
                v2.0.0-beta
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-[#72796e]">En développement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-[#154212] via-[#2d5a27] to-[#1f4a1a] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#bcf0ae]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#bcf0ae]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="w-8 h-8 text-[#bcf0ae]" />
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                🚀 Nouvelle version en préparation
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-['Plus_Jakarta_Sans']">
              Fonctionnalités en cours de développement
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mb-6">
              Découvrez les nouvelles fonctionnalités qui arrivent bientôt sur
              AgriPulse. Nous travaillons dur pour vous offrir une expérience
              encore meilleure.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Clock className="w-4 h-4 text-[#bcf0ae]" />
                <span className="text-sm">Version prévue : Juillet 2026</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Coffee className="w-4 h-4 text-[#bcf0ae]" />
                <span className="text-sm">Développement actif</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Features Grid ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#191c18] font-['Plus_Jakarta_Sans']">
              Fonctionnalités en développement
            </h2>
            <p className="text-sm text-[#72796e] mt-1">
              Cliquez sur une fonctionnalité pour plus de détails
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#72796e]">
            <Zap className="w-4 h-4 text-[#154212]" />
            <span>{features.length} fonctionnalités</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => openFeatureModal(feature.id)}
                className="group text-left bg-white rounded-2xl p-6 border border-[rgba(194,201,187,0.2)] hover:border-[#154212] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `${feature.color}15`,
                      color: feature.color,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#f9faf2] border border-[rgba(194,201,187,0.2)] text-[#72796e]">
                    {feature.status}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#191c18] mb-2 group-hover:text-[#154212] transition-colors">
                  {feature.name}
                </h3>
                <p className="text-sm text-[#72796e] leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[#154212] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>En savoir plus</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <div className="border-t border-[rgba(194,201,187,0.2)] bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-[#72796e]">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>En développement actif</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#72796e]">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Version bêta</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-colors text-[#72796e] hover:text-[#154212]"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-colors text-[#72796e] hover:text-[#154212]"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-colors text-[#72796e] hover:text-[#154212]"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL ───────────────────────────────────────────────────── */}
      {isModalOpen && selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-[#f9faf2] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-[rgba(194,201,187,0.3)] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[rgba(194,201,187,0.2)] bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  {(() => {
                    const feature = features.find(
                      (f) => f.id === selectedFeature,
                    );
                    const Icon = feature?.icon || Code2;
                    return (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${feature?.color || "#154212"}15`,
                          color: feature?.color || "#154212",
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#191c18]">
                    {features.find((f) => f.id === selectedFeature)?.name ||
                      selectedFeature}
                  </h2>
                  <p className="text-xs text-[#72796e]">
                    Fonctionnalité en développement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-all duration-200"
              >
                <span className="sr-only">Fermer</span>
                <span className="text-2xl text-[#72796e]">×</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Status */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200/30">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#191c18]">
                    En cours de développement
                  </p>
                  <p className="text-xs text-[#72796e]">
                    Cette fonctionnalité est actuellement en développement et
                    sera disponible prochainement.
                  </p>
                </div>
              </div>

              {/* Feature Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#191c18] mb-2">
                    À propos
                  </h3>
                  <p className="text-sm text-[#72796e] leading-relaxed">
                    {features.find((f) => f.id === selectedFeature)
                      ?.description ||
                      "Cette fonctionnalité est en cours de développement pour améliorer votre expérience sur AgriPulse."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#191c18] mb-2">
                    Avancement
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#72796e]">Progression</span>
                      <span className="font-medium text-[#154212]">
                        {features.find((f) => f.id === selectedFeature)
                          ?.status || "0%"}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#e2e3dc] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width:
                            features.find((f) => f.id === selectedFeature)
                              ?.status || "0%",
                          background:
                            "linear-gradient(90deg, #154212 0%, #2d5a27 100%)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#191c18] mb-2">
                    Fonctionnalités prévues
                  </h3>
                  <ul className="space-y-2">
                    {[
                      "Interface utilisateur optimisée",
                      "Performance améliorée",
                      "Intégration avec les services existants",
                      "Support multi-plateforme",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-[#72796e]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#154212] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#191c18]">
                        Version bêta
                      </p>
                      <p className="text-xs text-[#72796e]">
                        Cette fonctionnalité est en version bêta. Des
                        améliorations continues sont apportées.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-[rgba(194,201,187,0.2)] bg-white/50">
              <div className="flex items-center gap-2 text-xs text-[#72796e]">
                <Zap className="w-3 h-3 text-[#154212]" />
                <span>Développement actif</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#72796e] hover:text-[#191c18] transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    // Action de notification
                    alert(
                      "📢 Vous serez informé lorsque cette fonctionnalité sera disponible !",
                    );
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-[#154212] text-white rounded-xl hover:bg-[#2d5a27] transition-all duration-200 hover:shadow-md"
                >
                  Être informé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
