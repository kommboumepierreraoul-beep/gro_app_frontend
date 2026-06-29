"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Briefcase,
  Send,
  Loader2,
  ChevronDown,
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Eye,
  Star,
  Calendar,
} from "lucide-react";
import { useMyMissions, useMyApplications } from "@/hooks/missions/useMissions";
import { ApplicationStatus, MissionStatus } from "@/lib/missions/types";
import MyMissionCard from "@/components/missions/Card/MyMissionCard";
import MyApplicationCard from "@/components/missions/Card/MyApplicationCard";
import CreateMissionModal from "@/components/missions/Form/CreateMissionModal";
import ReviewModal from "@/components/missions/Form/ReviewModal";
import { useMissionStore } from "@/stores/useMissionStore";

type Tab = "published" | "applications";

const MISSION_STATUS_FILTERS: {
  value: MissionStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "Toutes" },
  { value: "draft", label: "Brouillons" },
  { value: "published", label: "Publiées" },
  { value: "filled", label: "Pourvues" },
  { value: "in_progress", label: "En cours" },
  { value: "completed", label: "Terminées" },
  { value: "suspended", label: "Suspendues" },
];

const APPLICATION_STATUS_FILTERS: {
  value: ApplicationStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Acceptées" },
  { value: "rejected", label: "Non retenues" },
  { value: "withdrawn", label: "Retirées" },
];

export default function MissionsDashboardPage() {
  const [tab, setTab] = useState<Tab>("published");
  const [missionFilter, setMissionFilter] = useState<MissionStatus | "all">(
    "all",
  );
  const [appFilter, setAppFilter] = useState<ApplicationStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);

  const reviewModalMission = useMissionStore((s) => s.reviewModalMission);

  const { data: missionsData, isLoading: missionsLoading } = useMyMissions(
    missionFilter === "all" ? undefined : { status: missionFilter },
  );
  const { data: applicationsData, isLoading: applicationsLoading } =
    useMyApplications(appFilter === "all" ? undefined : { status: appFilter });

  const missions = missionsData?.data ?? [];
  const applications = applicationsData?.data ?? [];

  // Compteurs pour badges d'onglets
  const pendingApplicationsToReview = missions.reduce(
    (acc, m) => acc + (m.pending_count ?? 0),
    0,
  );

  // Statistiques pour les missions
  const publishedMissions = missions.filter((m) => m.status === "published");
  const draftMissions = missions.filter((m) => m.status === "draft");
  const filledMissions = missions.filter((m) => m.status === "filled");
  const completedMissions = missions.filter((m) => m.status === "completed");

  // Statistiques pour les candidatures
  const pendingApps = applications.filter((a) => a.status === "pending");
  const acceptedApps = applications.filter((a) => a.status === "accepted");
  const rejectedApps = applications.filter((a) => a.status === "rejected");

  const totalViews = missions.reduce((acc, m) => acc + (m.views_count || 0), 0);
  const totalApplications = missions.reduce(
    (acc, m) => acc + (m.applications_count || 0),
    0,
  );

  const isLoading = missionsLoading || applicationsLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className=" rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start md:items-end justify-between gap-4">
            <div>
              <p className="text-green-950 text-xs tracking-widest uppercase font-semibold mb-1">
                Mon espace
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Tableau de bord missions
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gérez vos missions publiées et suivez vos candidatures
              </p>
            </div>
            {isLoading ? (
              <div className="h-10 w-40 bg-gray-200 rounded-xl animate-pulse" />
            ) : (
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center justify-center gap-2 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-all active:scale-95 shrink-0 w-full sm:w-auto"
              >
                <Plus size={16} />
                Publier une mission
              </button>
            )}
            
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {isLoading ? (
            <>
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
            </>
          ) : (
            <>
              <div className=" rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-green-950" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {publishedMissions.length}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Publiées
                    </p>
                  </div>
                </div>
              </div>

              <div className=" rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {totalApplications}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Candidatures
                    </p>
                  </div>
                </div>
              </div>

              <div className=" rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <Eye className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {totalViews}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Vues totales
                    </p>
                  </div>
                </div>
              </div>

              <div className=" rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {missions.length > 0
                        ? Math.round(
                            (filledMissions.length / missions.length) * 100,
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Taux de pourvoi
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Stats détaillées ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {isLoading ? (
            <>
              <CompactStatsSkeleton />
              <CompactStatsSkeleton />
              <CompactStatsSkeleton />
              <CompactStatsSkeleton />
            </>
          ) : (
            <>
              <div className=" rounded-xl shadow-sm border border-gray-100 px-3 py-2.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {draftMissions.length}
                  </p>
                  <p className="text-[10px] text-gray-500">Brouillons</p>
                </div>
              </div>

              <div className=" rounded-xl shadow-sm border border-gray-100 px-3 py-2.5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {pendingApps.length}
                  </p>
                  <p className="text-[10px] text-gray-500">En attente</p>
                </div>
              </div>

              <div className=" rounded-xl shadow-sm border border-gray-100 px-3 py-2.5 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {acceptedApps.length}
                  </p>
                  <p className="text-[10px] text-gray-500">Acceptées</p>
                </div>
              </div>

              <div className=" rounded-xl shadow-sm border border-gray-100 px-3 py-2.5 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {rejectedApps.length}
                  </p>
                  <p className="text-[10px] text-gray-500">Non retenues</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Onglets ────────────────────────────────────────────────── */}
        <div className=" rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex gap-1 px-4 overflow-x-auto">
              <button
                onClick={() => setTab("published")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  tab === "published"
                    ? "border-green-950 text-green-950"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Briefcase size={16} />
                <span>Mes missions</span>
                {!isLoading && missionsData && (
                  <span className=" text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {missionsData.meta?.total || missions.length}
                  </span>
                )}
                {!isLoading && pendingApplicationsToReview > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
                    {pendingApplicationsToReview}
                  </span>
                )}
                {isLoading && (
                  <span className="h-5 w-8 bg-gray-200 rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setTab("applications")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  tab === "applications"
                    ? "border-green-950 text-green-950"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Send size={16} />
                <span>Mes candidatures</span>
                {!isLoading && applicationsData && (
                  <span className=" text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {applicationsData.meta?.total || applications.length}
                  </span>
                )}
                {isLoading && (
                  <span className="h-5 w-8 bg-gray-200 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* ── Filtres ────────────────────────────────────────────────── */}
          <div className="border-b border-gray-100 px-4 py-3 bg-gray-50/50">
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "thin" }}
            >
              {isLoading ? (
                // Skeletons des filtres
                <>
                  <FilterSkeleton />
                  <FilterSkeleton />
                  <FilterSkeleton />
                  <FilterSkeleton />
                  <FilterSkeleton />
                </>
              ) : tab === "published" ? (
                MISSION_STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setMissionFilter(f.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      missionFilter === f.value
                        ? "bg-green-950 text-white"
                        : " text-gray-600 hover: border border-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))
              ) : (
                APPLICATION_STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setAppFilter(f.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      appFilter === f.value
                        ? "bg-green-950 text-white"
                        : " text-gray-600 hover: border border-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Contenu ────────────────────────────────────────────────── */}
          <div className="p-4 sm:p-6">
            {tab === "published" ? (
              missionsLoading ? (
                <MissionsSkeleton />
              ) : missions.length === 0 ? (
                <EmptyState
                  icon={<Briefcase size={24} className="text-gray-400" />}
                  title="Aucune mission publiée"
                  description="Publiez votre première mission pour la voir apparaître ici."
                  actionLabel="Publier une mission"
                  onAction={() => setCreateOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {missions.map((mission) => (
                    <MyMissionCard key={mission.id} mission={mission} />
                  ))}
                </div>
              )
            ) : applicationsLoading ? (
              <ApplicationsSkeleton />
            ) : applications.length === 0 ? (
              <EmptyState
                icon={<Send size={24} className="text-gray-400" />}
                title="Aucune candidature envoyée"
                description="Parcourez les missions disponibles et postulez à celles qui vous intéressent."
                actionLabel="Voir les missions"
                actionHref="/missions"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {applications.map((application) => (
                  <MyApplicationCard
                    key={application.id}
                    application={application}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Modals ──────────────────────────────────────────────────── */}
        {createOpen && (
          <CreateMissionModal onClose={() => setCreateOpen(false)} />
        )}
        {reviewModalMission && <ReviewModal />}
      </div>
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16  rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>
      {actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm rounded-xl transition"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm rounded-xl transition"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ── Skeletons ──────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className=" rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse shrink-0" />
        <div>
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mt-1" />
        </div>
      </div>
    </div>
  );
}

function CompactStatsSkeleton() {
  return (
    <div className=" rounded-xl shadow-sm border border-gray-100 px-3 py-2.5 flex items-center gap-2">
      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      <div>
        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-2 w-12 bg-gray-200 rounded animate-pulse mt-0.5" />
      </div>
    </div>
  );
}

function FilterSkeleton() {
  return (
    <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
  );
}

function MissionsSkeleton() {
  return (
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
  );
}

function ApplicationsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className=" border border-gray-100 rounded-2xl p-5 space-y-4"
        >
          {/* Header with status */}
          <div className="flex justify-between items-start">
            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3">
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Message */}
          <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />

          {/* Actions */}
          <div className="flex gap-2">
            <div className="flex-1 h-9 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-9 w-20 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
