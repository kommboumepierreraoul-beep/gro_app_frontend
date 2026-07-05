/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, MapPin, Loader2, Check } from "lucide-react";
import { useMission, useCategories } from "@/hooks/missions/useMissions";
import { useUpdateMission } from "@/hooks/missions/useMissionMutate";
import { FormField } from "@/lib/missions/types";

interface FormState {
  title: string;
  category_id: string;
  description: string;
  desired_profile: string;
  duration_type: string;
  duration_value: string;
  start_date: string;
  expires_at: string;
  location_label: string;
  diffusion_radius_km: string;
  remuneration_type: string;
  remuneration_amount: string;
  remuneration_currency: string;
  remuneration_conditions: string;
  contact_methods: { type: string; value: string }[];
  allow_attachments: boolean;
  max_applications: string;
  application_form: FormField[];
}

const REMUNERATION_TYPES = [
  { value: "fixed", label: "Montant fixe" },
  { value: "daily_rate", label: "Taux journalier" },
  { value: "hourly_rate", label: "Taux horaire" },
  { value: "negotiable", label: "À négocier" },
  { value: "in_kind", label: "En nature" },
  { value: "volunteer", label: "Bénévolat" },
];

const DURATION_TYPES = [
  { value: "hours", label: "Heures" },
  { value: "day", label: "1 journée" },
  { value: "days", label: "Jours" },
  { value: "weeks", label: "Semaines" },
  { value: "flexible", label: "Flexible" },
];

const CONTACT_TYPES = [
  { value: "app_message", label: "Messagerie GRO" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
];

const FIELD_TYPES = [
  { value: "text", label: "Texte court" },
  { value: "textarea", label: "Texte long" },
  { value: "boolean", label: "Oui / Non" },
  { value: "select", label: "Choix multiple" },
  { value: "number", label: "Nombre" },
];

export default function MissionEditPage() {
  const { ulid } = useParams<{ ulid: string }>();
  const router = useRouter();
  const { data: mission, isLoading } = useMission(ulid);
  const { data: categories } = useCategories();
  const updateMission = useUpdateMission();

  const [form, setForm] = useState<FormState | null>(null);

  // Pré-remplir le formulaire une fois la mission chargée
  useEffect(() => {
    if (mission && !form) {
      setForm({
        title: mission.title,
        category_id: mission.category?.id ? String(mission.category.id) : "",
        description: mission.description,
        desired_profile: mission.desired_profile ?? "",
        duration_type: mission.duration_type,
        duration_value: mission.duration_value
          ? String(mission.duration_value)
          : "",
        start_date: mission.start_date ?? "",
        expires_at: mission.expires_at ? mission.expires_at.slice(0, 10) : "",
        location_label: mission.location_label ?? "",
        diffusion_radius_km: "25",
        remuneration_type: mission.remuneration_type,
        remuneration_amount: mission.remuneration_amount
          ? String(mission.remuneration_amount)
          : "",
        remuneration_currency: mission.remuneration_currency,
        remuneration_conditions: mission.remuneration_conditions ?? "",
        contact_methods:
          mission.contact_methods.length > 0
            ? mission.contact_methods.map((c) => ({
                type: c.type,
                value: c.value ?? "",
              }))
            : [{ type: "app_message", value: "" }],
        allow_attachments: mission.allow_attachments,
        max_applications: mission.max_applications
          ? String(mission.max_applications)
          : "",
        application_form: mission.application_form ?? [],
      });
    }
  }, [mission, form]);

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <Loader2 className="animate-spin text-[#154212]" size={32} />
      </div>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const addContact = () => {
    if (form.contact_methods.length >= 5) return;
    set("contact_methods", [
      ...form.contact_methods,
      { type: "email", value: "" },
    ]);
  };
  const updateContact = (idx: number, key: string, value: string) => {
    set(
      "contact_methods",
      form.contact_methods.map((c, i) =>
        i === idx ? { ...c, [key]: value } : c,
      ),
    );
  };
  const removeContact = (idx: number) => {
    set(
      "contact_methods",
      form.contact_methods.filter((_, i) => i !== idx),
    );
  };

  const addFormField = () => {
    set("application_form", [
      ...form.application_form,
      { id: `q${Date.now()}`, label: "", type: "text", required: false },
    ]);
  };
  const updateField = (idx: number, key: string, value: unknown) => {
    set(
      "application_form",
      form.application_form.map((f, i) =>
        i === idx ? { ...f, [key]: value } : f,
      ),
    );
  };
  const removeField = (idx: number) => {
    set(
      "application_form",
      form.application_form.filter((_, i) => i !== idx),
    );
  };

  const handleSubmit = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === "contact_methods" || key === "application_form") {
        fd.append(key, JSON.stringify(val));
      } else if (typeof val === "boolean") {
        fd.append(key, val ? "1" : "0");
      } else if (val !== "" && val !== null && val !== undefined) {
        fd.append(key, String(val));
      }
    });

    updateMission.mutate(
      { ulid, payload: fd },
      {
        onSuccess: () => router.push(`/missions/${ulid}`),
      },
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 pb-32">
      <Link
        href={`/missions/${ulid}`}
        className="flex items-center gap-2 text-[#42493e] text-sm font-medium hover:text-[#154212] transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Retour à la mission
      </Link>

      <h1 className="font-[Plus_Jakarta_Sans] text-2xl font-bold text-[#191c18] mb-1">
        Modifier la mission
      </h1>
      <p className="text-sm text-[#72796e] mb-8">
        Les candidats actuels seront notifiés des changements.
      </p>

      <div className="bg-[#fafbf3] border border-[#c2c9bb]/30 rounded-2xl p-6 md:p-8 space-y-6">
        {/* Titre */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
            Titre de la mission *
          </label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] focus:ring-1 focus:ring-[#154212] text-[#191c18]"
          />
        </div>

        {/* Catégorie */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
            Catégorie
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(categories?.data ?? []).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => set("category_id", String(cat.id))}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.category_id === String(cat.id)
                    ? "border-[#154212] bg-[#154212]/5 text-[#154212]"
                    : "border-[#c2c9bb]/30 text-[#42493e] hover:border-[#154212]/40"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
            Description *
          </label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18] resize-none"
          />
        </div>

        {/* Profil souhaité */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
            Profil souhaité
          </label>
          <textarea
            rows={2}
            value={form.desired_profile}
            onChange={(e) => set("desired_profile", e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18] resize-none"
          />
        </div>

        {/* Durée */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
            Type de durée *
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATION_TYPES.map((dt) => (
              <button
                key={dt.value}
                type="button"
                onClick={() => set("duration_type", dt.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  form.duration_type === dt.value
                    ? "border-[#154212] bg-[#154212]/5 text-[#154212]"
                    : "border-[#c2c9bb]/30 text-[#42493e] hover:border-[#154212]/40"
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        {form.duration_type !== "flexible" && form.duration_type !== "day" && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
              Nombre de {form.duration_type}
            </label>
            <input
              type="number"
              min="1"
              value={form.duration_value}
              onChange={(e) => set("duration_value", e.target.value)}
              className="w-32 px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
            />
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
              Date de début
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => set("start_date", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
              Expiration de l'offre
            </label>
            <input
              type="date"
              value={form.expires_at}
              onChange={(e) => set("expires_at", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
            />
          </div>
        </div>

        {/* Localisation */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
            Localisation
          </label>
          <div className="relative">
            <MapPin
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#72796e]"
            />
            <input
              value={form.location_label}
              onChange={(e) => set("location_label", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
            />
          </div>
        </div>

        {/* Rémunération */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
            Type de rémunération *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {REMUNERATION_TYPES.map((rt) => (
              <button
                key={rt.value}
                type="button"
                onClick={() => set("remuneration_type", rt.value)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                  form.remuneration_type === rt.value
                    ? "border-[#154212] bg-[#154212]/5 text-[#154212]"
                    : "border-[#c2c9bb]/30 text-[#42493e] hover:border-[#154212]/40"
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        {["fixed", "daily_rate", "hourly_rate"].includes(
          form.remuneration_type,
        ) && (
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                Montant
              </label>
              <input
                type="number"
                min="0"
                value={form.remuneration_amount}
                onChange={(e) => set("remuneration_amount", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
              />
            </div>
            <div className="w-28 space-y-1.5">
              <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                Devise
              </label>
              <select
                value={form.remuneration_currency}
                onChange={(e) => set("remuneration_currency", e.target.value)}
                className="w-full px-3 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
              >
                <option>XAF</option>
                <option>EUR</option>
                <option>USD</option>
              </select>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
            Conditions de paiement
          </label>
          <input
            value={form.remuneration_conditions}
            onChange={(e) => set("remuneration_conditions", e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
          />
        </div>

        {/* Contacts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
              Méthodes de contact
            </label>
            {form.contact_methods.length < 5 && (
              <button
                type="button"
                onClick={addContact}
                className="text-xs text-[#154212] font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Ajouter
              </button>
            )}
          </div>
          {form.contact_methods.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={c.type}
                onChange={(e) => updateContact(i, "type", e.target.value)}
                className="w-40 px-3 py-2.5 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
              >
                {CONTACT_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
              {c.type !== "app_message" && (
                <input
                  value={c.value}
                  onChange={(e) => updateContact(i, "value", e.target.value)}
                  placeholder={
                    c.type === "whatsapp"
                      ? "+237690000000"
                      : c.type === "email"
                        ? "contact@email.com"
                        : "@identifiant"
                  }
                  className="flex-1 px-3 py-2.5 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
                />
              )}
              {form.contact_methods.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="p-2 text-[#72796e] hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Max candidatures + pièces jointes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
              Max candidatures
            </label>
            <input
              type="number"
              min="1"
              value={form.max_applications}
              onChange={(e) => set("max_applications", e.target.value)}
              placeholder="Illimité"
              className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18] placeholder:text-[#a8b0a0]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
              Pièces jointes
            </label>
            <button
              type="button"
              onClick={() => set("allow_attachments", !form.allow_attachments)}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                form.allow_attachments
                  ? "border-[#154212] bg-[#154212]/5 text-[#154212]"
                  : "border-[#c2c9bb]/30 text-[#42493e]"
              }`}
            >
              {form.allow_attachments ? "✓ Autorisées" : "Non autorisées"}
            </button>
          </div>
        </div>

        {/* Formulaire personnalisé */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
              Questions pour les candidats
            </label>
            {form.application_form.length < 10 && (
              <button
                type="button"
                onClick={addFormField}
                className="text-xs text-[#154212] font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Ajouter
              </button>
            )}
          </div>
          {form.application_form.map((field, i) => (
            <div
              key={field.id}
              className="bg-[#f3f4ed] rounded-xl p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  value={field.label}
                  onChange={(e) => updateField(i, "label", e.target.value)}
                  placeholder="Question"
                  className="flex-1 px-3 py-2 bg-white border border-[#c2c9bb]/30 rounded-lg text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
                />
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  className="p-1.5 text-[#72796e] hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={field.type}
                  onChange={(e) => updateField(i, "type", e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-[#c2c9bb]/30 rounded-lg text-xs focus:outline-none focus:border-[#154212] text-[#42493e]"
                >
                  {FIELD_TYPES.map((ft) => (
                    <option key={ft.value} value={ft.value}>
                      {ft.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-xs text-[#42493e] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      updateField(i, "required", e.target.checked)
                    }
                    className="accent-[#154212]"
                  />
                  Requis
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e2e3dc]">
          <Link
            href={`/missions/${ulid}`}
            className="flex-1 text-center py-3 border border-[#c2c9bb]/40 text-[#42493e] font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-[#edefe7] transition-colors"
          >
            Annuler
          </Link>
          <button
            onClick={handleSubmit}
            disabled={updateMission.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#154212] text-white font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-[#2d5a27] shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-60"
          >
            {updateMission.isPending ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Check size={15} />
            )}
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
