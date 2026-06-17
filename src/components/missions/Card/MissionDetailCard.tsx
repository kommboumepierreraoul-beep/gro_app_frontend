/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Banknote,
  Users,
  Star,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Award,
} from "lucide-react";
import { Mission } from "@/lib/missions/types";
import { useMissionStore } from "@/stores/useMissionStore";
import { useMission } from "@/hooks/missions/useMissions";
import MissionStatusBadge from "../MissionStatusBadge";
import MissionMap from "../Map/MissionDetailMap";

interface Props {
  mission: Mission; // mission partielle depuis la liste
  onClose: () => void;
}

const REMUNERATION_LABELS: Record<string, string> = {
  fixed: "Montant fixe",
  daily_rate: "Taux journalier",
  hourly_rate: "Taux horaire",
  negotiable: "À négocier",
  in_kind: "En nature",
  volunteer: "Bénévolat",
};

export default function MissionDetailModal({
  mission: partialMission,
  onClose,
}: Props) {
  const openApplyModal = useMissionStore((s) => s.openApplyModal);

  // Charger la mission complète avec reviews/coords
  const { data: fullMission } = useMission(partialMission.ulid);
  const mission = fullMission ?? partialMission;

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const remuLabel = mission.remuneration_amount
    ? `${Number(mission.remuneration_amount).toLocaleString("fr-FR")} ${mission.remuneration_currency}`
    : (REMUNERATION_LABELS[mission.remuneration_type] ?? "");

  const whatsappContact = mission.contact_methods?.find(
    (c: any) => c.type === "whatsapp",
  );
  const emailContact = mission.contact_methods?.find(
    (c: any) => c.type === "email",
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2e312c]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenu */}
      <div className="relative bg-[#f9faf2] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-[#c2c9bb]/30">
        {/* ── Colonne gauche : image + infos auteur ──────────────────── */}
        <div className="md:w-5/12 bg-[#edefe7] relative flex flex-col">
          {/* Image ou fond catégorie */}
          <div className="h-56 md:h-auto md:flex-1 relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: mission.category?.color ?? "#154212",
                opacity: 0.15,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold"
                style={{
                  backgroundColor: mission.category?.color ?? "#154212",
                }}
              >
                {mission.category?.name?.[0] ?? mission.title[0]}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#2e312c]/50 to-transparent" />
            <div className="absolute bottom-5 left-5">
              {mission.category && (
                <span
                  className="text-[10px] font-bold px-3 py-1 rounded-full uppercase text-white"
                  style={{ backgroundColor: mission.category.color }}
                >
                  {mission.category.name}
                </span>
              )}
              <h2 className="font-[Plus_Jakarta_Sans] text-2xl font-bold text-white mt-2 leading-tight">
                {mission.title}
              </h2>
            </div>
          </div>

          {/* Auteur */}
          <div className="p-5 border-t border-[#c2c9bb]/20">
            <p className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest mb-3">
              Publié par
            </p>
            <div className="flex items-center gap-3">
              {mission.author.avatar ? (
                <img
                  src={mission.author.avatar}
                  alt={mission.author.firstname}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#bcf0ae]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#2d5a27] flex items-center justify-center text-white font-bold border-2 border-[#bcf0ae]">
                  {mission.author.firstname}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#191c18] text-sm">
                  {mission.author.firstname}
                </p>
                {mission.author.rating > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={10}
                        className={
                          i <= Math.round(mission.author.rating ?? 10)
                            ? "fill-amber-400 text-amber-400"
                            : "text-[#c2c9bb]"
                        }
                      />
                    ))}
                    <span className="text-[10px] text-[#72796e] ml-1">
                      {mission.author.rating.toFixed(1)} (
                      {mission.author.reviews_count ?? 10})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats mission */}
          <div className="grid grid-cols-2 gap-2 px-5 pb-5">
            <div className="bg-white/60 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-[#154212] font-[Inter]">
                {mission.applications_count}
              </p>
              <p className="text-[10px] text-[#72796e]">
                Candidature{mission.applications_count > 1 ? "s" : ""}
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-[#154212] font-[Inter]">
                {mission.views_count}
              </p>
              <p className="text-[10px] text-[#72796e]">
                Vue{mission.views_count > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* ── Colonne droite : détails ────────────────────────────────── */}
        <div className="md:w-7/12 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start p-6 pb-4">
            <div>
              <p className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                Rémunération
              </p>
              <p className="font-[Inter] text-3xl font-bold text-[#154212] mt-1">
                {remuLabel}
                {mission.remuneration_type === "daily_rate" && (
                  <span className="text-sm font-normal text-[#72796e] ml-1">
                    / jour
                  </span>
                )}
                {mission.remuneration_type === "hourly_rate" && (
                  <span className="text-sm font-normal text-[#72796e] ml-1">
                    / heure
                  </span>
                )}
              </p>
              {mission.remuneration_conditions && (
                <p className="text-xs text-[#42493e] mt-1">
                  {mission.remuneration_conditions}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <MissionStatusBadge status={mission.status} />
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#edefe7] rounded-full transition-colors text-[#42493e]"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scroll area */}
          <div
            className="flex-1 overflow-y-auto px-6 pb-6 space-y-5"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Infos clés */}
            <div className="grid grid-cols-2 gap-3">
              {mission.location_label && (
                <div className="flex items-start gap-2 bg-[#f3f4ed] rounded-xl p-3">
                  <MapPin
                    size={15}
                    className="text-[#154212] mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-[10px] text-[#72796e] font-medium uppercase tracking-wider">
                      Lieu
                    </p>
                    <p className="text-sm text-[#191c18] font-medium">
                      {mission.location_label}
                    </p>
                    {mission.distance_km != null && (
                      <p className="text-xs text-[#3b6934] font-semibold">
                        {mission.distance_km} km de vous
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2 bg-[#f3f4ed] rounded-xl p-3">
                <Clock size={15} className="text-[#154212] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#72796e] font-medium uppercase tracking-wider">
                    Durée
                  </p>
                  <p className="text-sm text-[#191c18] font-medium">
                    {mission.duration_type === "flexible"
                      ? "Flexible"
                      : `${mission.duration_value} ${mission.duration_type}`}
                  </p>
                </div>
              </div>
              {mission.start_date && (
                <div className="flex items-start gap-2 bg-[#f3f4ed] rounded-xl p-3">
                  <Calendar
                    size={15}
                    className="text-[#154212] mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-[10px] text-[#72796e] font-medium uppercase tracking-wider">
                      Début
                    </p>
                    <p className="text-sm text-[#191c18] font-medium">
                      {new Date(mission.start_date).toLocaleDateString(
                        "fr-FR",
                        { weekday: "short", day: "numeric", month: "long" },
                      )}
                    </p>
                  </div>
                </div>
              )}
              {mission.max_applications && (
                <div className="flex items-start gap-2 bg-[#f3f4ed] rounded-xl p-3">
                  <Users size={15} className="text-[#154212] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#72796e] font-medium uppercase tracking-wider">
                      Places
                    </p>
                    <p className="text-sm text-[#191c18] font-medium">
                      {mission.applications_count} / {mission.max_applications}
                    </p>
                    <div className="h-1 bg-[#e2e3dc] rounded-full mt-1 w-20">
                      <div
                        className="h-1 bg-[#154212] rounded-full"
                        style={{
                          width: `${Math.min(100, (mission.applications_count / mission.max_applications) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {mission.lat && mission.lng && (
              <MissionMap
                missionTitle={mission.title}
                missionLat={mission.lat}
                missionLng={mission.lng}
              />
            )}

            {/* Description */}
            <div>
              <h4 className="font-semibold text-[#191c18] mb-2">
                Description du projet
              </h4>
              <p className="text-[#42493e] text-sm leading-relaxed">
                {mission.description}
              </p>
            </div>

            {/* Profil souhaité */}
            {mission.desired_profile && (
              <div>
                <h4 className="font-semibold text-[#191c18] mb-2 flex items-center gap-2">
                  <Award size={15} className="text-[#3b6934]" />
                  Profil recherché
                </h4>
                <div className="bg-[#eaf3de] border border-[#bcf0ae] rounded-xl p-4">
                  <p className="text-[#154212] text-sm leading-relaxed">
                    {mission.desired_profile}
                  </p>
                </div>
              </div>
            )}

            {/* Contacts */}
            {mission.contact_methods && mission.contact_methods.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#191c18] mb-2">
                  Moyens de contact
                </h4>
                <div className="flex flex-wrap gap-2">
                  {mission.contact_methods.map((c: any, i: any) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 text-xs bg-[#f3f4ed] border border-[#c2c9bb]/30 px-3 py-1.5 rounded-lg text-[#42493e] font-medium"
                    >
                      {c.type === "app_message" && (
                        <>
                          <MessageCircle size={12} className="text-[#154212]" />{" "}
                          Messagerie GRO
                        </>
                      )}
                      {c.type === "whatsapp" && (
                        <>
                          <Phone size={12} className="text-green-600" />{" "}
                          WhatsApp
                        </>
                      )}
                      {c.type === "email" && (
                        <>
                          <Mail size={12} className="text-blue-600" /> Email
                        </>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Avis */}
            {fullMission?.reviews && fullMission.reviews.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#191c18] mb-2">
                  Avis sur l'auteur
                </h4>
                <div className="space-y-2">
                  {fullMission.reviews.slice(0, 2).map((review: any) => (
                    <div
                      key={review.id}
                      className="bg-[#f3f4ed] rounded-xl p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-[#2d5a27] flex items-center justify-center text-white text-[10px] font-bold">
                          {review.reviewer.name[0]}
                        </div>
                        <span className="text-xs font-medium text-[#191c18]">
                          {review.reviewer.name}
                        </span>
                        <div className="flex ml-auto">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={10}
                              className={
                                i <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-[#c2c9bb]"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-[#42493e] leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-5 border-t border-[#c2c9bb]/20 bg-[#f3f4ed]">
            {mission.status === "published" ? (
              <div className="flex gap-3">
                {whatsappContact?.value && (
                  <a
                    href={`https://wa.me/${whatsappContact.value.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre mission "${mission.title}" sur AgriPulse. Pouvons-nous en parler? `)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-all"
                  >
                    <Phone size={15} /> WhatsApp
                  </a>
                )}
                <button
                  onClick={() => {
                    onClose();
                    openApplyModal(mission.ulid);
                  }}
                  className="flex-1 bg-[#154212] text-white font-semibold text-xs tracking-widest uppercase py-3 rounded-xl hover:bg-[#2d5a27] shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  Accepter / Postuler à la mission
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-[#72796e]">
                  Cette mission n'est plus disponible aux candidatures.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
