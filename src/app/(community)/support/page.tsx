/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  HelpCircle,
  MessageCircle,
  FileText,
  BookOpen,
  User,
  Briefcase,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  CreditCard,
  Users,
  Star,
  ChevronRight,
  Mail,
  Headphones,
  Lightbulb,
  Heart,
  ThumbsUp,
  TrendingUp,
  Globe,
  Zap,
  Bell,
  Rocket,
  Layers,
  Menu,
  X,
  Calendar,
  MapPin,
  Smartphone,
  Laptop,
  BookMarked,
  GraduationCap,
  Building,
  Trophy,
  Target,
  Coffee,
  Gift,
  Crown,
  Flame,
  Gem,
  Sparkles,
} from "lucide-react";

type CategoryType =
  | "all"
  | "getting-started"
  | "account"
  | "community"
  | "missions"
  | "profile"
  | "notifications"
  | "faq";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: CategoryType;
  icon: React.ElementType;
  module: "global" | "missions" | "community" | "profile";
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: CategoryType;
  module: "global" | "missions" | "community" | "profile";
  readTime: string;
}

const FAQS: FAQItem[] = [
  {
    id: "g1",
    question: "Comment créer un compte ?",
    answer:
      "Pour créer un compte, cliquez sur le bouton 'S'inscrire' en haut à droite. Remplissez le formulaire avec vos informations personnelles et validez. Vous recevrez un email de confirmation pour activer votre compte.",
    category: "getting-started",
    icon: User,
    module: "global",
  },
  {
    id: "g2",
    question: "Comment réinitialiser mon mot de passe ?",
    answer:
      "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Saisissez votre adresse email et vous recevrez un lien pour réinitialiser votre mot de passe.",
    category: "account",
    icon: Shield,
    module: "global",
  },
  {
    id: "m1",
    question: "Comment créer une mission ?",
    answer:
      "Rendez-vous sur votre tableau de bord missions et cliquez sur 'Publier une mission'. Remplissez le formulaire avec les détails de votre mission et publiez-la.",
    category: "missions",
    icon: Briefcase,
    module: "missions",
  },
  {
    id: "m2",
    question: "Comment postuler à une mission ?",
    answer:
      "Trouvez une mission qui vous intéresse et cliquez sur 'Postuler'. Remplissez le formulaire de candidature avec un message personnalisé.",
    category: "missions",
    icon: Send,
    module: "missions",
  },
  {
    id: "c1",
    question: "Comment publier une annonce ?",
    answer:
      "Rendez-vous dans la section 'Annonces' et cliquez sur 'Publier une annonce'. Remplissez le formulaire avec les détails de votre annonce.",
    category: "community",
    icon: FileText,
    module: "community",
  },
  {
    id: "n1",
    question: "Comment gérer mes notifications ?",
    answer:
      "Rendez-vous dans vos préférences de notifications depuis votre profil. Vous pouvez activer ou désactiver les notifications selon vos préférences.",
    category: "notifications",
    icon: Bell,
    module: "global",
  },
];

const GUIDES: GuideItem[] = [
  {
    id: "g1",
    title: "Bienvenue sur la plateforme",
    description: "Guide complet pour découvrir toutes les fonctionnalités.",
    icon: Rocket,
    category: "getting-started",
    module: "global",
    readTime: "8 min",
  },
  {
    id: "g2",
    title: "Sécurité et confidentialité",
    description: "Protégez votre compte et vos données personnelles.",
    icon: Shield,
    category: "account",
    module: "global",
    readTime: "6 min",
  },
  {
    id: "m1",
    title: "Débuter avec les missions",
    description: "Comprendre le fonctionnement du module missions.",
    icon: BookOpen,
    category: "missions",
    module: "missions",
    readTime: "5 min",
  },
  {
    id: "m2",
    title: "Créer une mission parfaite",
    description: "Conseils pour rédiger une mission attrayante.",
    icon: Lightbulb,
    category: "missions",
    module: "missions",
    readTime: "8 min",
  },
  {
    id: "c1",
    title: "Guide de la communauté",
    description: "Comment interagir et contribuer à la vie de la communauté.",
    icon: Users,
    category: "community",
    module: "community",
    readTime: "7 min",
  },
  {
    id: "p1",
    title: "Optimiser votre profil",
    description: "Tirez le meilleur parti de votre profil professionnel.",
    icon: User,
    category: "profile",
    module: "profile",
    readTime: "4 min",
  },
];

const CATEGORIES = [
  { value: "all", label: "Tous", icon: Layers },
  { value: "getting-started", label: "Prise en main", icon: Rocket },
  { value: "account", label: "Compte", icon: Shield },
  { value: "missions", label: "Missions", icon: Briefcase },
  { value: "community", label: "Communauté", icon: Users },
  { value: "profile", label: "Profil", icon: User },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "faq", label: "FAQ", icon: HelpCircle },
];

const MODULE_ICONS = {
  global: { icon: Globe },
  missions: { icon: Briefcase },
  community: { icon: Users },
  profile: { icon: User },
};

// Modal "Bientôt disponible"
function ComingSoonModal({
  isOpen,
  onClose,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative  rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-[#154212] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Bientôt disponible
          </h3>

          <p className="text-gray-500 text-sm mb-6">
            Le guide "{title}" est en cours de rédaction. Revenez bientôt pour
            découvrir son contenu.
          </p>

          <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Disponible prochainement</span>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full px-4 py-2.5 bg-[#154212] hover:bg-[#1d5a18] text-white font-medium rounded-xl transition-colors"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<
    "all" | "global" | "missions" | "community" | "profile"
  >("all");
  const [comingSoonModal, setComingSoonModal] = useState<{
    isOpen: boolean;
    title: string;
  }>({
    isOpen: false,
    title: "",
  });

  // Filtrer les FAQ
  const filteredFAQs = FAQS.filter((faq) => {
    const matchCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchModule = activeModule === "all" || faq.module === activeModule;
    const matchSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchModule && matchSearch;
  });

  // Filtrer les guides
  const filteredGuides = GUIDES.filter((guide) => {
    const matchCategory =
      activeCategory === "all" || guide.category === activeCategory;
    const matchModule = activeModule === "all" || guide.module === activeModule;
    const matchSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchModule && matchSearch;
  });

  // Statistiques
  const stats = {
    totalArticles: FAQS.length + GUIDES.length,
    totalFAQs: FAQS.length,
    totalGuides: GUIDES.length,
    modules: {
      global:
        FAQS.filter((f) => f.module === "global").length +
        GUIDES.filter((g) => g.module === "global").length,
      missions:
        FAQS.filter((f) => f.module === "missions").length +
        GUIDES.filter((g) => g.module === "missions").length,
      community:
        FAQS.filter((f) => f.module === "community").length +
        GUIDES.filter((g) => g.module === "community").length,
      profile:
        FAQS.filter((f) => f.module === "profile").length +
        GUIDES.filter((g) => g.module === "profile").length,
    },
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleGuideClick = (guide: GuideItem) => {
    setComingSoonModal({
      isOpen: true,
      title: guide.title,
    });
  };

  return (
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ─── HEADER ─── */}
        <div className=" rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-[#72796e] hover:text-[#154212] transition-colors mb-2"
              >
                <ArrowLeft size={16} />
                Accueil
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#154212] flex items-center justify-center">
                  <Headphones size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#191c18]">
                    Centre d'aide
                  </h1>
                  <p className="text-sm text-[#72796e]">
                    Trouvez des réponses à toutes vos questions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/support/contact"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#c2c9bb]/30 text-[#42493e] hover: hover:border-[#154212] transition text-sm font-medium"
              >
                <Mail size={16} />
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* ─── STATS RAPIDES ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className=" rounded-xl p-3 text-center border border-[#c2c9bb]/30 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <FileText className="w-4 h-4 text-[#3b6934]" />
              <span className="text-lg font-bold text-[#191c18]">
                {stats.totalArticles}
              </span>
            </div>
            <p className="text-xs font-medium text-[#72796e]">Articles</p>
          </div>

          <div className=" rounded-xl p-3 text-center border border-[#c2c9bb]/30 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <HelpCircle className="w-4 h-4 text-[#3b6934]" />
              <span className="text-lg font-bold text-[#191c18]">
                {stats.totalFAQs}
              </span>
            </div>
            <p className="text-xs font-medium text-[#72796e]">FAQ</p>
          </div>

          <div className=" rounded-xl p-3 text-center border border-[#c2c9bb]/30 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <BookOpen className="w-4 h-4 text-[#3b6934]" />
              <span className="text-lg font-bold text-[#191c18]">
                {stats.totalGuides}
              </span>
            </div>
            <p className="text-xs font-medium text-[#72796e]">Guides</p>
          </div>

          <div className=" rounded-xl p-3 text-center border border-[#c2c9bb]/30 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Layers className="w-4 h-4 text-[#3b6934]" />
              <span className="text-lg font-bold text-[#191c18]">4</span>
            </div>
            <p className="text-xs font-medium text-[#72796e]">Modules</p>
          </div>
        </div>

        {/* ─── MODULES ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              key: "global",
              label: "Global",
              icon: Globe,
              count: stats.modules.global,
            },
            {
              key: "missions",
              label: "Missions",
              icon: Briefcase,
              count: stats.modules.missions,
            },
            {
              key: "community",
              label: "Communauté",
              icon: Users,
              count: stats.modules.community,
            },
            {
              key: "profile",
              label: "Profil",
              icon: User,
              count: stats.modules.profile,
            },
          ].map((module) => {
            const isActive =
              activeModule === "all" || activeModule === module.key;
            return (
              <button
                key={module.key}
                onClick={() =>
                  setActiveModule(
                    activeModule === module.key ? "all" : (module.key as any),
                  )
                }
                className={`rounded-xl p-3 text-center transition-all duration-300 border ${
                  isActive
                    ? "bg-[#154212] text-white border-[#154212] shadow-lg shadow-[#154212]/20"
                    : " border-[#c2c9bb]/30 text-[#42493e] hover:border-[#154212] hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <module.icon className="w-5 h-5" />
                  <span className="text-lg font-bold">{module.count}</span>
                </div>
                <p className="text-xs font-medium">{module.label}</p>
                {isActive && (
                  <div className="mt-1 w-6 h-0.5 /50 rounded-full mx-auto" />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── RECHERCHE ─── */}
        <div className=" rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#72796e]" />
            <input
              type="text"
              placeholder="Rechercher une question ou un sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#f9faf2] border border-[#c2c9bb]/30 rounded-xl text-sm text-[#191c18] outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition placeholder:text-[#72796e]"
            />
          </div>
        </div>

        {/* ─── CATÉGORIES ─── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value as CategoryType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-[#154212] text-white shadow-lg shadow-[#154212]/20 scale-105"
                    : " border border-[#c2c9bb]/30 text-[#42493e] hover:border-[#154212] hover:shadow-sm hover:scale-105"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── CONTENU ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section principale - FAQ */}
          <div className="lg:col-span-2 space-y-6">
            <div className=" rounded-2xl shadow-sm border border-[#c2c9bb]/30 overflow-hidden">
              <div className="p-5 border-b border-[#c2c9bb]/20 bg-[#f9faf2]/50">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#154212]" />
                  <h2 className="text-lg font-semibold text-[#191c18]">
                    Questions fréquentes
                  </h2>
                  <span className="ml-auto text-xs text-[#72796e] bg-[#f9faf2] px-2 py-1 rounded-full border border-[#c2c9bb]/20">
                    {filteredFAQs.length} articles
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#c2c9bb]/20">
                {filteredFAQs.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-[#f9faf2] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#c2c9bb]/20">
                      <Search className="w-8 h-8 text-[#72796e]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#191c18] mb-2">
                      Aucun résultat
                    </h3>
                    <p className="text-sm text-[#72796e]">
                      Modifiez vos filtres ou votre recherche
                    </p>
                  </div>
                ) : (
                  filteredFAQs.map((faq) => {
                    const Icon = faq.icon;
                    const isExpanded = expandedFAQ === faq.id;
                    const moduleInfo = MODULE_ICONS[faq.module];
                    const ModuleIcon = moduleInfo?.icon || Globe;

                    return (
                      <div key={faq.id} className="transition-all">
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full px-5 py-4 flex items-start gap-3 hover:bg-[#f9faf2] transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-[#f9faf2] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#c2c9bb]/20">
                            <Icon className="w-4 h-4 text-[#3b6934]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <span className="text-sm font-medium text-[#191c18]">
                                  {faq.question}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center gap-1 text-[10px] text-[#72796e] bg-[#f9faf2] px-2 py-0.5 rounded-full border border-[#c2c9bb]/20">
                                    <ModuleIcon className="w-3 h-3" />
                                    {faq.module === "global"
                                      ? "Global"
                                      : faq.module === "missions"
                                        ? "Missions"
                                        : faq.module === "community"
                                          ? "Communauté"
                                          : "Profil"}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight
                                className={`w-4 h-4 text-[#72796e] flex-shrink-0 transition-transform duration-300 ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </div>
                            {isExpanded && (
                              <p className="mt-3 text-sm text-[#42493e] leading-relaxed animate-fade-in bg-[#f9faf2] p-3 rounded-lg border border-[#c2c9bb]/20">
                                {faq.answer}
                              </p>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-[#f9faf2] rounded-2xl border border-[#c2c9bb]/30 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3  rounded-2xl shadow-sm border border-[#c2c9bb]/20">
                  <Headphones className="w-6 h-6 text-[#154212]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#191c18]">
                    Besoin d'aide ?
                  </h3>
                  <p className="text-sm text-[#72796e]">
                    Notre équipe est là pour vous aider
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/support/contact"
                    className="inline-flex items-center gap-2 px-4 py-2  border border-[#c2c9bb]/30 rounded-xl text-sm font-medium text-[#42493e] hover:bg-[#f9faf2] hover:border-[#154212] transition-colors"
                  >
                    <Mail size={16} />
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Guides */}
          <div className="space-y-6">
            <div className=" rounded-2xl shadow-sm border border-[#c2c9bb]/30 overflow-hidden">
              <div className="p-5 border-b border-[#c2c9bb]/20 bg-[#f9faf2]/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#154212]" />
                  <h3 className="text-lg font-semibold text-[#191c18]">
                    Guides
                  </h3>
                </div>
              </div>

              <div className="divide-y divide-[#c2c9bb]/20">
                {filteredGuides.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-[#72796e] text-sm">Aucun guide trouvé</p>
                  </div>
                ) : (
                  filteredGuides.map((guide) => {
                    const Icon = guide.icon;
                    const moduleInfo = MODULE_ICONS[guide.module];
                    const ModuleIcon = moduleInfo?.icon || Globe;

                    return (
                      <button
                        key={guide.id}
                        onClick={() => handleGuideClick(guide)}
                        className="w-full px-5 py-4 hover:bg-[#f9faf2] transition-colors group text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-[#f9faf2] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#c2c9bb]/20">
                            <Icon className="w-4 h-4 text-[#3b6934]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-[#191c18] group-hover:text-[#154212] transition-colors">
                                {guide.title}
                              </h4>
                              <span className="text-[10px] bg-[#f9faf2] text-[#72796e] px-1.5 py-0.5 rounded-full border border-[#c2c9bb]/20">
                                Bientôt
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] text-[#72796e] bg-[#f9faf2] px-2 py-0.5 rounded-full border border-[#c2c9bb]/20">
                                <ModuleIcon className="w-3 h-3" />
                                {guide.module === "global"
                                  ? "Global"
                                  : guide.module === "missions"
                                    ? "Missions"
                                    : guide.module === "community"
                                      ? "Communauté"
                                      : "Profil"}
                              </span>
                              <span className="text-xs text-[#72796e]">•</span>
                              <span className="text-xs text-[#72796e]">
                                {guide.readTime}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#c2c9bb] group-hover:text-[#154212] transition-colors flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Liens rapides */}
            <div className=" rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-5">
              <h3 className="text-sm font-semibold text-[#191c18] mb-4">
                Accès rapide
              </h3>
              <div className="space-y-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f9faf2] transition-colors group"
                >
                  <div className="w-8 h-8 bg-[#f9faf2] rounded-lg flex items-center justify-center border border-[#c2c9bb]/20">
                    <User className="w-4 h-4 text-[#3b6934]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#42493e] group-hover:text-[#154212] transition-colors">
                      Mon profil
                    </p>
                    <p className="text-xs text-[#72796e]">
                      Gérer mes informations
                    </p>
                  </div>
                </Link>
                <Link
                  href="/missions/dashboard"
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f9faf2] transition-colors group"
                >
                  <div className="w-8 h-8 bg-[#f9faf2] rounded-lg flex items-center justify-center border border-[#c2c9bb]/20">
                    <Briefcase className="w-4 h-4 text-[#3b6934]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#42493e] group-hover:text-[#154212] transition-colors">
                      Mes missions
                    </p>
                    <p className="text-xs text-[#72796e]">Gérer mes missions</p>
                  </div>
                </Link>
                <Link
                  href="/community/announcements"
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f9faf2] transition-colors group"
                >
                  <div className="w-8 h-8 bg-[#f9faf2] rounded-lg flex items-center justify-center border border-[#c2c9bb]/20">
                    <FileText className="w-4 h-4 text-[#3b6934]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#42493e] group-hover:text-[#154212] transition-colors">
                      Annonces
                    </p>
                    <p className="text-xs text-[#72796e]">Voir les annonces</p>
                  </div>
                </Link>
                <Link
                  href="/settings/notifications"
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f9faf2] transition-colors group"
                >
                  <div className="w-8 h-8 bg-[#f9faf2] rounded-lg flex items-center justify-center border border-[#c2c9bb]/20">
                    <Bell className="w-4 h-4 text-[#3b6934]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#42493e] group-hover:text-[#154212] transition-colors">
                      Notifications
                    </p>
                    <p className="text-xs text-[#72796e]">Gérer mes alertes</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Stats communauté */}
            <div className="bg-[#154212] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#bcf0ae]" />
                <span className="text-sm font-semibold text-[#bcf0ae]">
                  Communauté
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#bcf0ae]/70">Membres</span>
                  <span className="font-semibold text-white">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bcf0ae]/70">Missions</span>
                  <span className="font-semibold text-white">156</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#bcf0ae]/20">
                  <span className="text-[#bcf0ae]/70">Satisfaction</span>
                  <span className="font-semibold text-white">96%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <div className="mt-6 p-4  rounded-xl border border-[#c2c9bb]/30 shadow-sm">
          <p className="text-xs text-[#72796e] text-center">
            Besoin d'aide ? Consultez notre centre d'aide ou contactez notre
            équipe.
          </p>
        </div>
      </div>

      {/* Modal "Bientôt disponible" */}
      <ComingSoonModal
        isOpen={comingSoonModal.isOpen}
        onClose={() => setComingSoonModal({ isOpen: false, title: "" })}
        title={comingSoonModal.title}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
