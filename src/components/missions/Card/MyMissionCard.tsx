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
  MapPin,
  Calendar,
  Banknote,
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

const REMUNERATION_LABELS: Record<string, string> = {
  fixed: "Montant fixe",
  daily_rate: "Taux journalier",
  hourly_rate: "Taux horaire",
  negotiable: "À négocier",
  in_kind: "En nature",
  volunteer: "Bénévolat",
};

const DURATION_LABELS: Record<string, string> = {
  hours: "h",
  day: "journée",
  days: "j",
  weeks: "sem.",
  flexible: "flexible",
};

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

function getAuthorName(author?: Mission["author"]): string {
  if (!author) return "Auteur";

  const candidate = author as Mission["author"] & {
    name?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };

  const firstName = candidate.firstname ?? candidate.first_name;
  const lastName = candidate.lastname ?? candidate.last_name;
  const fullName = candidate.name ?? candidate.full_name;

  if (firstName && lastName) return `${firstName} ${lastName}`.trim();
  if (firstName) return firstName.trim();
  if (lastName) return lastName.trim();
  if (fullName) return fullName.trim();

  return "Auteur";
}

function getAuthorInitial(author?: Mission["author"]): string {
  if (!author) return "A";
  return getAuthorName(author).charAt(0).toUpperCase();
}

export default function MyMissionCard({ mission }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateStatus = useUpdateMissionStatus();
  const deleteMission = useDeleteMission();

  const transitions = STATUS_TRANSITIONS[mission.status] ?? [];
  const hasPendingApplications = (mission.pending_count ?? 0) > 0;
  const authorName = getAuthorName(mission.author);
  const authorInitial = getAuthorInitial(mission.author);
  const remuLabel = mission.remuneration_amount
    ? `${Number(mission.remuneration_amount).toLocaleString("fr-FR")} ${mission.remuneration_currency}`
    : (REMUNERATION_LABELS[mission.remuneration_type] ?? "");
  const durationLabel =
    mission.duration_type === "flexible"
      ? "Flexible"
      : `${mission.duration_value ?? ""}${DURATION_LABELS[mission.duration_type] ?? ""}`;

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

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <Link href={`/missions/${mission.ulid}`}>
            <h3 className="font-[Plus_Jakarta_Sans] text-lg font-semibold text-[#191c18] hover:text-[#154212] transition-colors leading-snug">
              {mission.title}
            </h3>
          </Link>
          <p className="text-sm text-[#72796e] mt-2 line-clamp-2 leading-relaxed">
            {mission.description}
          </p>
        </div>
        <span className="text-green-950 font-bold text-lg shrink-0">
          {remuLabel}
        </span>
      </div>

      <div className="space-y-2 mb-4 border-t border-gray-100 pt-4">
        {mission.location_label && (
          <div className="flex items-center gap-2 text-sm text-[#72796e]">
            <MapPin size={14} className="text-[#3b6934] shrink-0" />
            <span>{mission.location_label}</span>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-[#72796e] flex-wrap">
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#3b6934]" />
            {durationLabel}
          </span>
          {mission.start_date && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#3b6934]" />
              {new Date(mission.start_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
          <span className="flex items-center gap-1.5 ml-auto">
            <Users size={14} className="text-[#3b6934]" />
            {mission.applications_count} candidature
            {mission.applications_count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-5">
        {mission.author?.avatar ? (
          <img
            src={mission.author.avatar}
            alt={authorName}
            className="w-8 h-8 rounded-full object-cover border border-[#c2c9bb]/30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#154212] flex items-center justify-center text-white text-xs font-bold border border-[#c2c9bb]/30">
            {authorInitial}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#191c18]">{authorName}</p>
          <p className="text-[11px] text-[#72796e]">Créateur de la mission</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mt-auto">
        <Link
          href={`/missions/${mission.ulid}`}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl border border-[#154212] text-[#154212] hover:bg-[#154212] hover:text-white transition-colors"
          title="Voir les détails"
        >
          <Eye size={15} />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-[#154212] px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap">
            Voir les détails
          </span>
        </Link>

        <Link
          href={`/missions/${mission.ulid}/applications`}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#154212]/5 text-[#154212] hover:bg-[#154212]/10 transition-colors"
          title="Candidatures"
        >
          <Users size={15} />
          {hasPendingApplications && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-white">
              {mission.pending_count}
            </span>
          )}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-[#154212] px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap">
            Candidatures
          </span>
        </Link>

        {transitions.map((t) => (
          <button
            key={t.value}
            onClick={() =>
              updateStatus.mutate({ ulid: mission.ulid, status: t.value })
            }
            disabled={updateStatus.isPending}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors disabled:opacity-60 ${t.classes}`}
            title={t.label}
          >
            <span className="text-[11px]">{t.label.charAt(0)}</span>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-[#191c18] px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap">
              {t.label}
            </span>
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
