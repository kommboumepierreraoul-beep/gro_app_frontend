"use client";

import React from "react";
import { ModerationScores as ModerationScoresType } from "@/types/moderation";

interface ModerationScoresProps {
  scores: ModerationScoresType;
  compact?: boolean;
  className?: string;
}

export function ModerationScores({
  scores,
  compact = false,
  className = "",
}: ModerationScoresProps) {
  const scoreItems = [
    { key: "toxicity" as const, label: "Toxicité", icon: "⚠️" },
    { key: "spam" as const, label: "Spam", icon: "📧" },
    { key: "hate" as const, label: "Haine", icon: "💢" },
    { key: "violence" as const, label: "Violence", icon: "🔫" },
  ];

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

  const getScoreLabel = (value: number): string => {
    if (value >= 0.7) return "Élevé";
    if (value >= 0.4) return "Moyen";
    return "Faible";
  };

  if (compact) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {scoreItems.map(({ key, label, icon }) => {
          const value = scores[key] || 0;
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{
                background: getScoreBg(value),
                color: getScoreColor(value),
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {icon} {Math.round(value * 100)}%
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {scoreItems.map(({ key, label, icon }) => {
        const value = scores[key] || 0;
        const percentage = Math.round(value * 100);
        const color = getScoreColor(value);
        const bg = getScoreBg(value);

        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span
                className="text-sm font-medium"
                style={{
                  color: "#42493e",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {icon} {label}
              </span>
              <span className="text-sm font-semibold" style={{ color }}>
                {percentage}% - {getScoreLabel(value)}
              </span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{
                background: "rgba(194,201,187,0.3)",
                height: "6px",
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
        );
      })}
    </div>
  );
}
