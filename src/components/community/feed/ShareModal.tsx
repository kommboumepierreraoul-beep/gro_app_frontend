"use client";
import { useState } from "react";
import { X, Copy, Share2, Send, Globe } from "lucide-react";
import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { Post } from "@/types/community.types";
import { postService } from "@/services/community/post.service";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";

interface ShareModalProps {
  post: Post;
  onClose: () => void;
}

export function ShareModal({ post, onClose }: ShareModalProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const url = `${window.location.origin}/community/post/${post.id}`;

  const handleShareInternal = async () => {
    setLoading(true);
    try {
      await postService.sharePost(post.id, text);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Publication partagée !");
      onClose();
    } catch {
      toast.error("Erreur lors du partage.");
    } finally {
      setLoading(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Publication",
          text: text || post.content,
          url,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      toast.error("Partage non supporté sur ce navigateur");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text || "Regarde cette publication");

  const social = [
    {
      name: "WhatsApp",
      bg: "#25D366",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M20.5 3.5A11.8 11.8 0 0012 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.6 6L0 24l6.3-1.7a12 12 0 005.7 1.5c6.6 0 12-5.3 12-11.9 0-3.2-1.3-6.2-3.5-8.4z" />
        </svg>
      ),
      link: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "Facebook",
      bg: "#1877F2",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M22 12a10 10 0 10-11.5 9.9v-7H8.9V12h1.6V9.8c0-1.6 1-2.5 2.4-2.5h1.4v1.6h-.8c-.8 0-1 .5-1 1v2h1.8l-.3 2.9h-1.5v7A10 10 0 0022 12z" />
        </svg>
      ),
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "X",
      bg: "#191c18",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.9 2H22l-7 8 8 12h-6.8l-5.3-6.6L4.9 22H2l7.5-8.6L1 2h6.9l4.8 6.2L18.9 2z" />
        </svg>
      ),
      link: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "Email",
      bg: "#805533",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
      link: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(15,25,12,0.65)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "rgba(249,250,242,0.98)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(194,201,187,0.5)",
          boxShadow: "0 24px 60px rgba(21,66,18,0.2)",
          animation: "groSlideUp 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            borderBottom: "1px solid rgba(194,201,187,0.35)",
            background:
              "linear-gradient(135deg, rgba(188,240,174,0.18) 0%, transparent 100%)",
          }}
        >
          <h2
            className="text-sm font-bold"
            style={{
              color: "#154212",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Partager la publication
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150"
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
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">
          {/* USER */}
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} firstname={user?.firstname} size="md" />
            <div>
              <p
                className="text-sm font-semibold"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {user?.firstname} {user?.lastname}
              </p>
              <div
                className="flex items-center gap-1 mt-0.5 inline-flex rounded-full px-2 py-0.5"
                style={{
                  background: "rgba(45,90,39,0.08)",
                  border: "1px solid rgba(45,90,39,0.18)",
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
                  Partage public
                </span>
              </div>
            </div>
          </div>

          {/* TEXTAREA */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ajouter un commentaire..."
            rows={3}
            className="w-full resize-none outline-none text-sm leading-relaxed rounded-xl px-3 py-2.5 transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(194,201,187,0.45)",
              color: "#191c18",
              fontFamily: "'Inter', sans-serif",
            }}
            onFocus={(e) => {
              (e.target as HTMLElement).style.borderColor =
                "rgba(45,90,39,0.4)";
              (e.target as HTMLElement).style.boxShadow =
                "0 0 0 3px rgba(188,240,174,0.2)";
            }}
            onBlur={(e) => {
              (e.target as HTMLElement).style.borderColor =
                "rgba(194,201,187,0.45)";
              (e.target as HTMLElement).style.boxShadow = "none";
            }}
          />

          {/* ORIGINAL POST PREVIEW */}
          <div
            className="rounded-xl p-3"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(194,201,187,0.4)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                src={post.author?.avatar}
                firstname={post.author?.firstname}
                size="xs"
              />
              <div>
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: "#191c18",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {post.author?.firstname} {post.author?.lastname}
                </p>
                <TimeAgo
                  date={post.created_at}
                  className="text-[10px]"
                  style={{ color: "#72796e" }}
                />
              </div>
            </div>
            <p
              className="text-xs line-clamp-3 leading-relaxed"
              style={{ color: "#42493e", fontFamily: "'Inter', sans-serif" }}
            >
              {post.content}
            </p>
          </div>

          {/* SOCIAL */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2"
              style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
            >
              Partager sur
            </p>
            <div className="flex flex-wrap gap-2">
              {social.map((s) => (
                <a
                  key={s.name}
                  href={s.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-semibold transition-all duration-150 hover:opacity-90 hover:scale-[1.03]"
                  style={{
                    background: s.bg,
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {s.icon}
                  {s.name}
                </a>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <button
              onClick={handleNativeShare}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
              style={{
                background: "rgba(194,201,187,0.25)",
                border: "1px solid rgba(194,201,187,0.45)",
                color: "#42493e",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(188,240,174,0.25)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(194,201,187,0.25)")
              }
            >
              <Share2 className="w-4 h-4" />
              Partage natif
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
              style={{
                background: "rgba(194,201,187,0.25)",
                border: "1px solid rgba(194,201,187,0.45)",
                color: "#42493e",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(188,240,174,0.25)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(194,201,187,0.25)")
              }
            >
              <Copy className="w-4 h-4" />
              Copier lien
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid rgba(194,201,187,0.35)" }}
        >
          <button
            onClick={handleShareInternal}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #3b6934 0%, #154212 100%)",
              color: "#bcf0ae",
              boxShadow: "0 4px 12px rgba(21,66,18,0.25)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {loading ? (
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{
                  borderColor: "rgba(188,240,174,0.4)",
                  borderTopColor: "transparent",
                }}
              />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? "Partage..." : "Partager sur le feed"}
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
      `}</style>
    </div>
  );
}
