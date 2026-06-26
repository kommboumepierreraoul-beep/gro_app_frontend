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
  Video,
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
  Award,
  Star,
  ChevronRight,
  Mail,
  Phone,
  ExternalLink,
  Sparkles,
  Lightbulb,
  Heart,
  ThumbsUp,
  TrendingUp,
  Loader2,
  Globe,
  Zap,
  Compass,
  X,
  Construction,
} from "lucide-react";

type CategoryType =
  | "all"
  | "getting-started"
  | "creating"
  | "applying"
  | "managing"
  | "payment"
  | "faq";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: CategoryType;
  icon: React.ElementType;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: CategoryType;
  readTime: string;
}

const FAQS: FAQItem[] = [
  {
    id: "1",
    question: "Comment créer une mission ?",
    answer:
      "Pour créer une mission, rendez-vous sur votre tableau de bord et cliquez sur le bouton 'Publier une mission'. Remplissez le formulaire avec les détails de votre mission (titre, description, catégorie, lieu, rémunération, etc.) et publiez-la pour qu'elle soit visible par la communauté.",
    category: "getting-started",
    icon: Briefcase,
  },
  {
    id: "2",
    question: "Comment postuler à une mission ?",
    answer:
      "Naviguez vers la page des missions, trouvez une mission qui vous intéresse et cliquez sur 'Postuler'. Remplissez le formulaire de candidature avec un message personnalisé et soumettez votre candidature. Vous recevrez une notification quand le créateur de la mission examinera votre candidature.",
    category: "applying",
    icon: Send,
  },
  {
    id: "3",
    question: "Comment suivre mes candidatures ?",
    answer:
      "Accédez à la section 'Mes candidatures' dans votre tableau de bord. Vous y verrez toutes vos candidatures avec leur statut : en attente, acceptée, non retenue ou retirée. Vous pouvez également retirer une candidature si elle est encore en attente.",
    category: "managing",
    icon: Clock,
  },
  {
    id: "4",
    question: "Qu'est-ce que le statut 'Pourvue' ?",
    answer:
      "Une mission est marquée comme 'Pourvue' lorsque le créateur a trouvé un candidat et que la mission est en cours de réalisation. À ce stade, les nouvelles candidatures ne sont plus acceptées et les candidats sélectionnés seront contactés.",
    category: "managing",
    icon: CheckCircle,
  },
  {
    id: "5",
    question: "Comment évaluer une mission terminée ?",
    answer:
      "Une fois une mission terminée, le créateur et le candidat peuvent s'évaluer mutuellement. Rendez-vous sur la page de la mission et cliquez sur 'Évaluer'. Vous pourrez attribuer une note et laisser un commentaire sur l'expérience.",
    category: "managing",
    icon: Star,
  },
  {
    id: "6",
    question: "Comment la rémunération est-elle gérée ?",
    answer:
      "La rémunération est définie par le créateur de la mission. Elle peut être : un montant fixe, un taux journalier, un taux horaire, négociable, en nature ou bénévole. Les détails sont discutés entre les parties lors de la sélection du candidat.",
    category: "payment",
    icon: CreditCard,
  },
  {
    id: "7",
    question: "Quelles sont les conditions pour publier une mission ?",
    answer:
      "Vous devez avoir un compte validé pour publier une mission. Les missions doivent respecter les conditions d'utilisation de la plateforme. Nous encourageons les missions légitimes et bénéfiques pour la communauté.",
    category: "getting-started",
    icon: Shield,
  },
  {
    id: "8",
    question: "Puis-je annuler une mission publiée ?",
    answer:
      "Oui, vous pouvez suspendre ou annuler une mission tant qu'elle n'a pas de candidat accepté. Les candidatures en attente seront notifiées de l'annulation. Une fois une mission en cours, elle ne peut plus être annulée.",
    category: "managing",
    icon: AlertCircle,
  },
];

const GUIDES: GuideItem[] = [
  {
    id: "1",
    title: "Débuter avec les missions",
    description:
      "Guide complet pour comprendre le fonctionnement du module missions.",
    icon: BookOpen,
    category: "getting-started",
    readTime: "5 min",
  },
  {
    id: "2",
    title: "Créer une mission parfaite",
    description:
      "Conseils pour rédiger une mission attrayante et trouver les bons candidats.",
    icon: Video,
    category: "creating",
    readTime: "8 min",
  },
  {
    id: "3",
    title: "Optimiser vos candidatures",
    description: "Astuces pour augmenter vos chances d'être sélectionné.",
    icon: Lightbulb,
    category: "applying",
    readTime: "6 min",
  },
  {
    id: "4",
    title: "Guide du créateur de mission",
    description: "Gérez efficacement vos missions du début à la fin.",
    icon: User,
    category: "creating",
    readTime: "10 min",
  },
  {
    id: "5",
    title: "Comprendre le système d'évaluation",
    description:
      "Comment fonctionne la notation et comment améliorer votre score.",
    icon: Star,
    category: "managing",
    readTime: "4 min",
  },
];

const CATEGORIES = [
  { value: "all", label: "Tous", icon: Sparkles },
  { value: "getting-started", label: "Prise en main", icon: BookOpen },
  { value: "creating", label: "Création", icon: Briefcase },
  { value: "applying", label: "Candidature", icon: Send },
  { value: "managing", label: "Gestion", icon: Users },
  { value: "payment", label: "Rémunération", icon: CreditCard },
  { value: "faq", label: "FAQ", icon: HelpCircle },
];

// Modal "Indisponible pour l'instant"
function UnavailableModal({
  isOpen,
  onClose,
  guideTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  guideTitle: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-[#f9faf2] rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-[#72796e]" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-[#f3f4ed] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#c2c9bb]/30">
            <Construction className="w-10 h-10 text-[#154212]" />
          </div>

          <h3 className="text-xl font-bold text-[#191c18] mb-2">
            Guide en cours de construction
          </h3>

          <p className="text-[#72796e] text-sm mb-6">
            Le guide "
            <span className="font-semibold text-[#191c18]">{guideTitle}</span>"
            est actuellement en cours de rédaction et sera disponible très
            prochainement.
          </p>

          <div className="flex items-center justify-center gap-3 text-xs text-[#72796e] bg-[#f9faf2] p-3 rounded-xl border border-[#c2c9bb]/20">
            <Clock className="w-4 h-4 text-[#154212]" />
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

export default function MissionsSupportPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [loading] = useState(false);
  const [unavailableModal, setUnavailableModal] = useState<{
    isOpen: boolean;
    guideTitle: string;
  }>({
    isOpen: false,
    guideTitle: "",
  });

  // Filtrer les FAQ
  const filteredFAQs = FAQS.filter((faq) => {
    const matchCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Filtrer les guides
  const filteredGuides = GUIDES.filter((guide) => {
    const matchCategory =
      activeCategory === "all" || guide.category === activeCategory;
    const matchSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleGuideClick = (guide: GuideItem) => {
    setUnavailableModal({
      isOpen: true,
      guideTitle: guide.title,
    });
  };

  if (loading) {
    return <SupportSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ─── HEADER ─── */}
        <div className="rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-6 mb-6 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/missions"
                className="inline-flex items-center gap-1.5 text-sm text-[#72796e] hover:text-[#154212] transition-colors mb-2"
              >
                <ArrowLeft size={16} />
                Missions
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#154212] flex items-center justify-center">
                  <HelpCircle size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#191c18]">
                    Aide & Support
                  </h1>
                  <p className="text-sm text-[#72796e]">
                    Trouvez des réponses à vos questions sur le module missions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/support/contact"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#c2c9bb]/30 text-[#42493e] hover:bg-[#f9faf2] hover:border-[#154212] transition text-sm font-medium"
              >
                <Mail size={16} />
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* ─── STATS RAPIDES ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#eaf3de] rounded-xl p-3 text-center border border-[#bcf0ae]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <FileText className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">
                {FAQS.length}
              </span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Articles FAQ</p>
          </div>

          <div className="bg-[#d4e8c4] rounded-xl p-3 text-center border border-[#bcf0ae]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <BookOpen className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">
                {GUIDES.length}
              </span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Guides</p>
          </div>

          <div className="bg-[#f3f4ed] rounded-xl p-3 text-center border border-[#c2c9bb]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ThumbsUp className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">96%</span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Satisfaction</p>
          </div>

          <div className="bg-[#eaf3de] rounded-xl p-3 text-center border border-[#bcf0ae]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Clock className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">24/7</span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Disponible</p>
          </div>
        </div>

        {/* ─── RECHERCHE ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#72796e]" />
            <input
              type="text"
              placeholder="Rechercher une question ou un guide..."
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
                    : "bg-white border border-[#c2c9bb]/30 text-[#42493e] hover:border-[#154212] hover:shadow-sm hover:scale-105"
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
            <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 overflow-hidden">
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
                  <div className="p-8 text-center">
                    <AlertCircle className="w-10 h-10 text-[#72796e] mx-auto mb-2" />
                    <p className="text-[#72796e] text-sm">
                      Aucun résultat trouvé
                    </p>
                    <p className="text-xs text-[#72796e] mt-1">
                      Essayez de modifier votre recherche
                    </p>
                  </div>
                ) : (
                  filteredFAQs.map((faq) => {
                    const Icon = faq.icon;
                    const isExpanded = expandedFAQ === faq.id;
                    return (
                      <div key={faq.id} className="transition-all">
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full px-5 py-4 flex items-start gap-3 hover:bg-[#f9faf2] transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-[#eaf3de] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#bcf0ae]/30">
                            <Icon className="w-4 h-4 text-[#154212]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-sm font-medium text-[#191c18]">
                                {faq.question}
                              </span>
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
            <div className="bg-gradient-to-r from-[#eaf3de] to-[#f3f4ed] rounded-2xl border border-[#bcf0ae]/30 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/20">
                  <MessageCircle className="w-6 h-6 text-[#154212]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#191c18]">
                    Besoin d'aide supplémentaire ?
                  </h3>
                  <p className="text-sm text-[#72796e]">
                    Notre équipe est là pour vous aider
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/support/contact"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#c2c9bb]/30 rounded-xl text-sm font-medium text-[#42493e] hover:bg-[#f9faf2] hover:border-[#154212] transition-colors"
                  >
                    <Mail size={16} />
                    Email
                  </Link>
                  <Link
                    href="/support/contact"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#154212] hover:bg-[#1d5a18] text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <MessageCircle size={16} />
                    Chat
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Guides */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 overflow-hidden">
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
                    return (
                      <button
                        key={guide.id}
                        onClick={() => handleGuideClick(guide)}
                        className="w-full px-5 py-4 hover:bg-[#f9faf2] transition-colors group text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-[#eaf3de] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#bcf0ae]/30">
                            <Icon className="w-4 h-4 text-[#154212]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-[#191c18] group-hover:text-[#154212] transition-colors">
                                {guide.title}
                              </h4>
                              <span className="text-[10px] bg-[#f3f4ed] text-[#72796e] px-1.5 py-0.5 rounded-full border border-[#c2c9bb]/30">
                                Bientôt
                              </span>
                            </div>
                            <p className="text-xs text-[#72796e] mt-0.5">
                              {guide.readTime} • {guide.category}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#c2c9bb] group-hover:text-[#154212] transition-colors flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Ressources utiles */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-5">
              <h3 className="text-sm font-semibold text-[#191c18] mb-4">
                Ressources utiles
              </h3>
              <div className="space-y-3">
                <ResourceLink
                  href="/missions"
                  icon={<Briefcase className="w-4 h-4 text-[#154212]" />}
                  title="Explorer les missions"
                  description="Trouvez votre prochaine opportunité"
                />
                <ResourceLink
                  href="/missions/dashboard"
                  icon={<Users className="w-4 h-4 text-[#154212]" />}
                  title="Tableau de bord"
                  description="Gérez vos missions et candidatures"
                />
                <ResourceLink
                  href="/missions/agenda"
                  icon={<Clock className="w-4 h-4 text-[#154212]" />}
                  title="Agenda des missions"
                  description="Visualisez vos missions sur un calendrier"
                />
              </div>
            </div>

            {/* Community stats */}
            <div className="bg-[#154212] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#bcf0ae]" />
                <span className="text-sm font-semibold text-[#bcf0ae]">
                  Communauté active
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#bcf0ae]/70">Missions publiées</span>
                  <span className="font-semibold text-white">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bcf0ae]/70">Candidatures</span>
                  <span className="font-semibold text-white">423</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#bcf0ae]/20">
                  <span className="text-[#bcf0ae]/70">Taux de réussite</span>
                  <span className="font-semibold text-white">87%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-[#c2c9bb]/30">
          <p className="text-xs text-[#72796e] text-center">
            Besoin d'aide supplémentaire ? Consultez notre centre d'aide ou
            contactez notre équipe. Nous sommes là pour vous accompagner dans
            l'utilisation du module missions.
          </p>
        </div>
      </div>

      {/* Modal "Indisponible pour l'instant" */}
      <UnavailableModal
        isOpen={unavailableModal.isOpen}
        onClose={() => setUnavailableModal({ isOpen: false, guideTitle: "" })}
        guideTitle={unavailableModal.guideTitle}
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

// ── Sous-composants ─────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
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

function ResourceLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f9faf2] transition-colors group border border-transparent hover:border-[#c2c9bb]/20"
    >
      <div className="w-8 h-8 bg-[#eaf3de] rounded-lg flex items-center justify-center shrink-0 border border-[#bcf0ae]/30">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[#42493e] group-hover:text-[#154212] transition-colors">
          {title}
        </p>
        <p className="text-xs text-[#72796e]">{description}</p>
      </div>
    </Link>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────

function SupportSkeleton() {
  return (
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="h-4 w-20 bg-[#e2e3dc] rounded animate-pulse mb-2" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#e2e3dc] rounded-xl animate-pulse" />
                <div>
                  <div className="h-8 w-48 bg-[#e2e3dc] rounded animate-pulse" />
                  <div className="h-4 w-64 bg-[#e2e3dc] rounded animate-pulse mt-1" />
                </div>
              </div>
            </div>
            <div className="h-10 w-24 bg-[#e2e3dc] rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#e2e3dc] rounded-xl p-3 animate-pulse">
              <div className="h-6 w-12 bg-[#c2c9bb] rounded mx-auto mb-1" />
              <div className="h-3 w-16 bg-[#c2c9bb] rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-4 mb-6">
          <div className="h-12 bg-[#e2e3dc] rounded-xl animate-pulse" />
        </div>

        {/* Categories Skeleton */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-10 w-24 bg-[#e2e3dc] rounded-xl animate-pulse"
            />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 overflow-hidden">
              <div className="p-5 border-b border-[#c2c9bb]/20">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#e2e3dc] rounded animate-pulse" />
                  <div className="h-6 w-40 bg-[#e2e3dc] rounded animate-pulse" />
                  <div className="ml-auto h-5 w-16 bg-[#e2e3dc] rounded-full animate-pulse" />
                </div>
              </div>
              <div className="divide-y divide-[#c2c9bb]/20">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#e2e3dc] rounded-lg animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-[#e2e3dc] rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 overflow-hidden">
              <div className="p-5 border-b border-[#c2c9bb]/20">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#e2e3dc] rounded animate-pulse" />
                  <div className="h-6 w-24 bg-[#e2e3dc] rounded animate-pulse" />
                </div>
              </div>
              <div className="divide-y divide-[#c2c9bb]/20">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#e2e3dc] rounded-lg animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-[#e2e3dc] rounded animate-pulse" />
                        <div className="h-3 w-20 bg-[#e2e3dc] rounded animate-pulse mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-6 p-4 bg-[#e2e3dc] rounded-xl animate-pulse">
          <div className="h-3 w-96 bg-[#c2c9bb] rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}
