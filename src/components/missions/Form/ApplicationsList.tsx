"use client";

import { useState } from "react";
import { Loader2, Inbox } from "lucide-react";
import { useMissionApplications } from "@/hooks/missions/useMissions";
import { Mission, ApplicationStatus } from "@/lib/missions/types";
import ApplicationCard from "../Card/ApplicationCard";

interface Props {
  mission: Mission;
}

const FILTERS: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Acceptées" },
  { value: "rejected", label: "Refusées" },
  { value: "withdrawn", label: "Retirées" },
];

export default function ApplicationsList({ mission }: Props) {
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");

  const { data, isLoading } = useMissionApplications(
    mission.ulid,
    filter === "all" ? undefined : { status: filter },
  );

  const stats = data?.stats;
  const applications = data?.data ?? [];
  const missionCompleted = mission.status === "completed";

  return (
    <div className="space-y-5">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "En attente",
              value: stats.pending,
              color: "text-amber-700",
              bg: "bg-amber-50",
            },
            {
              label: "Acceptées",
              value: stats.accepted,
              color: "text-[#154212]",
              bg: "bg-[#eaf3de]",
            },
            {
              label: "Refusées",
              value: stats.rejected,
              color: "text-red-600",
              bg: "bg-red-50",
            },
            {
              label: "Retirées",
              value: stats.withdrawn,
              color: "text-[#72796e]",
              bg: "bg-[#f3f4ed]",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-2xl p-4 text-center`}
            >
              <p className={`text-2xl font-bold font-[Inter] ${s.color}`}>
                {s.value}
              </p>
              <p className="text-[10px] text-[#72796e] font-medium uppercase tracking-wider mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f.value
                ? "bg-[#154212] text-white"
                : "bg-[#f3f4ed] text-[#42493e] hover:bg-[#e2e3dc]"
            }`}
          >
            {f.label}
            {f.value !== "all" &&
              stats &&
              ` (${stats[f.value as keyof typeof stats] ?? 0})`}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#154212]" size={24} />
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-[#f3f4ed] rounded-full flex items-center justify-center mb-3">
            <Inbox size={24} className="text-[#72796e]" />
          </div>
          <p className="text-sm text-[#42493e] font-medium">
            Aucune candidature {filter !== "all" ? "dans cette catégorie" : ""}
          </p>
          <p className="text-xs text-[#72796e] mt-1">
            {filter === "all"
              ? "Les candidatures apparaîtront ici dès qu'un membre postulera."
              : ""}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              ulid={mission.ulid}
              missionCompleted={missionCompleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
