/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  Phone,
  Mail,
  Send,
  Paperclip,
  Check,
} from "lucide-react";
import { useMissionStore } from "@/stores/useMissionStore";
import { useMission } from "@/hooks/missions/useMissions";
import { useApplyToMission } from "@/hooks/missions/useMissionMutate";
import ApplicationFormRenderer from "./ApplicationFormRenderer";

interface Props {
  onClose: () => void;
}

type Method = "form" | "app_message" | "whatsapp" | "email";

export default function ApplicationModal({ onClose }: Props) {
  const applyModalMissionUlid = useMissionStore((s) => s.applyModalMissionUlid);
  const { data: mission } = useMission(applyModalMissionUlid ?? "");
  const applyMutation = useApplyToMission();

  const [method, setMethod] = useState<Method>("form");
  const [formResponses, setFormResponses] = useState<Record<string, unknown>>(
    {},
  );
  const [motivation, setMotivation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!applyModalMissionUlid || !mission) return null;

  const whatsappContact = mission.contact_methods?.find(
    (c) => c.type === "whatsapp",
  );
  const emailContact = mission.contact_methods?.find((c) => c.type === "email");

  const availableMethods = [
    { key: "form" as Method, label: "Formulaire", icon: <Send size={13} /> },
    {
      key: "app_message" as Method,
      label: "Message GRO",
      icon: <MessageCircle size={13} />,
    },
    ...(whatsappContact
      ? [
          {
            key: "whatsapp" as Method,
            label: "WhatsApp",
            icon: <Phone size={13} />,
          },
        ]
      : []),
    ...(emailContact
      ? [{ key: "email" as Method, label: "Email", icon: <Mail size={13} /> }]
      : []),
  ];

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("mission_ulid", mission.ulid);
    fd.append("method", method);
    fd.append("form_responses", JSON.stringify(formResponses));
    if (motivation) fd.append("motivation", motivation);
    files.forEach((f, i) => fd.append(`attachments[${i}]`, f));

    applyMutation.mutate(fd, {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(onClose, 1800);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#2e312c]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#f9faf2] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-[#c2c9bb]/30 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c2c9bb]/20 bg-[#f3f4ed]">
          <div>
            <h2 className="font-[Plus_Jakarta_Sans] font-semibold text-[#191c18] text-base leading-tight">
              Postuler
            </h2>
            <p className="text-xs text-[#72796e] mt-0.5 line-clamp-1">
              {mission.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#edefe7] rounded-full transition-colors text-[#42493e]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Succès */}
        {success && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#eaf3de] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-[#154212]" />
              </div>
              <h3 className="font-semibold text-[#191c18] mb-1">
                Candidature envoyée !
              </h3>
              <p className="text-sm text-[#72796e]">
                L'auteur de la mission a été notifié.
              </p>
            </div>
          </div>
        )}

        {!success && (
          <>
            <div
              className="overflow-y-auto flex-1 p-5 space-y-4"
              style={{ scrollbarWidth: "none" }}
            >
              {/* Choix méthode */}
              <div>
                <p className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest mb-2">
                  Comment souhaitez-vous postuler ?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {availableMethods.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMethod(m.key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        method === m.key
                          ? "border-[#154212] bg-[#154212]/5 text-[#154212]"
                          : "border-[#c2c9bb]/30 text-[#42493e] hover:border-[#154212]/40"
                      }`}
                    >
                      {m.icon}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulaire in-app */}
              {method === "form" && (
                <>
                  {mission.application_form &&
                    mission.application_form.length > 0 && (
                      <div className="bg-[#f3f4ed] rounded-xl p-4">
                        <p className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest mb-3">
                          Questions de l'auteur
                        </p>
                        <ApplicationFormRenderer
                          fields={mission.application_form}
                          responses={formResponses}
                          onChange={setFormResponses}
                        />
                      </div>
                    )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                      Mot de motivation{" "}
                      <span className="font-normal normal-case">
                        (optionnel)
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Présentez-vous brièvement et expliquez votre intérêt pour cette mission..."
                      className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18] placeholder:text-[#a8b0a0] resize-none"
                    />
                  </div>

                  {mission.allow_attachments && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest flex items-center gap-1.5">
                        <Paperclip size={11} /> Pièces jointes (max 5, 5 Mo
                        chacune)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        onChange={(e) =>
                          setFiles(Array.from(e.target.files ?? []))
                        }
                        className="w-full text-sm text-[#42493e] file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#154212]/10 file:text-[#154212] hover:file:bg-[#154212]/20"
                      />
                      {files.length > 0 && (
                        <p className="text-xs text-[#3b6934]">
                          {files.length} fichier{files.length > 1 ? "s" : ""}{" "}
                          sélectionné{files.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Message GRO */}
              {method === "app_message" && (
                <div className="bg-[#eaf3de] border border-[#bcf0ae] rounded-xl p-4">
                  <p className="text-xs text-[#42493e] mb-2 font-medium">
                    Le message suivant sera envoyé automatiquement :
                  </p>
                  <blockquote className="text-sm text-[#154212] italic border-l-2 border-[#154212] pl-3">
                    "Bonjour, je suis intéressé(e) par votre mission{" "}
                    <strong>{mission.title}</strong>. Je serais ravi(e) d'en
                    discuter avec vous. Bonne journée !"
                  </blockquote>
                </div>
              )}

              {/* WhatsApp */}
              {method === "whatsapp" && whatsappContact?.value && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs text-green-800 mb-3">
                    Vous serez redirigé vers WhatsApp avec un message
                    pré-rempli.
                  </p>
                  <a
                    href={`https://wa.me/${whatsappContact.value.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre mission "${mission.title}" publiée sur GRO. Pouvez-vous m'en dire plus ?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors"
                  >
                    <Phone size={16} /> Ouvrir WhatsApp
                  </a>
                </div>
              )}

              {/* Email */}
              {method === "email" && emailContact?.value && (
                <a
                  href={`mailto:${emailContact.value}?subject=Candidature : ${mission.title}&body=Bonjour,%0A%0AJe suis intéressé(e) par votre mission "${mission.title}" publiée sur GRO.%0A%0A...`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  <Mail size={16} /> Ouvrir le client email
                </a>
              )}
            </div>

            {/* Footer */}
            {(method === "form" || method === "app_message") && (
              <div className="px-5 py-4 border-t border-[#c2c9bb]/20 bg-[#f3f4ed]">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={applyMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#154212] text-white font-semibold text-xs tracking-widest uppercase hover:bg-[#2d5a27] shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-60"
                >
                  {applyMutation.isPending ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send size={15} />
                  )}
                  Envoyer ma candidature
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
