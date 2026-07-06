/* eslint-disable react/no-unescaped-entities */
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
  Sparkle,
  Zap,
  Compass,
  Gem,
  Grid3X3,
  List,
  SlidersHorizontal,
} from "lucide-react";

import { AnnouncementCard } from "@/components/community/announcements/AnnouncementCard";
import CreateAnnouncementModal from "@/components/community/announcements/CreateAnnouncementModal";
import EditAnnouncementModal from "@/components/community/announcements/EditAnnouncementModal";
import { announcementService } from "@/services/community/announcement.service";
import { useAuthStore } from "@/stores/auth.store";
import type { Announcement } from "@/types/community.types";

const CATEGORIES = [
  { value: "", label: "Tous", icon: Compass, color: "emerald" },
  { value: "job", label: "Emploi", icon: Briefcase, color: "amber" },
  { value: "event", label: "Événement", icon: CalendarDays, color: "green" },
  { value: "news", label: "Actualité", icon: Newspaper, color: "stone" },
  { value: "training", label: "Formation", icon: GraduationCap, color: "lime" },
  { value: "other", label: "Autre", icon: Pin, color: "gray" },
];

// Map catégorie → couleurs GRO
const CATEGORY_META: Record<
  string,
  { bg: string; text: string; light: string; gradient: string; border: string }
> = {
  emerald: {
    bg: "bg-[#154212]",
    text: "text-[#154212]",
    light: "bg-[#eaf3de]",
    gradient: "from-[#154212] to-[#2d6a4f]",
    border: "border-[#bcf0ae]/30",
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    light: "bg-amber-50",
    gradient: "from-amber-500 to-amber-600",
    border: "border-amber-200/30",
  },
  green: {
    bg: "bg-green-600",
    text: "text-green-600",
    light: "bg-green-50",
    gradient: "from-green-600 to-green-700",
    border: "border-green-200/30",
  },
  stone: {
    bg: "bg-stone-600",
    text: "text-stone-600",
    light: "bg-stone-50",
    gradient: "from-stone-600 to-stone-700",
    border: "border-stone-200/30",
  },
  lime: {
    bg: "bg-lime-500",
    text: "text-lime-600",
    light: "bg-lime-50",
    gradient: "from-lime-500 to-lime-600",
    border: "border-lime-200/30",
  },
  gray: {
    bg: "bg-gray-600",
    text: "text-gray-600",
    light: "bg-gray-50",
    gradient: "from-gray-600 to-gray-700",
    border: "border-gray-200/30",
  },
};

export default function AnnouncementsPage() {
  const { user } = useAuthStore();
  const [category, setCategory] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["announcements", category],
    queryFn: () => announcementService.getAll(category || undefined),
  });

  const announcements = data?.data ?? [];
  const selectedCategory =
    CATEGORIES.find((c) => c.value === category) || CATEGORIES[0];
  const color = CATEGORY_META[selectedCategory.color] || CATEGORY_META.emerald;

  const filteredAnnouncements = announcements.filter(
    (a: any) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Stats rapides
  const stats = {
    total: filteredAnnouncements.length,
    views: announcements.reduce(
      (acc: number, a: any) => acc + (a.views || 0),
      0,
    ),
    likes: announcements.reduce(
      (acc: number, a: any) => acc + (a.likes_count || 0),
      0,
    ),
    categories: CATEGORIES.length - 1,
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setEditOpen(true);
  };

  const handleDelete = (id: number) => {
    refetch();
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    setEditingAnnouncement(null);
    refetch();
  };

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 md:py-8 lg:py-12 pb-24 md:pb-6 max-w-[1440px] mx-auto bg-[#f9faf2]">
      {/* ── HEADER ── */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-12">
        <div className="flex-1">
          <p className="text-[#3b6934] text-[10px] sm:text-xs tracking-widest uppercase mb-1">
            COMMUNAUTÉ AgriPulse
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-[40px] font-bold leading-tight tracking-tight text-[#191c18]">
            Annonces
          </h1>
          <p className="text-xs sm:text-sm text-[#42493e] mt-1">
            {stats.total} annonce{stats.total !== 1 ? "s" : ""} disponible
            {stats.total !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Barre recherche + filtres */}
          <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-white/70 backdrop-blur-xl border border-[#c2c9bb]/40 rounded-xl flex-1 sm:flex-initial">
            <Search
              size={14}
              className="sm:h-4 sm:w-4 text-[#42493e] shrink-0"
            />
            <input
              type="text"
              placeholder="Rechercher une annonce..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm w-full sm:w-52 text-[#191c18] placeholder:text-[#72796e]"
            />
            <div className="h-4 w-px bg-[#c2c9bb]/40 hidden sm:block" />
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 text-[#42493e] hover:text-[#154212] transition-colors shrink-0 ${
                showFilters ? "text-[#154212]" : ""
              }`}
            >
              <SlidersHorizontal size={14} className="sm:h-4 sm:w-4" />
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase hidden sm:inline">
                Filtres
              </span>
            </button>
          </div>

          {/* Toggle vue */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#edefe7] rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-[#154212]"
                    : "text-[#72796e]"
                }`}
              >
                <Grid3X3 size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-[#154212]"
                    : "text-[#72796e]"
                }`}
              >
                <List size={14} />
              </button>
            </div>

            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#154212] text-white font-semibold text-[10px] sm:text-xs tracking-widest uppercase py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:bg-[#2d5a27] hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={14} className="sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Publier une annonce</span>
              <span className="sm:hidden">Publier</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── FILTRES EXPANDABLES ── */}
      {showFilters && (
        <div className="mb-4 sm:mb-6 md:mb-10">
          <div className="bg-white/70 backdrop-blur-sm border border-[#c2c9bb]/30 rounded-2xl p-3 sm:p-4 md:p-6">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.value;
                const catColor =
                  CATEGORY_META[cat.color] || CATEGORY_META.emerald;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${catColor.gradient} text-white shadow-lg scale-105`
                        : "bg-white text-[#42493e] hover:bg-[#eaf3de] border border-[#c2c9bb]/20 hover:border-[#bcf0ae]"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-white" : "text-[#72796e]"}`}
                    />
                    <span className="hidden xs:inline">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── STATS RAPIDES - MASQUÉES SUR MOBILE ── */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-12">
        {[
          {
            label: "Annonces actives",
            value: stats.total,
            icon: <Megaphone size={14} className="sm:h-4 sm:w-4" />,
          },
          {
            label: "Vues totales",
            value: stats.views,
            icon: <Eye size={14} className="sm:h-4 sm:w-4" />,
          },
          {
            label: "J'aime",
            value: stats.likes,
            icon: <Heart size={14} className="sm:h-4 sm:w-4" />,
          },
          {
            label: "Catégories",
            value: stats.categories,
            icon: <Compass size={14} className="sm:h-4 sm:w-4" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/70 backdrop-blur-sm border border-[#c2c9bb]/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#2d5a27]/10 text-[#154212] rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg md:text-[22px] font-bold leading-none text-[#191c18]">
                {stat.value}
              </p>
              <p className="text-[8px] xs:text-[9px] sm:text-[10px] text-[#72796e] font-medium mt-0.5 truncate">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      {isLoading ? (
        <AnnouncementsSkeleton viewMode={viewMode} />
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 sm:p-12 md:p-20 text-center border border-[#c2c9bb]/30">
          <div className="inline-flex p-4 sm:p-5 bg-gradient-to-br from-[#eaf3de] to-[#f3f4ed] rounded-3xl mb-6 sm:mb-8">
            <Sprout className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-[#154212]" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#191c18] mb-2 sm:mb-3">
            {searchQuery ? "Aucun résultat" : "Pas encore d'annonce"}
          </h3>
          <p className="text-sm sm:text-base text-[#72796e] mb-6 sm:mb-8 max-w-md mx-auto">
            {searchQuery
              ? `Aucune annonce ne correspond à "${searchQuery}".`
              : `La catégorie "${selectedCategory.label}" ne contient pas encore d'annonce.`}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#f3f4ed] text-[#42493e] font-semibold rounded-xl hover:bg-[#e2e3dc] transition-all"
            >
              <X className="w-4 h-4" />
              Effacer la recherche
            </button>
          ) : (
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#154212] hover:bg-[#2d5a27] text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Publier une annonce
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8 md:space-y-12">
          {/* Annonces */}
          <section className="space-y-3 sm:space-y-4 md:space-y-5">
            <div className="flex items-center justify-between border-b border-[#c2c9bb]/20 pb-2 sm:pb-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 ${color.light} ${color.text} flex items-center justify-center rounded-lg sm:rounded-xl shrink-0`}
                >
                  <Compass size={16} className="sm:h-4 sm:w-4 md:h-5 md:w-5" />
                </div>
                <h2 className="text-sm sm:text-base md:text-xl font-semibold text-[#191c18] truncate">
                  {selectedCategory.label}
                </h2>
                <span className="bg-[#e2e3dc] text-[#42493e] px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold whitespace-nowrap">
                  {filteredAnnouncements.length}
                </span>
              </div>
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                  : "flex flex-col gap-3 sm:gap-4"
              }
            >
              {filteredAnnouncements.map(
                (announcement: Announcement, index: number) => (
                  <div
                    key={announcement.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <AnnouncementCard
                      announcement={announcement}
                      viewMode={viewMode}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ),
              )}
            </div>
          </section>

          {/* Section tendances */}
          {filteredAnnouncements.length > 3 && (
            <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-[#eaf3de] to-[#f3f4ed] rounded-2xl sm:rounded-3xl border border-[#bcf0ae]/30">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-1.5 sm:p-2 md:p-3 bg-[#154212] rounded-xl sm:rounded-2xl shadow-lg shadow-[#154212]/25">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#191c18] text-sm sm:text-base md:text-lg">
                    En pleine croissance
                  </h3>
                  <p className="text-xs sm:text-sm text-[#72796e]">
                    Les annonces qui font parler d'elles dans la communauté
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#72796e] ml-auto" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MODALS ─── */}
      <CreateAnnouncementModal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          refetch();
        }}
      />

      {editOpen && editingAnnouncement && (
        <EditAnnouncementModal
          isOpen={editOpen}
          announcement={editingAnnouncement}
          onClose={() => {
            setEditOpen(false);
            setEditingAnnouncement(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fadeUp 0.4s ease-out both;
          opacity: 0;
        }
        @media (max-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────

function AnnouncementsSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-12">
      <section className="space-y-3 sm:space-y-4 md:space-y-5">
        <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-[#c2c9bb]/20">
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-[#e7e9e1] rounded-lg sm:rounded-xl animate-pulse" />
          <div className="h-3 sm:h-4 md:h-5 w-24 sm:w-32 md:w-48 bg-[#e7e9e1] rounded animate-pulse" />
          <div className="h-2 sm:h-3 md:h-4 w-10 sm:w-12 md:w-16 bg-[#e7e9e1] rounded-full animate-pulse" />
        </div>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              : "flex flex-col gap-3 sm:gap-4"
          }
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white/70 border border-[#c2c9bb]/30 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-r from-[#e7e9e1] to-[#f3f4ed]" />
              <div className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-[#e7e9e1] rounded-full" />
                  <div className="flex-1">
                    <div className="h-2 sm:h-3 md:h-4 w-20 sm:w-24 md:w-32 bg-[#e7e9e1] rounded" />
                    <div className="h-1.5 sm:h-2 w-12 sm:w-16 md:w-20 bg-[#e7e9e1] rounded mt-1" />
                  </div>
                </div>
                <div className="h-3 sm:h-4 md:h-5 w-3/4 bg-[#e7e9e1] rounded" />
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="h-1.5 sm:h-2 md:h-3 w-full bg-[#e7e9e1] rounded" />
                  <div className="h-1.5 sm:h-2 md:h-3 w-2/3 bg-[#e7e9e1] rounded" />
                  <div className="h-1.5 sm:h-2 md:h-3 w-3/4 bg-[#e7e9e1] rounded" />
                </div>
                <div className="pt-2 sm:pt-3 border-t border-[#e2e3dc]">
                  <div className="flex gap-2">
                    <div className="h-6 sm:h-7 md:h-8 w-14 sm:w-16 md:w-20 bg-[#e7e9e1] rounded-lg" />
                    <div className="h-6 sm:h-7 md:h-8 w-14 sm:w-16 md:w-20 bg-[#e7e9e1] rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
