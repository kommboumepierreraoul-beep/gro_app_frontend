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

  return (
    <div className="w-full min-h-screen mx-auto p-4 sm:p-6 md:p-8 lg:p-12 pb-24 md:pb-12">
      {/* Header - Responsive */}
      <header className="flex flex-col sm:flex-row sm:items-start md:items-end justify-between gap-4 mb-6 md:mb-8">
        <div className="flex-1">
          <p className="text-[#3b6934] font-semibold text-[10px] sm:text-xs tracking-widest uppercase mb-1">
            Mon espace
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#191c18]">
            Tableau de bord missions
          </h1>
          <p className="text-xs sm:text-sm text-[#72796e] mt-1">
            Gérez vos missions publiées et suivez vos candidatures
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#154212] text-white font-semibold text-[10px] sm:text-xs tracking-widest uppercase py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:bg-[#2d5a27] hover:shadow-xl transition-all active:scale-95 shrink-0 w-full sm:w-auto"
        >
          <Plus size={16} className="sm:h-4 sm:w-4" />
          <span className="sm:inline">Publier une mission</span>
        </button>
      </header>

      {/* Onglets - Horizontal scroll sur mobile */}
      <div className="relative mb-6">
        <div className="flex gap-1 sm:gap-2 border-b border-[#c2c9bb]/20 overflow-x-auto pb-px -mb-px">
          <button
            onClick={() => setTab("published")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === "published"
                ? "border-[#154212] text-[#154212]"
                : "border-transparent text-[#72796e] hover:text-[#42493e]"
            }`}
          >
            <Briefcase size={14} className="sm:h-3.5 sm:w-3.5" />
            <span>Mes missions</span>
            {missionsData && (
              <span className="bg-[#e2e3dc] text-[#42493e] text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {missionsData.meta?.total}
              </span>
            )}
            {pendingApplicationsToReview > 0 && (
              <span className="bg-amber-400 text-white text-[9px] sm:text-[10px] font-bold min-w-[18px] h-[18px] sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                {pendingApplicationsToReview}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("applications")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === "applications"
                ? "border-[#154212] text-[#154212]"
                : "border-transparent text-[#72796e] hover:text-[#42493e]"
            }`}
          >
            <Send size={14} className="sm:h-3.5 sm:w-3.5" />
            <span>Mes candidatures</span>
            {applicationsData && (
              <span className="bg-[#e2e3dc] text-[#42493e] text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {applicationsData.meta?.total}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filtres - Scroll horizontal sur mobile */}
      <div className="relative mb-6">
        <div
          className="flex gap-2 overflow-x-auto pb-2 -mb-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {tab === "published"
            ? MISSION_STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setMissionFilter(f.value)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    missionFilter === f.value
                      ? "bg-[#154212] text-white"
                      : "bg-[#f3f4ed] text-[#42493e] hover:bg-[#e2e3dc]"
                  }`}
                >
                  {f.label}
                </button>
              ))
            : APPLICATION_STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setAppFilter(f.value)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    appFilter === f.value
                      ? "bg-[#154212] text-white"
                      : "bg-[#f3f4ed] text-[#42493e] hover:bg-[#e2e3dc]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
        </div>
      </div>

      {/* Contenu - Grille responsive */}
      {tab === "published" ? (
        missionsLoading ? (
          <LoadingState />
        ) : missions.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={24} className="text-[#72796e]" />}
            title="Aucune mission publiée"
            description="Publiez votre première mission pour la voir apparaître ici."
            actionLabel="Publier une mission"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {missions.map((mission) => (
              <MyMissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        )
      ) : applicationsLoading ? (
        <LoadingState />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<Send size={24} className="text-[#72796e]" />}
          title="Aucune candidature envoyée"
          description="Parcourez les missions disponibles et postulez à celles qui vous intéressent."
          actionLabel="Voir les missions"
          actionHref="/missions"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {applications.map((application) => (
            <MyApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}

      {/* Modals */}
      {createOpen && (
        <CreateMissionModal onClose={() => setCreateOpen(false)} />
      )}
      {reviewModalMission && <ReviewModal />}
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16 sm:py-20">
      <Loader2 className="animate-spin text-[#154212]" size={24} />
    </div>
  );
}

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
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#f3f4ed] rounded-full flex items-center justify-center mb-3 sm:mb-4">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-[#191c18] mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#72796e] max-w-sm mb-4 sm:mb-5">
        {description}
      </p>
      {actionHref ? (
        <Link
          href={actionHref}
          className="flex items-center gap-2 bg-[#154212] text-white font-semibold text-[10px] sm:text-xs tracking-widest uppercase py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:bg-[#2d5a27] transition-all active:scale-95"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="flex items-center gap-2 bg-[#154212] text-white font-semibold text-[10px] sm:text-xs tracking-widest uppercase py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:bg-[#2d5a27] transition-all active:scale-95"
        >
          <Plus size={14} className="sm:h-3.5 sm:w-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
