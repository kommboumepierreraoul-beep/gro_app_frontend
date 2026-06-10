// components/community/posts/DeleteModal.tsx
import { X, Trash2, AlertTriangle } from "lucide-react";

interface DeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function DeleteModal({
  onConfirm,
  onCancel,
  isPending,
}: DeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(15,25,12,0.6)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "rgba(249,250,242,0.98)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(194,201,187,0.5)",
          boxShadow: "0 24px 60px rgba(21,66,18,0.2)",
          animation: "groSlideUp 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            borderBottom: "1px solid rgba(194,201,187,0.35)",
            background:
              "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, transparent 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="w-4 h-4"
              style={{ color: "#dc2626" }}
              strokeWidth={1.5}
            />
            <h2
              className="text-sm font-bold"
              style={{
                color: "#991b1b",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Supprimer la publication
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150"
            style={{
              background: "rgba(194,201,187,0.3)",
              color: "#42493e",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(194,201,187,0.5)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(194,201,187,0.3)")
            }
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body modal */}
        <div className="px-5 py-6 text-center space-y-4">
          {/* Icône d'avertissement */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.2)",
              animation: "pulseWarning 0.5s ease-out",
            }}
          >
            <Trash2
              className="w-8 h-8"
              style={{ color: "#dc2626", strokeWidth: 1.5 }}
            />
          </div>

          {/* Message d'avertissement */}
          <div className="space-y-2">
            <h3
              className="text-base font-bold"
              style={{
                color: "#191c18",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Êtes-vous absolument sûr ?
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#72796e" }}>
              Cette action est{" "}
              <span className="font-semibold" style={{ color: "#991b1b" }}>
                irréversible
              </span>
              . La publication ainsi que tous ses commentaires et réactions
              seront définitivement supprimés de nos serveurs.
            </p>
          </div>

          {/* Informations supplémentaires */}
          <div
            className="rounded-xl p-3 text-left"
            style={{
              background: "rgba(220,38,38,0.05)",
              border: "1px solid rgba(220,38,38,0.15)",
            }}
          >
            <p className="text-xs" style={{ color: "#991b1b" }}>
              ⚠️ Cette action ne peut pas être annulée. Les données supprimées
              ne pourront pas être récupérées.
            </p>
          </div>
        </div>

        {/* Footer modal */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{
            borderTop: "1px solid rgba(194,201,187,0.35)",
            background:
              "linear-gradient(135deg, transparent 0%, rgba(239,68,68,0.05) 100%)",
          }}
        >
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: "rgba(194,201,187,0.15)",
              color: "#72796e",
              fontFamily: "'Inter', sans-serif",
              border: "1px solid rgba(194,201,187,0.3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(194,201,187,0.25)";
              (e.currentTarget as HTMLElement).style.color = "#42493e";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(194,201,187,0.15)";
              (e.currentTarget as HTMLElement).style.color = "#72796e";
            }}
          >
            Non, annuler
          </button>

          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={
              !isPending
                ? {
                    background:
                      "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                    color: "#fecaca",
                    boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
                    fontFamily: "'Inter', sans-serif",
                  }
                : {
                    background: "rgba(220,38,38,0.3)",
                    color: "#fecaca80",
                    cursor: "not-allowed",
                    fontFamily: "'Inter', sans-serif",
                  }
            }
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
            {isPending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Suppression...
              </>
            ) : (
              "Oui, supprimer"
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes groSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseWarning {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
