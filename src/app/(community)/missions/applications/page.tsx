/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMyApplications } from "@/hooks/missions/useMissions";
import { ApplicationStatus } from "@/lib/missions/types";
import MyApplicationCard from "@/components/missions/Card/MyApplicationCard";

type TabType = "all" | "pending" | "accepted" | "rejected" | "withdrawn";

const TABS: { id: TabType; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "pending", label: "En attente" },
  { id: "accepted", label: "Acceptées" },
  { id: "rejected", label: "Non retenues" },
  { id: "withdrawn", label: "Retirées" },
];

export default function MyApplicationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Récupérer les candidatures
  const { data: applicationsData, isLoading } = useMyApplications(
    activeTab === "all" ? undefined : { status: activeTab },
  );

  const applications = applicationsData?.data ?? [];

  // Filtrer par recherche
  const filteredApplications = applications.filter((app: any) => {
    const missionTitle = app.mission?.title || "";
    const missionDescription = app.mission?.description || "";
    const searchLower = search.toLowerCase();
    return (
      missionTitle.toLowerCase().includes(searchLower) ||
      missionDescription.toLowerCase().includes(searchLower)
    );
  });

  // Statistiques
  const stats = {
    total: applications.length,
    pending: applications.filter((a: any) => a.status === "pending").length,
    accepted: applications.filter((a: any) => a.status === "accepted").length,
    rejected: applications.filter((a: any) => a.status === "rejected").length,
    withdrawn: applications.filter((a: any) => a.status === "withdrawn").length,
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4">
            <div>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-950 transition-colors mb-2"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Mes candidatures
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Suivez l'état de vos candidatures aux missions
              </p>
            </div>
            <Link
              href="/missions"
              className="flex items-center gap-2 px-5 py-2.5 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm rounded-xl shadow-sm transition shrink-0 w-full sm:w-auto justify-center"
            >
              <Briefcase size={16} />
              Voir les missions
            </Link>
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="Total"
            value={stats.total}
            icon={<Send className="w-5 h-5 text-green-950" />}
            bgColor="bg-green-50"
          />
          <StatCard
            label="En attente"
            value={stats.pending}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            bgColor="bg-amber-50"
          />
          <StatCard
            label="Acceptées"
            value={stats.accepted}
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            bgColor="bg-green-50"
          />
          <StatCard
            label="Non retenues"
            value={stats.rejected}
            icon={<XCircle className="w-5 h-5 text-red-500" />}
            bgColor="bg-red-50"
          />
          <StatCard
            label="Retirées"
            value={stats.withdrawn}
            icon={<XCircle className="w-5 h-5 text-gray-400" />}
            bgColor="bg-gray-50"
          />
        </div>

        {/* ── Recherche ──────────────────────────────────────────────── */}
        <div className="rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une mission..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition"
              />
            </div>
          </div>
        </div>

        {/* ── Liste des candidatures ─────────────────────────────────── */}
        <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-100">
            <div className="flex gap-1 px-4 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-green-950 text-green-950"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.id !== "all" && (
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {stats[tab.id as keyof typeof stats] || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu */}
          <div className="p-4 sm:p-6">
            {isLoading ? (
              <LoadingState />
            ) : filteredApplications.length === 0 ? (
              <EmptyState search={search} onClearSearch={() => setSearch("")} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredApplications.map((application: any) => (
                  <MyApplicationCard
                    key={application.id}
                    application={application}
                  />
                ))}
              </div>
            )}
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
  bgColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="animate-spin text-green-950" size={32} />
      <p className="text-sm text-gray-500 mt-3">
        Chargement des candidatures...
      </p>
    </div>
  );
}

function EmptyState({
  search,
  onClearSearch,
}: {
  search: string;
  onClearSearch: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Send className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {search ? "Aucun résultat trouvé" : "Aucune candidature"}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        {search
          ? `Aucune candidature ne correspond à "${search}"`
          : "Vous n'avez pas encore postulé à une mission."}
      </p>
      {search && (
        <button
          onClick={onClearSearch}
          className="mt-4 text-sm text-green-950 hover:underline font-medium"
        >
          Effacer la recherche
        </button>
      )}
      {!search && (
        <Link
          href="/missions"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm rounded-xl transition"
        >
          <Briefcase size={16} />
          Explorer les missions
        </Link>
      )}
    </div>
  );
}
