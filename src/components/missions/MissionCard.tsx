'use client';

import Link from 'next/link';
import { MapPin, Clock, Banknote, Users, Calendar, Star, ChevronRight } from 'lucide-react';
import { Mission } from '@/lib/missions/types';
import { useMissionStore } from '@/stores/useMissionStore';
import MissionStatusBadge from './MissionStatusBadge';

interface Props {
  mission: Mission;
  viewMode?: 'grid' | 'list';
  onViewDetails?: () => void;
}

const REMUNERATION_LABELS: Record<string, string> = {
  fixed:       'Montant fixe',
  daily_rate:  'Taux journalier',
  hourly_rate: 'Taux horaire',
  negotiable:  'À négocier',
  in_kind:     'En nature',
  volunteer:   'Bénévolat',
};

const DURATION_LABELS: Record<string, string> = {
  hours:    'h',
  day:      'journée',
  days:     'j',
  weeks:    'sem.',
  flexible: 'flexible',
};

// Badge urgence : si expire dans moins de 3 jours
function isUrgent(mission: Mission): boolean {
  if (!mission.expires_at) return false;
  const diff = new Date(mission.expires_at).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

export default function MissionCard({ mission, viewMode = 'grid', onViewDetails }: Props) {
  const openApplyModal = useMissionStore(s => s.openApplyModal);

  const remuLabel = mission.remuneration_amount
    ? `${Number(mission.remuneration_amount).toLocaleString('fr-FR')} ${mission.remuneration_currency}`
    : REMUNERATION_LABELS[mission.remuneration_type] ?? '';

  const durationLabel = mission.duration_type === 'flexible'
    ? 'Flexible'
    : `${mission.duration_value ?? ''}${DURATION_LABELS[mission.duration_type] ?? ''}`;

  const urgent = isUrgent(mission);

  // ── Vue liste ─────────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <article className="bg-[#fafbf3] border border-[#c2c9bb]/30 rounded-2xl p-4 hover:shadow-md transition-all duration-200 group flex items-center gap-4">
        {/* Icône catégorie */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold"
          style={{ backgroundColor: mission.category?.color ?? '#154212' }}
        >
          {mission.category?.name?.[0] ?? '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold text-[#72796e] uppercase tracking-wider">
              {mission.category?.name ?? 'Mission'}
            </span>
            {urgent && (
              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Urgent
              </span>
            )}
            <MissionStatusBadge status={mission.status} size="xs" />
          </div>
          <h3 className="font-semibold text-[#191c18] text-sm truncate group-hover:text-[#154212] transition-colors">
            {mission.title}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-xs text-[#42493e]">
            {mission.location_label && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {mission.location_label}
                {mission.distance_km != null && <span className="text-[#3b6934] font-medium ml-1">· {mission.distance_km} km</span>}
              </span>
            )}
            <span className="flex items-center gap-1"><Clock size={11} />{durationLabel}</span>
            <span className="flex items-center gap-1"><Users size={11} />{mission.applications_count} candidature{mission.applications_count !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="font-bold text-[#154212] text-base font-[Inter]">{remuLabel}</span>
          <div className="flex gap-2">
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="px-3 py-1.5 text-xs font-semibold border border-[#154212] text-[#154212] rounded-lg hover:bg-[#154212] hover:text-white transition-all"
              >
                Détails
              </button>
            )}
            {mission.status === 'published' && mission.isOpen && (
              <button
                onClick={() => openApplyModal(mission.ulid)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#154212] text-white rounded-lg hover:bg-[#2d5a27] transition-all"
              >
                Postuler
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  // ── Vue grille (défaut) ───────────────────────────────────────────────
  return (
    <article className="bg-[#fafbf3] border border-[#c2c9bb]/30 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-all duration-300 group">
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
        <span className="text-[#154212] font-bold text-xl font-[Inter] tabular-nums shrink-0">
          {remuLabel}
        </span>
      </div>

      {/* Titre */}
      <h3 className="font-[Plus_Jakarta_Sans] text-xl font-semibold text-[#191c18] mb-2 group-hover:text-[#154212] transition-colors leading-snug">
        {mission.title}
      </h3>

      {/* Description */}
      <p className="text-[#42493e] text-sm mb-5 line-clamp-2 leading-relaxed">
        {mission.description}
      </p>

      {/* Métadonnées */}
      <div className="space-y-2 mb-5 border-t border-[#e2e3dc] pt-4">
        {mission.location_label && (
          <div className="flex items-center gap-2 text-[#42493e] text-sm">
            <MapPin size={15} className="text-[#154212] shrink-0" />
            <span>{mission.location_label}</span>
            {mission.distance_km != null && (
              <span className="ml-auto text-[#3b6934] text-xs font-semibold">
                {mission.distance_km} km
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-4 text-[#42493e] text-sm">
          <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#3b6934]" />{durationLabel}</span>
          {mission.start_date && (
            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#3b6934]" />{new Date(mission.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          )}
          <span className="flex items-center gap-1.5 ml-auto"><Users size={14} className="text-[#3b6934]" />{mission.applications_count}</span>
        </div>
      </div>

      {/* Auteur */}
      <div className="flex items-center gap-2 mb-5">
        {mission.author.avatar ? (
          <img src={mission.author.avatar} alt={mission.author.firstname} className="w-7 h-7 rounded-full object-cover border-2 border-[#bcf0ae]" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#2d5a27] flex items-center justify-center text-white text-xs font-bold border-2 border-[#bcf0ae]">
            {mission.author.firstname}
          </div>
        )}
        <span className="text-xs text-[#42493e] font-medium">{mission.author.firstname}</span>
        {mission.author.rating > 0 && (
          <span className="flex items-center gap-0.5 ml-auto text-xs text-[#72796e]">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            {mission.author.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex-1 py-3 border border-[#154212] text-[#154212] font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-[#154212] hover:text-white transition-all duration-200"
          >
            Voir les détails
          </button>
        )}
        {mission.status === 'published' && (
          <button
            onClick={() => openApplyModal(mission.ulid)}
            className="flex-1 py-3 bg-[#154212] text-white font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-[#2d5a27] shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            Postuler
          </button>
        )}
      </div>
    </article>
  );
}