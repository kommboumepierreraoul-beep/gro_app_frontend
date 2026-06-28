/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Users,
  Star,
  MessageCircle,
  Phone,
  Mail,
  Award,
  Flag,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useMission } from "@/hooks/missions/useMissions";
import {
  useDeleteMission,
  useUpdateMissionStatus,
} from "@/hooks/missions/useMissionMutate";
import { useMissionStore } from "@/stores/useMissionStore";
import ApplicationModal from "@/components/missions/Form/ApplicationModal";
import MissionStatusBadge from "@/components/missions/MissionStatusBadge";
import MissionRouteMap from "@/components/missions/Map/MissionRouteMap";

const REMUNERATION_LABELS: Record<string, string> = {
  fixed: "Montant fixe",
  daily_rate: "Taux journalier",
  hourly_rate: "Taux horaire",
  negotiable: "À négocier",
  in_kind: "En nature",
  volunteer: "Bénévolat",
};

// Récupérer l'ID de l'utilisateur courant (à adapter selon votre auth)
function useCurrentUserId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("");
  return raw ? Number(raw) : null;
}

export default function MissionDetailPage() {
  const { ulid } = useParams<{ ulid: string }>();
  const router = useRouter();
  const currentUserId = useCurrentUserId();

  const { data: mission, isLoading } = useMission(ulid);
  const deleteMission = useDeleteMission();
  const updateStatus = useUpdateMissionStatus();

  const openApplyModal = useMissionStore((s) => s.openApplyModal);
  const applyModalMissionUlid = useMissionStore((s) => s.applyModalMissionUlid);
  const closeApplyModal = useMissionStore((s) => s.closeApplyModal);

  const [reportOpen, setReportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="md:ml-64 flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#154212]" size={32} />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="md:ml-64 flex flex-col items-center justify-center h-screen gap-3">
        <AlertTriangle size={32} className="text-[#72796e]" />
        <p className="text-[#42493e]">Mission introuvable.</p>
        <button
          onClick={() => router.back()}
          className="text-[#154212] text-sm font-semibold hover:underline"
        >
          Retour aux missions
        </button>
      </div>
    );
  }

  const isOwner = currentUserId === mission.author.id;

  const remuLabel = mission.remuneration_amount
    ? `${Number(mission.remuneration_amount).toLocaleString("fr-FR")} ${mission.remuneration_currency}`
    : (REMUNERATION_LABELS[mission.remuneration_type] ?? "");

  const whatsappContact = mission.contact_methods?.find(
    (c) => c.type === "whatsapp",
  );
  const emailContact = mission.contact_methods?.find((c) => c.type === "email");

  const handleDelete = () => {
    deleteMission.mutate(mission.ulid, {
      onSuccess: () => router.push("/missions/dashboard"),
    });
  };

  return (
    <div className="md:ml-10 max-w-6xl mx-autop md:p-12 pb-32 md:pb-12">
      {/* Header navigation */}
      <div className="flex items-center justify-between mb-6">
        {/* Bouton de retour avec navigation arrière */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#42493e] text-sm font-medium hover:text-[#154212] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Retour aux missions
        </button>

        {/* Actions auteur */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              href={`/missions/${mission.ulid}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#c2c9bb]/40 text-[#42493e] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#edefe7] transition-colors"
            >
              <Pencil size={13} /> Modifier
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        )}

        {/* Signalement (non-auteur) */}
        {!isOwner && (
          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-[#72796e] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Flag size={13} /> Signaler
          </button>
        )}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <div className="bg-[#fafbf3] border border-[#c2c9bb]/30 rounded-2xl p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {mission.category && (
                <span
                  className="text-[10px] font-bold px-3 py-1 rounded-full uppercase"
                  style={{
                    backgroundColor: `${mission.category.color}18`,
                    color: mission.category.color,
                  }}
                >
                  {mission.category.name}
                </span>
              )}
              <MissionStatusBadge status={mission.status} />
            </div>

            <h1 className="font-[Plus_Jakarta_Sans] text-3xl font-bold text-[#191c18] mb-4 leading-tight">
              {mission.title}
            </h1>

            {/* Auteur */}
            <div className="flex items-center gap-3 mb-6">
              {mission.author.avatar ? (
                <img
                  src={mission.author.avatar}
                  alt={mission.author.firstname}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#bcf0ae]"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#2d5a27] flex items-center justify-center text-white font-bold border-2 border-[#bcf0ae]">
                  {mission.author.firstname}
                </div>
              )}
              <div>
                <p className="font-semibold text-[#191c18] text-sm">
                  {mission.author.firstname}
                </p>
                
              </div>
            </div>

            {/* Infos clés */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-6">
              {mission.location_label && (
                <div className="bg-[#f3f4ed] rounded-xl p-3">
                  <p className="text-[9px] text-[#72796e] font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <MapPin size={10} /> Lieu
                  </p>
                  <p className="text-sm font-medium text-[#191c18]">
                    {mission.location_label}
                  </p>
                </div>
              )}
              <div className="bg-[#f3f4ed] rounded-xl p-3">
                <p className="text-[9px] text-[#72796e] font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Clock size={10} /> Durée
                </p>
                <p className="text-sm font-medium text-[#191c18]">
                  {mission.duration_type === "flexible"
                    ? "Flexible"
                    : `${mission.duration_value} ${mission.duration_type}`}
                </p>
              </div>
              {mission.start_date && (
                <div className="bg-[#f3f4ed] rounded-xl p-3">
                  <p className="text-[9px] text-[#72796e] font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Calendar size={10} /> Début
                  </p>
                  <p className="text-sm font-medium text-[#191c18]">
                    {new Date(mission.start_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              )}
              <div className="bg-[#f3f4ed] rounded-xl p-3">
                <p className="text-[9px] text-[#72796e] font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Users size={10} /> Candidatures
                </p>
                <p className="text-sm font-medium text-[#191c18]">
                  {mission.applications_count}
                  {mission.max_applications
                    ? ` / ${mission.max_applications}`
                    : ""}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-[#191c18] mb-2">Description</h3>
              <p className="text-[#42493e] text-sm leading-relaxed whitespace-pre-line">
                {mission.description}
              </p>
            </div>

            {/* Profil souhaité */}
            {mission.desired_profile && (
              <div className="mb-6">
                <h3 className="font-semibold text-[#191c18] mb-2 flex items-center gap-2">
                  <Award size={15} className="text-[#3b6934]" /> Profil
                  recherché
                </h3>
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
                <h3 className="font-semibold text-[#191c18] mb-2">
                  Moyens de contact
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mission.contact_methods.map((c, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 text-xs bg-[#f3f4ed] border border-[#c2c9bb]/30 px-3 py-1.5 rounded-lg text-[#42493e] font-medium"
                    >
                      {c.type === "app_message" && (
                        <>
                          <MessageCircle size={12} className="text-[#154212]" />{" "}
                          Messagerie AgriPulse
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
          </div>

          {/* Itinéraire */}
          {mission.lat != null && mission.lng != null && (
            <div className="bg-[#fafbf3] border border-[#c2c9bb]/30 rounded-2xl p-6">
              <h3 className="font-semibold text-[#191c18] mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-[#154212]" /> Itinéraire vers
                la mission
              </h3>
              <div className="h-72 rounded-xl overflow-hidden">
                <MissionRouteMap
                  destination={{
                    lat: mission.lat,
                    lng: mission.lng,
                    label: mission.location_label,
                  }}
                />
              </div>
            </div>
          )}

          {/* Avis */}
          {mission.reviews && mission.reviews.length > 0 && (
            <div className="bg-[#fafbf3] border border-[#c2c9bb]/30 rounded-2xl p-6">
              <h3 className="font-semibold text-[#191c18] mb-3">
                Avis sur l'auteur
              </h3>
              <div className="space-y-3">
                {mission.reviews.map((review) => (
                  <div key={review.id} className="bg-[#f3f4ed] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-[#2d5a27] flex items-center justify-center text-white text-xs font-bold">
                        {review.reviewer.name[0]}
                      </div>
                      <span className="text-sm font-medium text-[#191c18]">
                        {review.reviewer.name}
                      </span>
                      <div className="flex ml-auto">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={11}
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
                      <p className="text-sm text-[#42493e] leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar sticky */}
        <div className="space-y-4">
          <div className="bg-[#fafbf3] border border-[#c2c9bb]/30 rounded-2xl p-6 sticky top-6">
            <p className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
              Rémunération
            </p>
            <p className="font-[Inter] text-3xl font-bold text-[#154212] mt-1 mb-1">
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
              <p className="text-xs text-[#42493e] mb-4">
                {mission.remuneration_conditions}
              </p>
            )}

            {/* Progression candidatures */}
            {mission.max_applications && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-[#72796e] mb-1">
                  <span>Places</span>
                  <span className="font-semibold text-[#154212]">
                    {mission.applications_count} / {mission.max_applications}
                  </span>
                </div>
                <div className="h-1.5 bg-[#e2e3dc] rounded-full">
                  <div
                    className="h-1.5 bg-[#154212] rounded-full"
                    style={{
                      width: `${Math.min(100, (mission.applications_count / mission.max_applications) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bouton candidature */}
            {!isOwner &&
              mission.status === "published" &&
              (mission.user_application ? (
                <div className="bg-[#eaf3de] border border-[#bcf0ae] rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-[#154212]">
                    {mission.user_application.status === "pending" &&
                      "Candidature en attente"}
                    {mission.user_application.status === "accepted" &&
                      "✓ Candidature acceptée !"}
                    {mission.user_application.status === "rejected" &&
                      "Candidature non retenue"}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => openApplyModal(mission.ulid)}
                  className="w-full bg-[#154212] text-white font-semibold text-xs tracking-widest uppercase py-3.5 rounded-xl shadow-lg hover:bg-[#2d5a27] hover:shadow-xl transition-all active:scale-95"
                >
                  Postuler à la mission
                </button>
              ))}

            {/* WhatsApp direct */}
            {!isOwner &&
              whatsappContact?.value &&
              mission.status === "published" && (
                <a
                  href={`https://wa.me/${whatsappContact.value.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre mission "${mission.title}" sur AgriPulse.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-2 py-3 border border-green-500 text-green-600 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-green-50 transition-colors"
                >
                  <Phone size={14} /> WhatsApp
                </a>
              )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#e2e3dc]">
              <div className="text-center">
                <p className="text-lg font-bold text-[#154212] font-[Inter]">
                  {mission.applications_count}
                </p>
                <p className="text-[10px] text-[#72796e]">Candidatures</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#154212] font-[Inter]">
                  {mission.views_count}
                </p>
                <p className="text-[10px] text-[#72796e]">Vues</p>
              </div>
            </div>

            {/* Actions auteur supplémentaires */}
            {isOwner && (
              <div className="mt-4 pt-4 border-t border-[#e2e3dc] space-y-2">
                <Link
                  href={`/missions/${mission.ulid}/applications`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#154212]/5 text-[#154212] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#154212]/10 transition-colors"
                >
                  <Users size={14} /> Gérer les candidatures
                </Link>
                {mission.status === "published" && (
                  <button
                    onClick={() =>
                      updateStatus.mutate({
                        ulid: mission.ulid,
                        status: "suspended",
                      })
                    }
                    className="w-full py-2.5 border border-orange-200 text-orange-700 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-orange-50 transition-colors"
                  >
                    Suspendre la mission
                  </button>
                )}
                {mission.status === "suspended" && (
                  <button
                    onClick={() =>
                      updateStatus.mutate({
                        ulid: mission.ulid,
                        status: "published",
                      })
                    }
                    className="w-full py-2.5 border border-[#154212]/30 text-[#154212] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#154212]/5 transition-colors"
                  >
                    Republier
                  </button>
                )}
                {(mission.status === "published" ||
                  mission.status === "in_progress") && (
                  <button
                    onClick={() =>
                      updateStatus.mutate({
                        ulid: mission.ulid,
                        status: "completed",
                      })
                    }
                    className="w-full py-2.5 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    Marquer comme terminée
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {applyModalMissionUlid && <ApplicationModal onClose={closeApplyModal} />}
     

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
              Supprimer cette mission ?
            </h3>
            <p className="text-sm text-[#72796e] mb-5">
              Cette action est irréversible. Les candidats seront notifiés de
              l'annulation.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 border border-[#c2c9bb]/40 text-[#42493e] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#edefe7] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
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