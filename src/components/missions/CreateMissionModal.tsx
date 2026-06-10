/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useCreateMission } from '@/hooks/missions/useCreateMission';
import {  useCategories } from "@/hooks/missions/useMissions";
import { FormField } from '@/lib/missions/types';
import MissionLocationPicker from './MissionLocationPicker';

interface Props { onClose: () => void; }

interface FormState {
  // Étape 1 : Infos générales
  title: string;
  category_id: string;
  description: string;
  desired_profile: string;
  // Étape 2 : Durée & Lieu
  duration_type: string;
  duration_value: string;
  start_date: string;
  expires_at: string;
  location_label: string;
  latitude: string;
  longitude: string;
  diffusion_radius_km: string;
  // Étape 3 : Rémunération
  remuneration_type: string;
  remuneration_amount: string;
  remuneration_currency: string;
  remuneration_conditions: string;
  // Étape 4 : Contact & Formulaire
  contact_methods: { type: string; value: string }[];
  allow_attachments: boolean;
  max_applications: string;
  application_form: FormField[];
  // Publication
  status: string;
}

const STEPS = [
  { label: 'Mission', desc: 'Titre & description' },
  { label: 'Lieu & Durée', desc: 'Quand et où ?' },
  { label: 'Rémunération', desc: 'Conditions financières !' },
  { label: 'Contact', desc: 'Comment postuler ?' },
];

const REMUNERATION_TYPES = [
  { value: 'fixed',       label: 'Montant fixe' },
  { value: 'daily_rate',  label: 'Taux journalier' },
  { value: 'hourly_rate', label: 'Taux horaire' },
  { value: 'negotiable',  label: 'À négocier' },
  { value: 'in_kind',     label: 'En nature' },
  { value: 'volunteer',   label: 'Bénévolat' },
];

const DURATION_TYPES = [
  { value: 'hours',    label: 'Heures' },
  { value: 'day',      label: '1 journée' },
  { value: 'days',     label: 'Jours' },
  { value: 'weeks',    label: 'Semaines' },
  { value: 'flexible', label: 'Flexible' },
];

const CONTACT_TYPES = [
  { value: 'app_message', label: 'Messagerie AgriPulse' },
  { value: 'whatsapp',    label: 'WhatsApp' },
  { value: 'email',       label: 'Email' },
  { value: 'instagram',   label: 'Instagram' },
  { value: 'facebook',    label: 'Facebook' },
];

const FIELD_TYPES = [
  { value: 'text',     label: 'Texte court' },
  { value: 'textarea', label: 'Texte long' },
  { value: 'boolean',  label: 'Oui / Non' },
  { value: 'select',   label: 'Choix multiple' },
  { value: 'number',   label: 'Nombre' },
];

export default function CreateMissionModal({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    title: '', category_id: '', description: '', desired_profile: '',
    duration_type: 'days', duration_value: '', start_date: '', expires_at: '',
    location_label: '', latitude: '', longitude: '', diffusion_radius_km: '25',
    remuneration_type: 'fixed', remuneration_amount: '', remuneration_currency: 'XAF',
    remuneration_conditions: '',
    contact_methods: [{ type: 'app_message', value: '' }],
    allow_attachments: false, max_applications: '',
    application_form: [],
    status: 'published',
  });

  const { data: categories } = useCategories();
  const createMission = useCreateMission();

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (key: keyof FormState, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }));

  // Ajouter un contact
  const addContact = () => {
    if (form.contact_methods.length >= 5) return;
    set('contact_methods', [...form.contact_methods, { type: 'email', value: '' }]);
  };

  const updateContact = (idx: number, key: string, value: string) => {
    const updated = form.contact_methods.map((c, i) => i === idx ? { ...c, [key]: value } : c);
    set('contact_methods', updated);
  };

  const removeContact = (idx: number) => {
    set('contact_methods', form.contact_methods.filter((_, i) => i !== idx));
  };

  // Ajouter un champ formulaire
  const addFormField = () => {
    const newField: FormField = {
      id: `q${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
    };
    set('application_form', [...form.application_form, newField]);
  };

  const updateField = (idx: number, key: string, value: unknown) => {
    const updated = form.application_form.map((f, i) => i === idx ? { ...f, [key]: value } : f);
    set('application_form', updated);
  };

  const removeField = (idx: number) => {
    set('application_form', form.application_form.filter((_, i) => i !== idx));
  };

  // Soumettre
  const handleSubmit = (publishNow: boolean) => {
    const fd = new FormData();
    const data = { ...form, status: publishNow ? 'published' : 'draft' };

    Object.entries(data).forEach(([key, val]) => {
      if (key === 'contact_methods' || key === 'application_form') {
        fd.append(key, JSON.stringify(val));
      } else if (typeof val === 'boolean') {
        fd.append(key, val ? '1' : '0');
      } else if (val !== '' && val !== null && val !== undefined) {
        fd.append(key, String(val));
      }
    });

    createMission.mutate(fd, { onSuccess: onClose });
  };

  const canNext = () => {
    if (step === 0) return form.title.length >= 5 && form.description.length >= 20;
    if (step === 1) return form.duration_type !== '';
    if (step === 2) return form.remuneration_type !== '';
    return true;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#2e312c]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#f9faf2] rounded-3xl w-full max-w-2xl shadow-2xl border border-[#c2c9bb]/30 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#f3f4ed] border-b border-[#c2c9bb]/20">
          <div>
            <h2 className="font-[Plus_Jakarta_Sans] text-lg font-semibold text-[#191c18]">
              Publier une nouvelle mission
            </h2>
            <p className="text-xs text-[#72796e] mt-0.5">
              Étape {step + 1} / {STEPS.length} — {STEPS[step].desc}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#edefe7] rounded-full transition-colors text-[#42493e]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex px-6 pt-4 gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1 w-full rounded-full transition-colors ${
                  i < step
                    ? "bg-[#154212]"
                    : i === step
                      ? "bg-[#3b6934]"
                      : "bg-[#e2e3dc]"
                }`}
              />
              <span
                className="text-[9px] font-medium hidden md:block"
                style={{ color: i <= step ? "#154212" : "#72796e" }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Contenu scroll */}
        <div
          className="overflow-y-auto max-h-[55vh] px-6 py-5 space-y-5"
          style={{ scrollbarWidth: "none" }}
        >
          {/* ── Étape 0 : Infos générales ─────────────────────────────── */}
          {step === 0 && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                  Titre de la mission *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Ex : Récolte de maïs à Bafia"
                  className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] focus:ring-1 focus:ring-[#154212] text-[#191c18] placeholder:text-[#a8b0a0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                  Catégorie
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(categories?.data ?? []).map((cat: any) => (
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Décrivez les tâches, les conditions, ce que vous attendez des candidats..."
                  className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] focus:ring-1 focus:ring-[#154212] text-[#191c18] placeholder:text-[#a8b0a0] resize-none"
                />
                <p className="text-[10px] text-[#72796e]">
                  {form.description.length} / 5000 caractères
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                  Profil souhaité (optionnel)
                </label>
                <textarea
                  rows={2}
                  value={form.desired_profile}
                  onChange={(e) => set("desired_profile", e.target.value)}
                  placeholder="Ex : Personne motivée et disponible le week-end, avec une expérience en jardinage"
                  className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18] placeholder:text-[#a8b0a0] resize-none"
                />
              </div>
            </>
          )}

          {/* ── Étape 1 : Durée & Lieu ─────────────────────────────────── */}
          {step === 1 && (
            <>
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

              {form.duration_type !== "flexible" &&
                form.duration_type !== "day" && (
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                  Localisation
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#72796e]"
                  />
                  <div className="space-y-3">
                    <MissionLocationPicker
                      latitude={
                        form.latitude ? Number(form.latitude) : undefined
                      }
                      longitude={
                        form.longitude ? Number(form.longitude) : undefined
                      }
                      locationLabel={form.location_label}
                      onChange={(lat, lng, label) => {
                        set("latitude", String(lat));
                        set("longitude", String(lng));
                        set("location_label", label);
                      }}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={form.latitude}
                        readOnly
                        placeholder="Latitude"
                        className="w-full px-4 py-3 bg-white border rounded-xl"
                      />

                      <input
                        value={form.longitude}
                        readOnly
                        placeholder="Longitude"
                        className="w-full px-4 py-3 bg-white border rounded-xl"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.geolocation.getCurrentPosition((position) => {
                        set("latitude", String(position.coords.latitude));

                        set("longitude", String(position.coords.longitude));
                      });
                    }}
                  >
                    Utiliser ma position
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                  Rayon de diffusion : {form.diffusion_radius_km} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={form.diffusion_radius_km}
                  onChange={(e) => set("diffusion_radius_km", e.target.value)}
                  className="w-full accent-[#154212]"
                />
                <div className="flex justify-between text-[10px] text-[#72796e]">
                  <span>5 km (local)</span>
                  <span>100 km</span>
                  <span>200 km (national)</span>
                </div>
              </div>
            </>
          )}

          {/* ── Étape 2 : Rémunération ─────────────────────────────────── */}
          {step === 2 && (
            <>
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
                      onChange={(e) =>
                        set("remuneration_amount", e.target.value)
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
                    />
                  </div>
                  <div className="w-28 space-y-1.5">
                    <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest">
                      Devise
                    </label>
                    <select
                      value={form.remuneration_currency}
                      onChange={(e) =>
                        set("remuneration_currency", e.target.value)
                      }
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
                  Conditions de paiement (optionnel)
                </label>
                <input
                  value={form.remuneration_conditions}
                  onChange={(e) =>
                    set("remuneration_conditions", e.target.value)
                  }
                  placeholder="Ex : Paiement en fin de mission, 50% d'avance possible"
                  className="w-full px-4 py-3 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18] placeholder:text-[#a8b0a0]"
                />
              </div>
            </>
          )}

          {/* ── Étape 3 : Contact & Formulaire ─────────────────────────── */}
          {step === 3 && (
            <>
              {/* Méthodes de contact */}
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
                        onChange={(e) =>
                          updateContact(i, "value", e.target.value)
                        }
                        placeholder={
                          c.type === "whatsapp"
                            ? "+237690000000"
                            : c.type === "email"
                              ? "contact@email.com"
                              : "@identifiant"
                        }
                        className="flex-1 px-3 py-2.5 bg-white border border-[#c2c9bb]/40 rounded-xl text-sm focus:outline-none focus:border-[#154212] text-[#191c18] placeholder:text-[#a8b0a0]"
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

              {/* Pièces jointes + max candidats */}
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
                    onClick={() =>
                      set("allow_attachments", !form.allow_attachments)
                    }
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
                      <Plus size={12} /> Ajouter une question
                    </button>
                  )}
                </div>
                {form.application_form.length === 0 && (
                  <p className="text-xs text-[#72796e] bg-[#f3f4ed] rounded-xl p-3">
                    Aucune question. Les candidats pourront tout de même
                    postuler avec une lettre de motivation.
                  </p>
                )}
                {form.application_form.map((field, i) => (
                  <div
                    key={field.id}
                    className="bg-[#f3f4ed] rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        value={field.label}
                        onChange={(e) =>
                          updateField(i, "label", e.target.value)
                        }
                        placeholder="Question (ex: Avez-vous un véhicule ?)"
                        className="flex-1 px-3 py-2 bg-white border border-[#c2c9bb]/30 rounded-lg text-sm focus:outline-none focus:border-[#154212] text-[#191c18] placeholder:text-[#a8b0a0]"
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
            </>
          )}
        </div>

        {/* Footer navigation */}
        <div className="px-6 py-4 bg-[#f3f4ed] border-t border-[#c2c9bb]/20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (step > 0 ? setStep((s) => s - 1) : onClose())}
            className="flex items-center gap-2 px-4 py-2.5 text-[#42493e] font-semibold text-xs tracking-wider uppercase hover:bg-[#edefe7] rounded-xl transition-colors"
          >
            <ChevronLeft size={16} />
            {step === 0 ? "Annuler" : "Retour"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#154212] text-white font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-[#2d5a27] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant <ChevronRight size={16} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={createMission.isPending}
                className="px-4 py-2.5 border border-[#c2c9bb] text-[#42493e] font-semibold text-xs tracking-wider uppercase rounded-xl hover:bg-[#edefe7] transition-all"
              >
                Brouillon
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={createMission.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#154212] text-white font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-[#2d5a27] shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-60"
              >
                {createMission.isPending ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Check size={16} />
                )}
                Publier la mission
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}