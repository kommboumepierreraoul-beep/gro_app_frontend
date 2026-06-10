/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  CalendarDays,
  Newspaper,
  GraduationCap,
  Pin,
  Megaphone,
  TrendingUp,
  Leaf,
  Sprout,
  TreeDeciduous,
  Flower2,
  Mountain,
  Sparkles,
  Clock,
  Eye,
  Heart,
  Share2,
  MapPin,
  Users,
  Award,
  Star,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  ExternalLink,
  Plus,
  Search,
  Filter,
  X,
  ChevronRight,
} from "lucide-react";

import { AnnouncementCard } from "@/components/community/announcements/AnnouncementCard";
import CreateAnnouncementModal from "@/components/community/announcements/CreateAnnouncementModal";
import { announcementService } from "@/services/community/announcement.service";
import { useAuthStore } from "@/stores/auth.store";

const CATEGORIES = [
  { value: "", label: "Tous", icon: Leaf, color: "emerald" },
  { value: "job", label: "Emploi", icon: Briefcase, color: "amber" },
  { value: "event", label: "Événement", icon: CalendarDays, color: "green" },
  { value: "news", label: "Actualité", icon: Newspaper, color: "stone" },
  { value: "training", label: "Formation", icon: GraduationCap, color: "lime" },
  { value: "other", label: "Autre", icon: Pin, color: "gray" },
];

export default function AnnouncementsPage() {
  const { user } = useAuthStore();
  const [category, setCategory] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["announcements", category],
    queryFn: () => announcementService.getAll(category || undefined),
  });

  const announcements = data?.data ?? [];
  const selectedCategory =
    CATEGORIES.find((c) => c.value === category) || CATEGORIES[0];

  // Filtrer les annonces par recherche
  const filteredAnnouncements = announcements.filter(
    (a: any) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen" style={{ background: "#f9faf2" }}>
      {/* Header avec dégradé */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-3xl shadow-xl mb-8 mx-4 md:mx-0">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L35 15L45 18L35 25L38 35L30 30L22 35L25 25L15 18L25 15L30 5Z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "40px",
            }}
          />
        </div>

        <div className="relative px-6 md:px-10 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Megaphone className="w-4 h-4 text-emerald-300" />
              <span className="text-emerald-100 text-sm font-medium">
                Espace communautaire
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Annonces de la
              <span className="block text-emerald-200">Communauté</span>
            </h1>
            <p className="text-lg text-emerald-100 mb-8 max-w-2xl">
              Découvrez les opportunités qui poussent dans votre environnement
              professionnel et social
            </p>

            {/* Stats rapides */}
            <div className="flex flex-wrap gap-6 text-emerald-100/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">1.2k</div>
                  <div className="text-xs text-emerald-200">Vues</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">89</div>
                  <div className="text-xs text-emerald-200">J'aime</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">234</div>
                  <div className="text-xs text-emerald-200">Membres</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full"
          >
            <path
              fill="#f9faf2"
              fillOpacity="1"
              d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Barre d'outils */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                Explorer par catégorie
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedCategory.label} • {filteredAnnouncements.length}{" "}
                annonce(s)
              </p>
            </div>

            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Publier une annonce
            </button>
          </div>

          {/* Recherche et catégories */}
          <div className="mt-5 space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une annonce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Catégories */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grille d'annonces */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="h-48 bg-gradient-to-r from-gray-100 to-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-16 bg-gray-100 rounded" />
                  <div className="flex gap-2 pt-2">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="w-8 h-8 bg-gray-100 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <div className="inline-flex p-4 bg-emerald-50 rounded-2xl mb-6">
              <Sprout className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune annonce trouvée
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery
                ? `Aucun résultat pour "${searchQuery}"`
                : `Dans la catégorie "${selectedCategory.label}", il n'y a encore aucune annonce.`}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Effacer la recherche
              </button>
            ) : (
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Publier une annonce
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredAnnouncements.map((announcement: any, index: number) => (
                <div
                  key={announcement.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AnnouncementCard announcement={announcement} />
                </div>
              ))}
            </div>

            {/* Section tendances */}
            {filteredAnnouncements.length > 3 && (
              <div className="mt-12 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    En pleine croissance
                  </h3>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  Les annonces qui font parler d'elles dans la communauté
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de création */}
      <CreateAnnouncementModal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          refetch();
        }}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
