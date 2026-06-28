/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import {
  Check,
  X,
  MessageCircle,
  FileText,
  Star,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MissionApplication } from "@/lib/missions/types";
import {
  useAcceptApplication,
  useRejectApplication,
  useAddApplicationNote,
} from "@/hooks/missions/useMissionMutate";
import { useMissionStore } from "@/stores/useMissionStore";

interface Props {
  application: MissionApplication;
  ulid: string;
  missionCompleted?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending: { label: "En attente", classes: "bg-amber-50 text-amber-700" },
  accepted: { label: "Accepté", classes: "bg-[#eaf3de] text-[#154212]" },
  rejected: { label: "Refusé", classes: "bg-red-50 text-red-600" },
  withdrawn: { label: "Retiré", classes: "bg-[#f3f4ed] text-[#72796e]" },
  confirmed: { label: "Confirmé", classes: "bg-blue-50 text-blue-700" },
};

const METHOD_LABELS: Record<string, string> = {
  form: "Formulaire",
  app_message: "Message GRO",
  whatsapp: "WhatsApp",
  email: "Email",
};

export default function ApplicationCard({
  application,
  ulid,
  missionCompleted,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [note, setNote] = useState(application.author_note ?? "");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const acceptApp = useAcceptApplication();
  const rejectApp = useRejectApplication();
  const addNote = useAddApplicationNote();
  const openReviewModal = useMissionStore((s) => s.openReviewModal);

  const status = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.pending;
  const { applicant, mission } = application;

  const handleAccept = () => {
    acceptApp.mutate({ ulid, appId: application.id });
  };

  const handleReject = () => {
    rejectApp.mutate(
      { ulid, appId: application.id, reason: rejectReason || undefined },
      {
        onSuccess: () => setShowRejectForm(false),
      },
    );
  };

  const handleSaveNote = () => {
    addNote.mutate(
      { ulid, appId: application.id, note },
      {
        onSuccess: () => setShowNoteInput(false),
      },
    );
  };

  return (
    <div className="bg-white border border-[#c2c9bb]/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        {applicant.avatar ? (
          <img
            src={applicant.avatar}
            alt={applicant.firstname}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#bcf0ae]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#2d5a27] flex items-center justify-center text-white font-bold border-2 border-[#bcf0ae]">
            {applicant.firstname}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#191c18] text-sm truncate">
            {applicant.firstname}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            
            <span className="text-[10px] text-[#72796e]">
              via {METHOD_LABELS[application.method] ?? application.method}
            </span>
          </div>
        </div>
        <span
          className={`${status.classes} text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full shrink-0`}
        >
          {status.label}
        </span>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-1.5 text-[#72796e] hover:bg-[#f3f4ed] rounded-lg transition-colors shrink-0"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Détails dépliables */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#e2e3dc] pt-3">
          {/* Réponses au formulaire */}
          {Object.keys(application.form_responses ?? {}).length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                Réponses
              </p>
              {mission.application_form?.map((field) => {
                const val = application.form_responses[field.id];
                if (val === undefined) return null;
                const display =
                  typeof val === "boolean"
                    ? val
                      ? "Oui"
                      : "Non"
                    : String(val);
                return (
                  <div key={field.id} className="bg-[#f3f4ed] rounded-lg p-2.5">
                    <p className="text-[10px] text-[#72796e] mb-0.5">
                      {field.label}
                    </p>
                    <p className="text-sm text-[#191c18] font-medium">
                      {display}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Motivation */}
          {application.motivation && (
            <div>
              <p className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest mb-1">
                Motivation
              </p>
              <p className="text-sm text-[#42493e] bg-[#f3f4ed] rounded-lg p-2.5 leading-relaxed">
                {application.motivation}
              </p>
            </div>
          )}

          {/* Pièces jointes */}
          {application.attachment_paths?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest mb-1">
                Pièces jointes
              </p>
              <div className="flex flex-wrap gap-2">
                {application.attachment_paths.map((path, i) => (
                  <a
                    key={i}
                    href={
                      path.startsWith("http")
                        ? path
                        : `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ""}/storage/${path}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-[#f3f4ed] border border-[#c2c9bb]/30 px-2.5 py-1.5 rounded-lg text-[#154212] font-medium hover:bg-[#154212]/5"
                  >
                    <FileText size={12} /> Fichier {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Note interne */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                Note interne
              </p>
              {!showNoteInput && (
                <button
                  onClick={() => setShowNoteInput(true)}
                  className="text-[10px] text-[#154212] font-semibold hover:underline"
                >
                  {application.author_note ? "Modifier" : "Ajouter"}
                </button>
              )}
            </div>
            {showNoteInput ? (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note privée visible uniquement par vous..."
                  className="w-full px-3 py-2 bg-white border border-[#c2c9bb]/30 rounded-lg text-sm focus:outline-none focus:border-[#154212] text-[#191c18] resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNote}
                    className="text-xs font-semibold text-white bg-[#154212] px-3 py-1.5 rounded-lg"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setShowNoteInput(false)}
                    className="text-xs font-semibold text-[#72796e] px-3 py-1.5"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : application.author_note ? (
              <p className="text-sm text-[#42493e] bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                {application.author_note}
              </p>
            ) : (
              <p className="text-xs text-[#a8b0a0] italic">Aucune note</p>
            )}
          </div>

          {/* Formulaire de refus */}
          {showRejectForm && (
            <div className="space-y-2 bg-red-50 rounded-lg p-3">
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Raison du refus (optionnel, visible par le candidat)..."
                className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-400 text-[#191c18] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={rejectApp.isPending}
                  className="text-xs font-semibold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600"
                >
                  Confirmer le refus
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="text-xs font-semibold text-[#72796e] px-3 py-1.5"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions footer */}
      <div className="px-4 py-3 bg-[#f3f4ed] border-t border-[#e2e3dc] flex flex-wrap items-center gap-2">
        {application.status === "pending" && (
          <>
            <button
              onClick={handleAccept}
              disabled={acceptApp.isPending}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#154212] px-3 py-2 rounded-lg hover:bg-[#2d5a27] transition-colors disabled:opacity-60"
            >
              {acceptApp.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}
              Accepter
            </button>
            <button
              onClick={() => setShowRejectForm((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X size={13} /> Refuser
            </button>
          </>
        )}

        {application.status === "accepted" && (
          <>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#154212]">
              <Check size={13} /> Candidat retenu
            </span>
            <button
              onClick={() => setShowRejectForm((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors ml-auto"
            >
              <X size={13} /> Retirer l'acceptation
            </button>
          </>
        )}

        {/* Évaluer (si mission terminée) */}
        {missionCompleted && application.status === "accepted" && (
          <button
            onClick={() =>
              openReviewModal({
                ulid,
                revieweeId: applicant.id,
                direction: "author_to_applicant",
              })
            }
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 border border-amber-200 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors ml-auto"
          >
            <Star size={13} /> Évaluer
          </button>
        )}

        {/* Contacter */}
        <button className="flex items-center gap-1.5 text-xs font-semibold text-[#42493e] border border-[#c2c9bb]/40 px-3 py-2 rounded-lg hover:bg-white transition-colors ml-auto">
          <MessageCircle size={13} /> Message
        </button>
      </div>
    </div>
  );
}
