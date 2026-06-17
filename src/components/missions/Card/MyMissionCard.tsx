/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import {
  Users,
  Eye,
  Clock,
  Pencil,
  Trash2,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { Mission } from "@/lib/missions/types";
import {
  useUpdateMissionStatus,
  useDeleteMission,
} from "@/hooks/missions/useMissionMutate";
import MissionStatusBadge from "../MissionStatusBadge";

interface Props {
  mission: Mission;
}

const STATUS_TRANSITIONS: Record<
  string,
  { value: string; label: string; classes: string }[]
> = {
  draft: [
    {
      value: "published",
      label: "Publier",
      classes: "bg-[#154212] text-white hover:bg-[#2d5a27]",
    },
  ],
  published: [
    {
      value: "suspended",
      label: "Suspendre",
      classes: "border border-orange-200 text-orange-700 hover:bg-orange-50",
    },
    {
      value: "completed",
      label: "Marquer terminée",
      classes: "border border-blue-200 text-blue-700 hover:bg-blue-50",
    },
  ],
  suspended: [
    {
      value: "published",
      label: "Republier",
      classes: "bg-[#154212] text-white hover:bg-[#2d5a27]",
    },
  ],
  filled: [
    {
      value: "in_progress",
      label: "Démarrer",
      classes: "bg-[#154212] text-white hover:bg-[#2d5a27]",
    },
  ],
  in_progress: [
    {
      value: "completed",
      label: "Marquer terminée",
      classes: "border border-blue-200 text-blue-700 hover:bg-blue-50",
    },
  ],
  completed: [
    {
      value: "archived",
      label: "Archiver",
      classes: "border border-[#c2c9bb]/40 text-[#42493e] hover:bg-[#edefe7]",
    },
  ],
};

export default function MyMissionCard({ mission }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateStatus = useUpdateMissionStatus();
  const deleteMission = useDeleteMission();

  const transitions = STATUS_TRANSITIONS[mission.status] ?? [];
  const hasPendingApplications = (mission.pending_count ?? 0) > 0;

  return (
    <div className="bg-[#fafbf3] border border-[#c2c9bb]/30 rounded-2xl p-5 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {mission.category && (
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-full uppercase"
              style={{
                backgroundColor: `${mission.category.color}18`,
                color: mission.category.color,
              }}
            >
              {mission.category.name}
            </span>
          )}
          <MissionStatusBadge status={mission.status} size="xs" />
          {hasPendingApplications && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full uppercase">
              <AlertCircle size={10} /> {mission.pending_count} en attente
            </span>
          )}
        </div>

        {/* Menu actions */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 text-[#72796e] hover:bg-[#f3f4ed] rounded-lg transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#c2c9bb]/30 rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden">
                <Link
                  href={`/missions/${mission.ulid}/edit`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#42493e] hover:bg-[#f3f4ed] transition-colors"
                >
                  <Pencil size={14} /> Modifier
                </Link>
                <button
                  onClick={() => {
                    setConfirmDelete(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Titre */}
      <Link href={`/missions/${mission.ulid}`}>
        <h3 className="font-[Plus_Jakarta_Sans] text-lg font-semibold text-[#191c18] mb-2 hover:text-[#154212] transition-colors leading-snug">
          {mission.title}
        </h3>
      </Link>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-[#72796e] mb-4">
        <span className="flex items-center gap-1.5">
          <Users size={13} className="text-[#3b6934]" />
          {mission.applications_count} candidature
          {mission.applications_count !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye size={13} className="text-[#3b6934]" />
          {mission.views_count} vue{mission.views_count !== 1 ? "s" : ""}
        </span>
        {mission.start_date && (
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#3b6934]" />
            {new Date(mission.start_date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href={`/missions/${mission.ulid}/applications`}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#154212]/5 text-[#154212] text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#154212]/10 transition-colors"
        >
          <Users size={13} /> Candidatures
          {hasPendingApplications && (
            <span className="ml-1 bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
              {mission.pending_count}
            </span>
          )}
        </Link>

        {transitions.map((t) => (
          <button
            key={t.value}
            onClick={() =>
              updateStatus.mutate({ ulid: mission.ulid, status: t.value })
            }
            disabled={updateStatus.isPending}
            className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-60 ${t.classes}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#2e312c]/40 backdrop-blur-sm"
            onClick={() => setConfirmDelete(false)}
          />
          <div className="relative bg-[#f9faf2] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-[#c2c9bb]/30">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-[#191c18] mb-1">
              Supprimer "{mission.title}" ?
            </h3>
            <p className="text-sm text-[#72796e] mb-5">
              Cette action est irréversible.{" "}
              {mission.applications_count > 0 &&
                `${mission.applications_count} candidat(s) seront notifiés.`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 border border-[#c2c9bb]/40 text-[#42493e] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#edefe7] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteMission.mutate(mission.ulid)}
                disabled={deleteMission.isPending}
                className="flex-1 py-2.5 bg-red-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deleteMission.isPending ? "..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
