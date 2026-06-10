// components/community/posts/EditModal.tsx
import { useState, useRef, useEffect } from "react";
import { X, Check, Globe, Send, Crop, CheckCheck } from "lucide-react";
import { Avatar } from "../../shared/Avatar";
import { getFullMediaUrl } from "../shared/utils";
import { Post } from "@/types/community.types";

interface EditModalProps {
  post: Post;
  onSave: (content: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function EditModal({
  post,
  onSave,
  onCancel,
  isPending,
}: EditModalProps) {
  const [content, setContent] = useState(post.content ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX = 500;
  const remaining = MAX - content.length;

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [content]);

  const handleSave = () => {
    if (content.trim() && !isPending) {
      onSave(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

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
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
              "linear-gradient(135deg, rgba(188,240,174,0.2) 0%, transparent 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <Crop
              className="w-4 h-4"
              style={{ color: "#2d5a27" }}
              strokeWidth={1.5}
            />
            <h2
              className="text-sm font-bold"
              style={{
                color: "#154212",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Modifier la publication
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Auteur */}
          <div className="flex items-center gap-3">
            <Avatar
              src={post.author?.avatar}
              firstname={post.author?.firstname}
              size="md"
              className="ring-2 ring-green-300/50"
            />
            <div className="flex-1">
              <p
                className="text-sm font-semibold"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {post.author?.firstname} {post.author?.lastname}
              </p>
              <div
                className="mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                style={{
                  background: "rgba(45,90,39,0.1)",
                  border: "1px solid rgba(45,90,39,0.2)",
                }}
              >
                <Globe
                  className="w-3 h-3"
                  style={{ color: "#2d5a27" }}
                  strokeWidth={1.5}
                />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: "#2d5a27" }}
                >
                  Public
                </span>
              </div>
            </div>

            {/* Indicateur de modification */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{
                background: "rgba(188,240,174,0.15)",
                border: "0.5px solid rgba(45,90,39,0.2)",
              }}
            >
              <CheckCheck className="w-3 h-3" style={{ color: "#2d5a27" }} />
              <span
                className="text-[9px] font-semibold"
                style={{ color: "#2d5a27" }}
              >
                Édition
              </span>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX))}
              onKeyDown={handleKeyDown}
              placeholder="Modifiez votre publication..."
              autoFocus
              rows={5}
              maxLength={MAX}
              className="w-full resize-none outline-none text-sm leading-relaxed min-h-[100px] bg-transparent rounded-xl p-3"
              style={{
                color: "#191c18",
                fontFamily: "'Inter', sans-serif",
                background: "rgba(194,201,187,0.08)",
                border: "1px solid rgba(194,201,187,0.3)",
              }}
            />

            {/* Compteur de caractères */}
            <div className="absolute bottom-2 right-2">
              <span
                className="text-xs tabular-nums px-2 py-0.5 rounded-full"
                style={{
                  color: remaining <= 50 ? "#ba1a1a" : "#72796e",
                  background:
                    remaining <= 50
                      ? "rgba(186,26,26,0.1)"
                      : "rgba(194,201,187,0.15)",
                  fontFamily: "'Inter', sans-serif",
                  backdropFilter: "blur(4px)",
                }}
              >
                {remaining}
              </span>
            </div>
          </div>

          {/* Aperçu des médias existants (si présents) */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div
              className="rounded-xl p-3"
              style={{
                background: "rgba(194,201,187,0.08)",
                border: "1px solid rgba(194,201,187,0.2)",
              }}
            >
              <p
                className="text-xs font-medium mb-2"
                style={{ color: "#72796e" }}
              >
                Médias existants ({post.media_urls.length})
              </p>
              <div className="flex gap-2 overflow-x-auto">
                {post.media_urls.slice(0, 4).map((url, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                    style={{
                      border: "1px solid rgba(194,201,187,0.4)",
                    }}
                  >
                    <img
                      src={getFullMediaUrl(url)}
                      alt={`Media ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.4)" }}
                    >
                      <span className="text-white text-[10px] font-medium">
                        Conservé
                      </span>
                    </div>
                  </div>
                ))}
                {post.media_urls.length > 4 && (
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-lg flex-shrink-0"
                    style={{
                      background: "rgba(194,201,187,0.15)",
                      border: "1px solid rgba(194,201,187,0.3)",
                    }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#72796e" }}
                    >
                      +{post.media_urls.length - 4}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] mt-2" style={{ color: "#72796e" }}>
                ℹ️ Les médias existants ne peuvent pas être modifiés
              </p>
            </div>
          )}
        </div>

        {/* Footer modal */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{
            borderTop: "1px solid rgba(194,201,187,0.35)",
            background:
              "linear-gradient(135deg, transparent 0%, rgba(188,240,174,0.1) 100%)",
          }}
        >
          <div className="flex items-center gap-1">
            <span
              className="text-xs"
              style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
            >
              ⌨️ Ctrl + Entrée pour valider
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
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
              Annuler
            </button>

            <button
              onClick={handleSave}
              disabled={!content.trim() || isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200"
              style={
                content.trim() && !isPending
                  ? {
                      background:
                        "linear-gradient(135deg, #3b6934 0%, #154212 100%)",
                      color: "#bcf0ae",
                      boxShadow: "0 4px 12px rgba(21,66,18,0.3)",
                      fontFamily: "'Inter', sans-serif",
                    }
                  : {
                      background: "rgba(194,201,187,0.35)",
                      color: "#72796e",
                      cursor: "not-allowed",
                      fontFamily: "'Inter', sans-serif",
                    }
              }
            >
              <Send className="w-3.5 h-3.5" strokeWidth={2} />
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
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
      `}</style>
    </div>
  );
}
