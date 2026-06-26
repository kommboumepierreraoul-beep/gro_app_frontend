"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  Clock,
  Banknote,
  Users,
  Calendar,
  Star,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Mission } from "@/lib/missions/types";
import { useMissionStore } from "@/stores/useMissionStore";
import MissionStatusBadge from "../MissionStatusBadge";
import MissionDetailModal from "./MissionDetailModal";

interface Props {
  mission: Mission;
  viewMode?: "grid" | "list";
  onViewDetails?: () => void;
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

// Fonction utilitaire pour obtenir le nom de l'auteur
function getAuthorName(author?: Mission["author"]): string {
  if (!author) return "Auteur";

  if (author.firstname && author.lastname) {
    return `${author.firstname} ${author.lastname}`;
  }
  if (author.firstname) {
    return author.firstname;
  }
  if (author.lastname) {
    return author.lastname;
  }
  return "Auteur";
}

// Fonction utilitaire pour obtenir l'initiale de l'auteur
function getAuthorInitial(author?: Mission["author"]): string {
  if (!author) return "A";

  const name = getAuthorName(author);
  return name.charAt(0).toUpperCase();
}

// Badge urgence : si expire dans moins de 3 jours
function isUrgent(mission: Mission): boolean {
  if (!mission.expires_at) return false;
  const diff = new Date(mission.expires_at).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

export default function MissionCard({
  mission,
  viewMode = "grid",
  onViewDetails,
}: Props) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const openApplyModal = useMissionStore((s) => s.openApplyModal);
  const missionUlid = mission.ulid || mission.id;

  const remuLabel = mission.remuneration_amount
    ? `${Number(mission.remuneration_amount).toLocaleString("fr-FR")} ${mission.remuneration_currency}`
    : (REMUNERATION_LABELS[mission.remuneration_type] ?? "");

  const durationLabel =
    mission.duration_type === "flexible"
      ? "Flexible"
      : `${mission.duration_value ?? ""}${DURATION_LABELS[mission.duration_type] ?? ""}`;

  const urgent = isUrgent(mission);

  // Handler pour ouvrir le modal de détails
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDetailModalOpen(true);
    if (onViewDetails) onViewDetails();
  };

  // Handler pour postuler
  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openApplyModal(mission.ulid);
  };

  // ── Vue liste ─────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <>
        <Link href={`/missions/${missionUlid}`} className="block">
          <article className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all duration-200 group hover:border-green-200 flex items-center gap-4">
            {/* Icône catégorie */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold"
              style={{ backgroundColor: mission.category?.color ?? "#154212" }}
            >
              {mission.category?.name?.[0] ?? "?"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {mission.category?.name ?? "Mission"}
                </span>
                {urgent && (
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Urgent
                  </span>
                )}
                <MissionStatusBadge status={mission.status} size="xs" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-green-950 transition-colors">
                {mission.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-gray-500">
                {mission.location_label && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {mission.location_label}
                    {mission.distance_km != null && (
                      <span className="text-green-950 font-medium ml-1">
                        · {mission.distance_km} km
                      </span>
                    )}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {durationLabel}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {mission.applications_count} candidature
                  {mission.applications_count !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className="font-bold text-green-950 text-base">
                {remuLabel}
              </span>
              <div className="flex gap-2">
                {/* Bouton Œil pour voir les détails */}
                <button
                  onClick={handleViewDetails}
                  className="p-2 text-gray-400 hover:text-green-950 hover:bg-green-50 rounded-lg transition-all duration-200"
                  title="Voir les détails"
                >
                  <Eye size={18} />
                </button>
                {mission.status === "published" && mission.isOpen && (
                  <button
                    onClick={handleApply}
                    className="px-3 py-1.5 text-xs font-semibold bg-green-950 text-white rounded-lg hover:bg-green-900 transition-all"
                  >
                    Postuler
                  </button>
                )}
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-green-950 transition"
                />
              </div>
            </div>
          </article>
        </Link>

        {/* Modal de détails */}
        <MissionDetailModal
          mission={mission}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      </>
    );
  }

  // ── Vue grille (défaut) ───────────────────────────────────────────────
  return (
    <>
      <Link href={`/missions/${missionUlid}`} className="block h-full">
        <article className="border border-gray-100 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-all duration-300 group hover:border-green-200 h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {urgent && (
                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                  Urgent
                </span>
              )}
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
            </div>
            <span className="text-green-950 font-bold text-xl shrink-0">
              {remuLabel}
            </span>
          </div>

          {/* Titre */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-950 transition-colors leading-snug">
            {mission.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
            {mission.description}
          </p>

          {/* Métadonnées */}
          <div className="space-y-2 mb-5 border-t border-gray-100 pt-4">
            {mission.location_label && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin size={15} className="text-green-950 shrink-0" />
                <span>{mission.location_label}</span>
                {mission.distance_km != null && (
                  <span className="ml-auto text-green-950 text-xs font-semibold">
                    {mission.distance_km} km
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-4 text-gray-600 text-sm">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-green-950" />
                {durationLabel}
              </span>
              {mission.start_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-green-950" />
                  {new Date(mission.start_date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
              <span className="flex items-center gap-1.5 ml-auto">
                <Users size={14} className="text-green-950" />
                {mission.applications_count}
              </span>
            </div>
          </div>

          {/* Auteur */}
          <div className="flex items-center gap-2 mb-5">
            {mission.author?.avatar ? (
              <img
                src={mission.author.avatar}
                alt={getAuthorName(mission.author)}
                className="w-7 h-7 rounded-full object-cover border-2 border-green-100"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-green-950 flex items-center justify-center text-white text-xs font-bold border-2 border-green-100">
                {getAuthorInitial(mission.author)}
              </div>
            )}
            <span className="text-xs text-gray-600 font-medium">
              {getAuthorName(mission.author)}
            </span>
            {mission.author?.rating && mission.author.rating > 0 && (
              <span className="flex items-center gap-0.5 ml-auto text-xs text-gray-500">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                {mission.author.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            {/* Bouton Œil pour voir les détails */}
            <button
              onClick={handleViewDetails}
              className="flex-1 py-3 border border-green-950 text-green-950 font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-green-950 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              Voir
            </button>
            {mission.status === "published" && mission.isOpen && (
              <button
                onClick={handleApply}
                className="flex-1 py-3 bg-green-950 text-white font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-green-900 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                Postuler
              </button>
            )}
          </div>
        </article>
      </Link>

      {/* Modal de détails */}
      <MissionDetailModal
        mission={mission}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  );
}
