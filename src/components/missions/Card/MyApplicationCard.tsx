/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { MapPin, Clock, X, Star, PartyPopper, CheckCircle, Mail, Sparkles } from "lucide-react";
import { MissionApplication } from "@/lib/missions/types";
import { useWithdrawApplication } from "@/hooks/missions/useMissionMutate";
import { useMissionStore } from "@/stores/useMissionStore";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface Props {
  application: MissionApplication;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending: { label: "En attente", classes: "bg-amber-50 text-amber-700" },
  accepted: { label: "✓ Accepté", classes: "bg-[#eaf3de] text-[#154212]" },
  rejected: { label: "Non retenu", classes: "bg-red-50 text-red-600" },
  withdrawn: { label: "Retiré", classes: "bg-[#f3f4ed] text-[#72796e]" },
  confirmed: { label: "Confirmé", classes: "bg-blue-50 text-blue-700" },
};

const REMUNERATION_LABELS: Record<string, string> = {
  fixed: "Montant fixe",
  daily_rate: "Journalier",
  hourly_rate: "Horaire",
  negotiable: "À négocier",
  in_kind: "En nature",
  volunteer: "Bénévolat",
};

export default function MyApplicationCard({ application }: Props) {
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const withdraw = useWithdrawApplication();
  const openReviewModal = useMissionStore((s) => s.openReviewModal);

  const { mission } = application;
  const status = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.pending;

  // Récupérer les détails complets de la mission (avec l'auteur)
  const { data: missionDetails, isLoading: isLoadingMission } = useQuery({
    queryKey: ["mission", mission.ulid],
    queryFn: async () => {
      const response = await api.get(`/missions/${mission.ulid}`);
      return response.data.data;
    },
    enabled: !mission.author, // Seulement si l'auteur n'est pas déjà présent
  });

  const remuLabel = mission.remuneration_amount
    ? `${Number(mission.remuneration_amount).toLocaleString("fr-FR")} ${mission.remuneration_currency}`
    : (REMUNERATION_LABELS[mission.remuneration_type] ?? "");

  const canWithdraw = ["pending", "accepted"].includes(application.status);
  const canReview =
    application.status === "accepted" && mission.status === "completed";

  // Utiliser l'auteur depuis missionDetails si disponible, sinon mission.author
  const author = missionDetails?.author || mission.author;
  const authorFirstname = author?.firstname ?? "";
  const authorLastname = author?.lastname ?? "";
  const authorFullName =
    [authorFirstname, authorLastname].filter(Boolean).join(" ").trim() ||
    author?.name ||
    "Auteur";
  const authorAvatar = author?.avatar ?? mission.author?.avatar;
  const authorRating = author?.rating;

  const isLoading = isLoadingMission && !mission.author;

  // Obtenir l'initiale pour l'avatar par défaut
  const getInitial = () => {
    if (authorFirstname && authorFirstname.length > 0) {
      return authorFirstname.charAt(0).toUpperCase();
    }
    if (authorLastname && authorLastname.length > 0) {
      return authorLastname.charAt(0).toUpperCase();
    }
    if (author?.name && author.name.length > 0) {
      return author.name.charAt(0).toUpperCase();
    }
    return "?";
  };

  return (
    <div className="bg-[#fafbf3] border border-[#c2c9bb]/30 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
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
          <span
            className={`${status.classes} text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full`}
          >
            {status.label}
          </span>
        </div>
        <span className="font-bold text-[#154212] text-base font-[Inter] shrink-0">
          {remuLabel}
        </span>
      </div>

      <Link href={`/missions/${mission.ulid}`}>
        <h3 className="text-lg font-semibold text-[#191c18] mb-2 hover:text-[#154212] transition-colors leading-snug">
          {mission.title}
        </h3>
      </Link>

      <div className="flex items-center gap-4 text-xs text-[#72796e] mb-4">
        {mission.location_label && (
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-[#3b6934]" />
            {mission.location_label}
          </span>
        )}
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

      {/* Auteur - avec firstname, lastname et avatar */}
      <div className="flex items-center gap-2 mb-5">
        {isLoading ? (
          <div className="w-7 h-7 rounded-full bg-[#e2e3dc] animate-pulse border-2 border-[#bcf0ae]" />
        ) : authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorFullName}
            className="w-7 h-7 rounded-full object-cover border-2 border-[#bcf0ae]"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#2d5a27] flex items-center justify-center text-white text-xs font-bold border-2 border-[#bcf0ae]">
            {getInitial()}
          </div>
        )}
        <span className="text-xs text-[#42493e] font-medium">
          {authorFullName}
        </span>
        {!isLoading && authorRating !== undefined && authorRating > 0 && (
          <span className="flex items-center gap-0.5 ml-auto text-xs text-[#72796e]">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            {authorRating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Notification statut */}
      {application.status === "accepted" && (
        <div className="bg-gradient-to-r from-[#eaf3de] to-[#d4e8c4] border border-[#bcf0ae] rounded-xl p-4 mb-3 shadow-lg animate-slide-down">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-[#154212] rounded-full flex items-center justify-center animate-bounce-subtle">
                <PartyPopper size={20} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-[#154212] animate-pulse" />
                <h4 className="font-bold text-[#154212]">Félicitations !</h4>
              </div>
              <p className="text-sm text-[#154212] mb-2">
                Vous avez été retenu(e) pour cette mission.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#2d5a27]">
                <Mail size={12} />
                <span>Vérifiez votre email pour les détails</span>
              </div>
            </div>
            <CheckCircle
              size={20}
              className="text-[#3b6934] flex-shrink-0 animate-scale"
            />
          </div>
        </div>
      )}
      {application.status === "rejected" && application.rejection_reason && (
        <div className="bg-[#f3f4ed] rounded-xl p-3 mb-3 text-sm text-[#42493e]">
          <span className="font-medium">Message de l'auteur :</span>{" "}
          {application.rejection_reason}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {canReview && (
          <button
            onClick={() =>
              openReviewModal({
                ulid: mission.ulid,
                direction: "applicant_to_author",
              })
            }
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Star size={13} /> Évaluer la mission
          </button>
        )}

        {canWithdraw && !confirmWithdraw && (
          <button
            onClick={() => setConfirmWithdraw(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-red-50 transition-colors ml-auto"
          >
            <X size={13} /> Retirer ma candidature
          </button>
        )}

        {confirmWithdraw && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-[#42493e]">
              Confirmer le retrait ?
            </span>
            <button
              onClick={() => withdraw.mutate(application.id)}
              disabled={withdraw.isPending}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600"
            >
              Oui
            </button>
            <button
              onClick={() => setConfirmWithdraw(false)}
              className="px-3 py-1.5 text-xs font-semibold text-[#72796e]"
            >
              Non
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
