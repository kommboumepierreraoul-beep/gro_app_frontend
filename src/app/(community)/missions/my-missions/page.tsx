/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import MissionCard from "@/components/missions/Card/MissionCard";
import EmptyMissions from "@/components/missions/EmptyMission";
import { useMissionStore } from "@/stores/useMissionStore";
import { useRouter } from "next/navigation";
import {
  Plus,
  Briefcase,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Filter,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  MapPin,
  User,
} from "lucide-react";

type StatusFilter =
  | "all"
  | "draft"
  | "published"
  | "filled"
  | "in_progress"
  | "completed"
  | "suspended";

const STATUS_OPTIONS: { value: StatusFilter; label: string; color: string }[] =
  [
    { value: "all", label: "Toutes", color: "text-gray-500" },
    { value: "published", label: "Publiées", color: "text-green-700" },
    { value: "draft", label: "Brouillons", color: "text-amber-700" },
    { value: "filled", label: "Pourvues", color: "text-blue-700" },
    { value: "in_progress", label: "En cours", color: "text-indigo-700" },
    { value: "completed", label: "Terminées", color: "text-emerald-700" },
    { value: "suspended", label: "Suspendues", color: "text-red-700" },
  ];

export default function MyMissionPage() {
  const { filters, setFilters } = useMissionStore();
  const router = useRouter();

  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    filled: 0,
    completed: 0,
    pending: 0,
    suspended: 0,
    in_progress: 0,
  });

  useEffect(() => {
    fetchMyMissions();
  }, [statusFilter]);

  const fetchMyMissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        per_page: 50,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const res = await api.get("/missions/my", { params });

      const data = res.data.data || [];
      setMissions(data);

      // Calculer les statistiques
      const total = data.length;
      const published = data.filter(
        (m: any) => m.status === "published",
      ).length;
      const draft = data.filter((m: any) => m.status === "draft").length;
      const filled = data.filter((m: any) => m.status === "filled").length;
      const completed = data.filter(
        (m: any) => m.status === "completed",
      ).length;
      const suspended = data.filter(
        (m: any) => m.status === "suspended",
      ).length;
      const pending = data.filter(
        (m: any) => m.status === "pending_review",
      ).length;
      const in_progress = missions.filter(
        (m: any) => m.status === "in_progress",
      ).length;

      setStats({
        total,
        published,
        draft,
        filled,
        completed,
        pending,
        suspended,
        in_progress,
      });
    } catch (err) {
      console.error("Erreur chargement missions:", err);
      setError("Erreur lors du chargement des missions");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyMissions();
    setRefreshing(false);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setShowFilters(false);
  };

  // Filtrer par recherche
  const filteredMissions = missions.filter((mission) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      mission.title?.toLowerCase().includes(searchLower) ||
      mission.description?.toLowerCase().includes(searchLower) ||
      mission.location?.toLowerCase().includes(searchLower)
    );
  });

  const hasActiveFilters = search !== "" || statusFilter !== "all";

  // ── LOADING avec Skeleton ─────────────────────
  if (loading) {
    return <MissionsSkeleton />;
  }

  // ── ERROR ───────────────────────
  if (error) {
    return (
      <div className=" rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Une erreur est survenue
        </h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm rounded-xl transition"
        >
          <RefreshCw size={16} />
          Réessayer
        </button>
      </div>
    );
  }

  // ── EMPTY STATE ─────────────────────
  if (missions.length === 0 && !hasActiveFilters) {
    return (
      <div className=" rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-10 h-10 text-green-950" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune mission
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Vous n'avez pas encore publié de mission. Créez votre première
            mission pour commencer à recruter.
          </p>
          <button
            onClick={() => router.push("/community/missions/create")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm rounded-xl transition shadow-sm"
          >
            <Plus size={18} />
            Publier une mission
          </button>
        </div>
      </div>
    );
  }

  // ── LIST ────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className=" rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-green-950 text-xs tracking-widest uppercase font-semibold mb-1">
              MON ESPACE
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Mes missions
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gérez vos missions publiées et suivez leur évolution
            </p>
          </div>
          <button
            onClick={() => router.push("/community/missions/create")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm rounded-xl shadow-sm transition active:scale-95 shrink-0 w-full sm:w-auto"
          >
            <Plus size={16} />
            Publier une mission
          </button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard
          label="Total"
          value={stats.total}
          color="bg-gray-100"
          textColor="text-gray-700"
        />
        <StatCard
          label="Publiées"
          value={stats.published}
          color="bg-green-50"
          textColor="text-green-700"
        />
        <StatCard
          label="Brouillons"
          value={stats.draft}
          color="bg-amber-50"
          textColor="text-amber-700"
        />
        <StatCard
          label="Pourvues"
          value={stats.filled}
          color="bg-blue-50"
          textColor="text-blue-700"
        />
        <StatCard
          label="En cours"
          value={stats.in_progress|| 0}
          color="bg-indigo-50"
          textColor="text-indigo-700"
        />
        <StatCard
          label="Terminées"
          value={stats.completed}
          color="bg-emerald-50"
          textColor="text-emerald-700"
        />
        <StatCard
          label="Suspendues"
          value={stats.suspended}
          color="bg-red-50"
          textColor="text-red-700"
        />
      </div>

      {/* ── Recherche et Filtres ─────────────────────────────────── */}
      <div className=" rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col gap-3">
          {/* Barre de recherche */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par titre, description ou lieu..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  showFilters || hasActiveFilters
                    ? "bg-green-950 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <SlidersHorizontal size={16} />
                Filtres
                {hasActiveFilters && (
                  <span className="ml-1 /20 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {[statusFilter !== "all" ? 1 : 0, search ? 1 : 0].reduce(
                      (a, b) => a + b,
                      0,
                    )}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-600 transition"
                >
                  <X size={16} />
                  <span className="hidden sm:inline">Effacer</span>
                </button>
              )}

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-green-950 transition disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Rafraîchir</span>
              </button>
            </div>
          </div>

          {/* Filtres expandables */}
          {showFilters && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Statut */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Statut
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          statusFilter === option.value
                            ? "bg-green-950 text-white"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filtres actifs */}
              {hasActiveFilters && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Filtres actifs :
                  </span>
                  {statusFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                      {
                        STATUS_OPTIONS.find((o) => o.value === statusFilter)
                          ?.label
                      }
                      <button
                        onClick={() => setStatusFilter("all")}
                        className="hover:text-red-500 transition"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {search && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                      "{search}"
                      <button
                        onClick={() => setSearch("")}
                        className="hover:text-red-500 transition"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Résultats ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredMissions.length} mission
          {filteredMissions.length > 1 ? "s" : ""} trouvée
          {filteredMissions.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Grille ─────────────────────────────────────────────────── */}
      {filteredMissions.length === 0 ? (
        <div className=" rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun résultat
            </h3>
            <p className="text-sm text-gray-500">
              Aucune mission ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 text-sm text-green-950 hover:underline font-medium"
            >
              Effacer tous les filtres
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} viewMode="grid" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  textColor,
}: {
  label: string;
  value: number;
  color: string;
  textColor: string;
}) {
  return (
    <div
      className={` rounded-xl shadow-sm border border-gray-100 px-3 py-2.5 text-center ${color}`}
    >
      <p className={`text-lg font-bold ${textColor}`}>{value}</p>
      <p className="text-[10px] text-gray-500 font-medium">{label}</p>
    </div>
  );
}

function AlertCircle(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Skeleton de chargement ─────────────────────────────────────────────

function MissionsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className=" rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4">
          <div>
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-1" />
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className=" rounded-xl shadow-sm border border-gray-100 px-3 py-2.5 text-center"
          >
            <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mx-auto mt-1" />
          </div>
        ))}
      </div>

      {/* Search & Filters Skeleton */}
      <div className=" rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-11 bg-gray-200 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            <div className="h-11 w-24 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-11 w-11 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Results count Skeleton */}
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className=" border border-gray-100 rounded-2xl p-6 space-y-4"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Title */}
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />

            {/* Description */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Metadata */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
