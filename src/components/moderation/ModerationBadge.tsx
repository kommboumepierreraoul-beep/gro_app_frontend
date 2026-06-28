"use client";

import React from "react";
import { ModerationStatus } from "@/types/moderation";
import {
  Clock,
  CheckCircle,
  Eye,
  XCircle,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldX,
  ShieldQuestion,
} from "lucide-react";

interface ModerationBadgeProps {
  status: ModerationStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
  variant?: "default" | "outline" | "pill";
}

const statusConfig = {
  pending: {
    label: "En attente",
    Icon: Clock,
    bg: "rgba(251,191,36,0.12)",
    color: "#b45309",
    border: "rgba(251,191,36,0.25)",
    hoverBg: "rgba(251,191,36,0.2)",
  },
  approved: {
    label: "Approuvé",
    Icon: CheckCircle,
    bg: "rgba(34,197,94,0.12)",
    color: "#15803d",
    border: "rgba(34,197,94,0.25)",
    hoverBg: "rgba(34,197,94,0.2)",
  },
  review: {
    label: "En révision",
    Icon: Eye,
    bg: "rgba(249,115,22,0.12)",
    color: "#c2410c",
    border: "rgba(249,115,22,0.25)",
    hoverBg: "rgba(249,115,22,0.2)",
  },
  rejected: {
    label: "Rejeté",
    Icon: XCircle,
    bg: "rgba(239,68,68,0.12)",
    color: "#b91c1c",
    border: "rgba(239,68,68,0.25)",
    hoverBg: "rgba(239,68,68,0.2)",
  },
};

// ─── Variantes d'icônes alternatives ────────────────────────────────────────

const getIconByStatus = (status: ModerationStatus) => {
  switch (status) {
    case "pending":
      return <Clock size={14} strokeWidth={2.5} />;
    case "approved":
      return <CheckCircle size={14} strokeWidth={2.5} />;
    case "review":
      return <Eye size={14} strokeWidth={2.5} />;
    case "rejected":
      return <XCircle size={14} strokeWidth={2.5} />;
    default:
      return <AlertCircle size={14} strokeWidth={2.5} />;
  }
};

const getStatusIconVariant = (status: ModerationStatus) => {
  switch (status) {
    case "pending":
      return <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />;
    case "approved":
      return <ShieldCheck size={14} strokeWidth={2.5} />;
    case "review":
      return <ShieldQuestion size={14} strokeWidth={2.5} />;
    case "rejected":
      return <ShieldX size={14} strokeWidth={2.5} />;
    default:
      return <AlertCircle size={14} strokeWidth={2.5} />;
  }
};

// ─── Composant principal ─────────────────────────────────────────────────────

export function ModerationBadge({
  status,
  size = "md",
  showLabel = true,
  showIcon = true,
  className = "",
  variant = "default",
}: ModerationBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.Icon;

  const sizeClasses = {
    sm: {
      padding: "px-2 py-0.5",
      text: "text-[10px]",
      gap: "gap-1",
      iconSize: 12,
    },
    md: {
      padding: "px-3 py-1",
      text: "text-xs",
      gap: "gap-1.5",
      iconSize: 14,
    },
    lg: {
      padding: "px-4 py-1.5",
      text: "text-sm",
      gap: "gap-2",
      iconSize: 16,
    },
  };

  const variantClasses = {
    default: {
      background: config.bg,
      border: `1px solid ${config.border}`,
      shadow: "shadow-sm",
    },
    outline: {
      background: "transparent",
      border: `1.5px solid ${config.color}`,
      shadow: "none",
    },
    pill: {
      background: config.bg,
      border: `1px solid ${config.border}`,
      shadow: "shadow-sm",
      borderRadius: "50px",
    },
  };

  const currentVariant = variantClasses[variant];
  const currentSize = sizeClasses[size];

  return (
    <span
      className={`
        inline-flex items-center 
        font-semibold 
        transition-all duration-200 
        hover:scale-[1.02]
        ${currentSize.padding}
        ${currentSize.text}
        ${currentSize.gap}
        ${currentVariant.border}
        ${currentVariant.shadow}
        ${variant === "pill" ? "rounded-full" : "rounded-full"}
        ${className}
      `}
      style={{
        background: currentVariant.background,
        color: config.color,
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={(e) => {
        if (variant !== "outline") {
          e.currentTarget.style.background = config.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (variant !== "outline") {
          e.currentTarget.style.background = currentVariant.background;
        }
      }}
    >
      {showIcon && (
        <Icon 
          size={currentSize.iconSize} 
          strokeWidth={2.5}
          className="flex-shrink-0"
        />
      )}
      {showLabel && config.label}
    </span>
  );
}

// ─── Sous-composants spécifiques ────────────────────────────────────────────

export function PendingBadge({ size = "md", showLabel = true }: Omit<ModerationBadgeProps, "status">) {
  return <ModerationBadge status="pending" size={size} showLabel={showLabel} />;
}

export function ApprovedBadge({ size = "md", showLabel = true }: Omit<ModerationBadgeProps, "status">) {
  return <ModerationBadge status="approved" size={size} showLabel={showLabel} />;
}

export function ReviewBadge({ size = "md", showLabel = true }: Omit<ModerationBadgeProps, "status">) {
  return <ModerationBadge status="review" size={size} showLabel={showLabel} />;
}

export function RejectedBadge({ size = "md", showLabel = true }: Omit<ModerationBadgeProps, "status">) {
  return <ModerationBadge status="rejected" size={size} showLabel={showLabel} />;
}

// ─── Version compacte ────────────────────────────────────────────────────────

export function ModerationBadgeCompact({ status }: { status: ModerationStatus }) {
  const config = statusConfig[status];
  const Icon = config.Icon;

  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110"
      style={{ background: config.bg, color: config.color }}
      title={config.label}
    >
      <Icon size={14} strokeWidth={2.5} />
    </span>
  );
}

// ─── Version avec compteur ───────────────────────────────────────────────────

interface ModerationBadgeWithCountProps extends ModerationBadgeProps {
  count?: number;
}

export function ModerationBadgeWithCount({
  status,
  count = 0,
  size = "md",
  showLabel = true,
  className = "",
}: ModerationBadgeWithCountProps) {
  const config = statusConfig[status];
  const Icon = config.Icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  if (count === 0) return null;

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold 
        transition-all hover:scale-[1.02]
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Icon size={size === "sm" ? 12 : size === "md" ? 14 : 16} strokeWidth={2.5} />
      {showLabel && config.label}
      {count > 0 && (
        <span
          className="ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full"
          style={{ background: "rgba(0,0,0,0.08)" }}
        >
          {count}
        </span>
      )}
    </span>
  );
}

// ─── Version avec animation ──────────────────────────────────────────────────

export function ModerationBadgeAnimated({
  status,
  size = "md",
  showLabel = true,
}: Omit<ModerationBadgeProps, "className">) {
  const config = statusConfig[status];
  const Icon = config.Icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold 
        transition-all duration-300
        hover:scale-[1.05]
        ${sizeClasses[size]}
        ${status === "pending" ? "animate-pulse" : ""}
      `}
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {status === "pending" ? (
        <Icon size={size === "sm" ? 12 : size === "md" ? 14 : 16} strokeWidth={2.5} className="animate-spin" />
      ) : (
        <Icon size={size === "sm" ? 12 : size === "md" ? 14 : 16} strokeWidth={2.5} />
      )}
      {showLabel && config.label}
    </span>
  );
}

// ─── Export du composant principal ──────────────────────────────────────────

export default ModerationBadge;