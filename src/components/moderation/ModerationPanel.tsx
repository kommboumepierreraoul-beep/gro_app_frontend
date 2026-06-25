"use client";

import React, { useState } from "react";
import { ModerationBadge } from "./ModerationBadge";
import { ModerationScores } from "./ModerationScores";
import { ModerationActions } from "./ModerationActions";
import {
  ModerationStatus,
  ModerationScores as ModerationScoresType,
} from "@/types/moderation";
import { Bot, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ModerationPanelProps {
  contentType: "post" | "comment" | "message";
  contentId: number;
  currentStatus: ModerationStatus;
  scores?: ModerationScoresType;
  reason?: string;
  moderatedAt?: string;
  onAction: (
    action: "approve" | "reject" | "review",
    reason?: string,
  ) => Promise<void>;
  onReanalyze?: () => Promise<void>;
  className?: string;
}

export function ModerationPanel({
  contentType,
  contentId,
  currentStatus,
  scores,
  reason,
  moderatedAt,
  onAction,
  onReanalyze,
  className = "",
}: ModerationPanelProps) {
  const [status, setStatus] = useState(currentStatus);

  const handleAction = async (
    action: "approve" | "reject" | "review",
    reason?: string,
  ) => {
    await onAction(action, reason);
    setStatus(action);
  };

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Clock size={18} style={{ color: "#b45309" }} />;
      case "approved":
        return <CheckCircle size={18} style={{ color: "#15803d" }} />;
      case "review":
        return <AlertCircle size={18} style={{ color: "#c2410c" }} />;
      case "rejected":
        return <XCircle size={18} style={{ color: "#b91c1c" }} />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "pending":
        return "En attente d'analyse par l'IA";
      case "approved":
        return "Contenu approuvé et visible publiquement";
      case "review":
        return "Contenu en cours de révision manuelle";
      case "rejected":
        return `Contenu rejeté${reason ? `: ${reason}` : ""}`;
    }
  };

  return (
    <div
      className={`rounded-2xl p-5 transition-all ${className}`}
      style={{
        background: "rgba(249,250,242,0.9)",
        border: "1px solid rgba(194,201,187,0.3)",
        boxShadow: "0 4px 20px rgba(21,66,18,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
            }}
          >
            <Bot size={16} style={{ color: "#bcf0ae" }} />
          </div>
          <div>
            <h4
              className="text-sm font-semibold"
              style={{
                color: "#191c18",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Modération
            </h4>
            <p
              className="text-xs"
              style={{
                color: "#72796e",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {contentType === "post"
                ? "Publication"
                : contentType === "comment"
                  ? "Commentaire"
                  : "Message"}
            </p>
          </div>
        </div>

        <ModerationBadge status={status} size="md" />
      </div>

      {/* Status message */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-sm"
        style={{
          background: "rgba(194,201,187,0.12)",
          color: "#42493e",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {getStatusIcon()}
        <span>{getStatusMessage()}</span>
      </div>

      {/* Scores */}
      {scores && (
        <div className="mb-4">
          <ModerationScores scores={scores} />
        </div>
      )}

      {/* Reason */}
      {reason && status === "rejected" && (
        <div
          className="mb-4 p-3 rounded-xl text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.15)",
            color: "#b91c1c",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <strong>Motif :</strong> {reason}
        </div>
      )}

      {/* Moderated at */}
      {moderatedAt && (
        <p
          className="text-xs mb-4"
          style={{
            color: "#72796e",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Modéré le {new Date(moderatedAt).toLocaleString("fr-FR")}
        </p>
      )}

      {/* Actions */}
      {(status === "pending" || status === "review") && (
        <div
          className="pt-4 border-t"
          style={{ borderColor: "rgba(194,201,187,0.2)" }}
        >
          <ModerationActions
            contentId={contentId}
            contentType={contentType}
            onAction={handleAction}
            onReanalyze={onReanalyze}
          />
        </div>
      )}

      {status === "approved" && (
        <div
          className="pt-4 border-t"
          style={{ borderColor: "rgba(194,201,187,0.2)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-sm"
              style={{
                color: "#15803d",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              ✅ Ce contenu est approuvé
            </span>
            {onReanalyze && (
              <button
                onClick={onReanalyze}
                className="text-xs font-medium px-3 py-1 rounded-full transition-all"
                style={{
                  color: "#2d5a27",
                  background: "rgba(45,90,39,0.08)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(45,90,39,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(45,90,39,0.08)";
                }}
              >
                Réanalyser
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
