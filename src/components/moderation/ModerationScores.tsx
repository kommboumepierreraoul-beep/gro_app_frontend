"use client";

import React from "react";
import { ModerationScores as ModerationScoresType } from "@/types/moderation";
import {
  AlertTriangle,
  Mail,
  Heart,
  Sword,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from "lucide-react";

interface ModerationScoresProps {
  scores: ModerationScoresType;
  compact?: boolean;
  showLabels?: boolean;
  showRiskLevel?: boolean;
  className?: string;
}

// ─── Configuration des scores ──────────────────────────────────────────────

const SCORE_CONFIG = [
  {
    key: "toxicity" as const,
    label: "Toxicité",
    Icon: AlertTriangle,
    colorLow: "#15803d",
    colorMedium: "#c2410c",
    colorHigh: "#b91c1c",
    iconBgLow: "rgba(34,197,94,0.12)",
    iconBgMedium: "rgba(249,115,22,0.12)",
    iconBgHigh: "rgba(239,68,68,0.12)",
  },
  {
    key: "spam" as const,
    label: "Spam",
    Icon: Mail,
    colorLow: "#15803d",
    colorMedium: "#c2410c",
    colorHigh: "#b91c1c",
    iconBgLow: "rgba(34,197,94,0.12)",
    iconBgMedium: "rgba(249,115,22,0.12)",
    iconBgHigh: "rgba(239,68,68,0.12)",
  },
  {
    key: "hate" as const,
    label: "Haine",
    Icon: Heart,
    colorLow: "#15803d",
    colorMedium: "#c2410c",
    colorHigh: "#b91c1c",
    iconBgLow: "rgba(34,197,94,0.12)",
    iconBgMedium: "rgba(249,115,22,0.12)",
    iconBgHigh: "rgba(239,68,68,0.12)",
  },
  {
    key: "violence" as const,
    label: "Violence",
    Icon: Sword,
    colorLow: "#15803d",
    colorMedium: "#c2410c",
    colorHigh: "#b91c1c",
    iconBgLow: "rgba(34,197,94,0.12)",
    iconBgMedium: "rgba(249,115,22,0.12)",
    iconBgHigh: "rgba(239,68,68,0.12)",
  },
];

// ─── Fonctions utilitaires ─────────────────────────────────────────────────

const getScoreColor = (value: number): string => {
  if (value >= 0.7) return "#b91c1c";
  if (value >= 0.4) return "#c2410c";
  return "#15803d";
};

const getScoreBg = (value: number): string => {
  if (value >= 0.7) return "rgba(239,68,68,0.15)";
  if (value >= 0.4) return "rgba(249,115,22,0.15)";
  return "rgba(34,197,94,0.15)";
};

const getScoreLabel = (value: number): { text: string; icon: React.ReactNode } => {
  if (value >= 0.7) {
    return {
      text: "Élevé",
      icon: <ShieldAlert size={12} strokeWidth={2.5} className="text-red-600" />,
    };
  }
  if (value >= 0.4) {
    return {
      text: "Moyen",
      icon: <ShieldX size={12} strokeWidth={2.5} className="text-orange-600" />,
    };
  }
  return {
    text: "Faible",
    icon: <ShieldCheck size={12} strokeWidth={2.5} className="text-green-600" />,
  };
};

const getTrendIcon = (value: number): React.ReactNode => {
  if (value >= 0.7) return <TrendingUp size={12} strokeWidth={2.5} className="text-red-500" />;
  if (value >= 0.4) return <Minus size={12} strokeWidth={2.5} className="text-orange-500" />;
  return <TrendingDown size={12} strokeWidth={2.5} className="text-green-500" />;
};

// ─── Composant principal ────────────────────────────────────────────────────

export function ModerationScores({
  scores,
  compact = false,
  showLabels = true,
  showRiskLevel = true,
  className = "",
}: ModerationScoresProps) {
  // Version compacte (pour les listes)
  if (compact) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {SCORE_CONFIG.map(({ key, label, Icon }) => {
          const value = scores[key] || 0;
          const color = getScoreColor(value);
          const bg = getScoreBg(value);
          const percentage = Math.round(value * 100);
          const { text } = getScoreLabel(value);

          return (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-[1.02]"
              style={{
                background: bg,
                color: color,
                fontFamily: "'Inter', sans-serif",
              }}
              title={`${label}: ${percentage}% - ${text}`}
            >
              <Icon size={12} strokeWidth={2.5} />
              {showLabels && `${percentage}%`}
              {!showLabels && <span className="sr-only">{label}</span>}
            </span>
          );
        })}
      </div>
    );
  }

  // Version détaillée
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header avec score global */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{
            color: "#72796e",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Scores de modération
        </span>
        <div className="flex items-center gap-2">
          <Shield size={14} strokeWidth={2} className="text-[#72796e]" />
          <span
            className="text-xs font-medium"
            style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
          >
            Risque global
          </span>
        </div>
      </div>

      {SCORE_CONFIG.map(({ key, label, Icon }) => {
        const value = scores[key] || 0;
        const percentage = Math.round(value * 100);
        const color = getScoreColor(value);
        const bg = getScoreBg(value);
        const { text, icon: riskIcon } = getScoreLabel(value);
        const trendIcon = getTrendIcon(value);

        return (
          <div key={key} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:scale-105"
                  style={{ background: bg }}
                >
                  <Icon size={14} strokeWidth={2.5} style={{ color }} />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: "#42493e",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: "#72796e" }}>
                  {percentage}%
                </span>
                {showRiskLevel && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      background: bg,
                      color: color,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {riskIcon}
                    {text}
                  </span>
                )}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {trendIcon}
                </span>
              </div>
            </div>

            {/* Barre de progression */}
            <div
              className="w-full rounded-full overflow-hidden"
              style={{
                background: "rgba(194,201,187,0.25)",
                height: "6px",
              }}
            >
              <div
                className="rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${color}${percentage > 0 ? 'cc' : '00'}, ${color})`,
                  boxShadow: percentage > 0 ? `0 0 8px ${color}40` : "none",
                }}
              />
            </div>

            {/* Seuils */}
            <div className="flex justify-between mt-1">
              <span className="text-[8px] font-medium" style={{ color: "#a0a8a0" }}>
                Faible
              </span>
              <span className="text-[8px] font-medium" style={{ color: "#a0a8a0" }}>
                Moyen
              </span>
              <span className="text-[8px] font-medium" style={{ color: "#a0a8a0" }}>
                Élevé
              </span>
            </div>
          </div>
        );
      })}

      {/* Résumé */}
      <div
        className="mt-2 pt-3 border-t flex items-center justify-between text-xs"
        style={{
          borderColor: "rgba(194,201,187,0.2)",
          color: "#72796e",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Info size={12} strokeWidth={2} />
            Score moyen
          </span>
        </div>
        <div className="flex items-center gap-3">
          {SCORE_CONFIG.map(({ key }) => {
            const value = scores[key] || 0;
            const color = getScoreColor(value);
            return (
              <span key={key} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: color }}
                />
                <span style={{ color }}>
                  {Math.round(value * 100)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Version avec icônes uniquement (encore plus compact) ──────────────────

export function ModerationScoresIconOnly({
  scores,
  className = "",
}: Omit<ModerationScoresProps, "compact" | "showLabels" | "showRiskLevel">) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {SCORE_CONFIG.map(({ key, Icon }) => {
        const value = scores[key] || 0;
        const color = getScoreColor(value);
        const bg = getScoreBg(value);
        const percentage = Math.round(value * 100);

        return (
          <span
            key={key}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: bg, color }}
            title={`${key}: ${percentage}%`}
          >
            <Icon size={12} strokeWidth={2.5} />
          </span>
        );
      })}
    </div>
  );
}

// ─── Version avec barres horizontales ──────────────────────────────────────

export function ModerationScoresHorizontal({
  scores,
  className = "",
}: Omit<ModerationScoresProps, "compact" | "showLabels" | "showRiskLevel">) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {SCORE_CONFIG.map(({ key, label, Icon }) => {
        const value = scores[key] || 0;
        const color = getScoreColor(value);
        const bg = getScoreBg(value);
        const percentage = Math.round(value * 100);

        return (
          <div key={key} className="flex items-center gap-2 flex-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: bg }}
            >
              <Icon size={12} strokeWidth={2.5} style={{ color }} />
            </div>
            <div className="flex-1">
              <div
                className="w-full rounded-full overflow-hidden"
                style={{
                  background: "rgba(194,201,187,0.2)",
                  height: "4px",
                }}
              >
                <div
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: color,
                  }}
                />
              </div>
            </div>
            <span className="text-[10px] font-medium" style={{ color }}>
              {percentage}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Export du composant principal ──────────────────────────────────────────

export default ModerationScores;