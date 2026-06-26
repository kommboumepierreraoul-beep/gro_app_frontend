"use client";

import React from "react";
import { ModerationStatus } from "@/types/moderation";

interface ModerationBadgeProps {
  status: ModerationStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "En attente",
    icon: "⏳",
    bg: "rgba(251,191,36,0.15)",
    color: "#b45309",
    border: "rgba(251,191,36,0.3)",
  },
  approved: {
    label: "Approuvé",
    icon: "✅",
    bg: "rgba(34,197,94,0.15)",
    color: "#15803d",
    border: "rgba(34,197,94,0.3)",
  },
  review: {
    label: "En révision",
    icon: "🔍",
    bg: "rgba(249,115,22,0.15)",
    color: "#c2410c",
    border: "rgba(249,115,22,0.3)",
  },
  rejected: {
    label: "Rejeté",
    icon: "❌",
    bg: "rgba(239,68,68,0.15)",
    color: "#b91c1c",
    border: "rgba(239,68,68,0.3)",
  },
};

export function ModerationBadge({
  status,
  size = "md",
  showLabel = true,
  className = "",
}: ModerationBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium transition-all ${sizeClasses[size]} ${className}`}
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <span className="text-base">{config.icon}</span>
      {showLabel && config.label}
    </span>
  );
}
