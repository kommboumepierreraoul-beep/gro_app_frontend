"use client";

import React, { useState } from "react";
import { Check, X, Eye, RefreshCw, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface ModerationActionsProps {
  contentId: number;
  contentType: "post" | "comment" | "message";
  onAction: (
    action: "approve" | "reject" | "review",
    reason?: string,
  ) => Promise<void>;
  onReanalyze?: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function ModerationActions({
  contentId,
  contentType,
  onAction,
  onReanalyze,
  disabled = false,
  className = "",
}: ModerationActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleAction = async (action: "approve" | "reject" | "review") => {
    if (action === "reject") {
      setShowRejectModal(true);
      return;
    }

    setLoading(true);
    try {
      await onAction(action);
      const messages = {
        approve: "✅ Contenu approuvé",
        review: "🔍 Contenu mis en révision",
      };
      toast.success(
        messages[action as keyof typeof messages] || "Action effectuée",
      );
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onAction("reject", rejectReason);
      toast.success("❌ Contenu rejeté");
      setShowRejectModal(false);
      setRejectReason("");
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!onReanalyze) return;
    setLoading(true);
    try {
      await onReanalyze();
      toast.success("🔄 Réanalyse en cours...");
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    base: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 14px",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: 500,
      border: "none",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      transition: "all 0.15s ease",
      fontFamily: "'Inter', sans-serif",
    },
  };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <button
          onClick={() => handleAction("approve")}
          disabled={disabled || loading}
          style={{
            ...buttonStyle.base,
            background: "rgba(34,197,94,0.12)",
            color: "#15803d",
            opacity: disabled || loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && !loading) {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(34,197,94,0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !loading) {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(34,197,94,0.12)";
            }
          }}
        >
          <Check size={15} /> Approuver
        </button>

        <button
          onClick={() => handleAction("review")}
          disabled={disabled || loading}
          style={{
            ...buttonStyle.base,
            background: "rgba(249,115,22,0.12)",
            color: "#c2410c",
            opacity: disabled || loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && !loading) {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(249,115,22,0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !loading) {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(249,115,22,0.12)";
            }
          }}
        >
          <Eye size={15} /> Réviser
        </button>

        <button
          onClick={() => handleAction("reject")}
          disabled={disabled || loading}
          style={{
            ...buttonStyle.base,
            background: "rgba(239,68,68,0.12)",
            color: "#b91c1c",
            opacity: disabled || loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && !loading) {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(239,68,68,0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !loading) {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(239,68,68,0.12)";
            }
          }}
        >
          <X size={15} /> Rejeter
        </button>

        {onReanalyze && (
          <button
            onClick={handleReanalyze}
            disabled={disabled || loading}
            style={{
              ...buttonStyle.base,
              background: "rgba(45,90,39,0.08)",
              color: "#2d5a27",
              opacity: disabled || loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!disabled && !loading) {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(45,90,39,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !loading) {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(45,90,39,0.08)";
              }
            }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />{" "}
            Réanalyser
          </button>
        )}
      </div>

      {/* Reject Modal - Design harmonisé avec l'IA */}
      {showRejectModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-2xl p-6 relative animate-slide-up"
              style={{
                background: "rgba(249,250,242,0.98)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(194,201,187,0.4)",
                boxShadow: "0 20px 60px rgba(21,66,18,0.15)",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                  }}
                >
                  <AlertTriangle size={20} style={{ color: "#b91c1c" }} />
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{
                      color: "#191c18",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Rejeter le contenu
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      color: "#72796e",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Veuillez indiquer la raison du rejet
                  </p>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Raison du rejet..."
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none"
                style={{
                  background: "rgba(194,201,187,0.12)",
                  border: "1px solid rgba(194,201,187,0.3)",
                  color: "#191c18",
                  fontFamily: "'Inter', sans-serif",
                  resize: "vertical",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "#2d5a27";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(194,201,187,0.08)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(194,201,187,0.3)";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(194,201,187,0.12)";
                }}
                autoFocus
              />

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    color: "#72796e",
                    background: "rgba(194,201,187,0.15)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(194,201,187,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(194,201,187,0.15)";
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    color: "white",
                    background: "#b91c1c",
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#991b1b";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#b91c1c";
                    }
                  }}
                >
                  {loading ? "Rejet en cours..." : "Confirmer le rejet"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
