/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { X, Flag, Check } from "lucide-react";
import { useReportMission } from "@/hooks/missions/useMissionMutate";
import { ReportReason } from "@/lib/missions/types";

interface Props {
  ulid: string;
  missionTitle: string;
  onClose: () => void;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam ou publicité" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "scam", label: "Arnaque suspectée" },
  { value: "duplicate", label: "Mission en doublon" },
  { value: "misleading", label: "Description trompeuse" },
  { value: "other", label: "Autre raison" },
];

export default function ReportModal({ ulid, missionTitle, onClose }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [success, setSuccess] = useState(false);

  const reportMission = useReportMission();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = () => {
    if (!reason) return;
    reportMission.mutate(
      { ulid, reason, details: details || undefined },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(onClose, 1500);
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#2e312c]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#f9faf2] rounded-3xl w-full max-w-md shadow-2xl border border-[#c2c9bb]/30 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c2c9bb]/20 bg-[#f3f4ed]">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-red-500" />
            <h2 className="font-[Plus_Jakarta_Sans] font-semibold text-[#191c18] text-base">
              Signaler cette mission
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#edefe7] rounded-full transition-colors text-[#42493e]"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[#eaf3de] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-[#154212]" />
            </div>
            <h3 className="font-semibold text-[#191c18] mb-1">
              Signalement envoyé
            </h3>
            <p className="text-sm text-[#72796e]">
              L'équipe AgriPulse va examiner cette mission.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <p className="text-sm text-[#42493e] line-clamp-1">
              <span className="text-[#72796e]">Mission :</span>{" "}
              <strong>{missionTitle}</strong>
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                Pourquoi signalez-vous cette mission ?
              </label>
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    reason === r.value
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-[#c2c9bb]/30 text-[#42493e] hover:border-red-300"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                Détails{" "}
                <span className="font-normal normal-case">(optionnel)</span>
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Décrivez le problème..."
                className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-red-400 text-[#191c18] placeholder:text-[#a8b0a0] resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!reason || reportMission.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white font-semibold text-xs tracking-widest uppercase hover:bg-red-600 shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {reportMission.isPending ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Flag size={14} />
              )}
              Envoyer le signalement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
