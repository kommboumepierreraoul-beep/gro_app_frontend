/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Share2, Send, Globe } from "lucide-react";
import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { Post } from "@/types/community.types";
import { useAuthStore } from "@/stores/auth.store";
import { useSharePost } from "./useSharepost";
import { buildSocialLinks } from "./Sociallinks";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShareModalProps {
  post: Post;
  onClose: () => void;
}

// ─── Constante ────────────────────────────────────────────────────────────────

const MAX_COMMENT_LENGTH = 500;

// ─── Sous-composants ──────────────────────────────────────────────────────────

function ShareHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
      <h2 id="share-modal-title" className="text-sm font-bold text-gray-900">
        Partager la publication
      </h2>
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function ShareUser({
  firstname,
  lastname,
  avatar,
}: {
  firstname?: string;
  lastname?: string;
  avatar?: any;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={avatar} firstname={firstname} size="md" />
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {firstname} {lastname}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Globe
            className="w-3 h-3 text-green-950"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="text-[10px] font-medium text-green-950">
            Partage public
          </span>
        </div>
      </div>
    </div>
  );
}

function ShareTextarea({
  value,
  onChange,
  textareaRef,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  disabled: boolean;
}) {
  return (
    <div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ajouter un commentaire..."
        rows={3}
        maxLength={MAX_COMMENT_LENGTH}
        disabled={disabled}
        aria-label="Commentaire de partage"
        className="w-full resize-none outline-none text-sm text-gray-800 leading-relaxed rounded-xl px-3 py-2.5 border border-gray-200 focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition bg-white disabled:opacity-50"
      />
      <p className="text-right text-[10px] text-gray-400 mt-1">
        {value.length} / {MAX_COMMENT_LENGTH}
      </p>
    </div>
  );
}

function PostPreview({ post }: { post: Post }) {
  const authorName = post.author
    ? `${post.author.firstname ?? ""} ${post.author.lastname ?? ""}`.trim()
    : "Auteur inconnu";

  return (
    <div className="rounded-xl p-3 bg-gray-50/70 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Avatar
          src={post.author?.avatar}
          firstname={post.author?.firstname ?? "?"}
          size="xs"
        />
        <div>
          <p className="text-xs font-semibold text-gray-900">{authorName}</p>
          <TimeAgo
            date={post.created_at}
            className="text-[10px] text-gray-400"
          />
        </div>
      </div>

      {post.content ? (
        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
          {post.content}
        </p>
      ) : (
        <p className="text-xs text-gray-400 italic">
          Cette publication ne contient pas de texte.
        </p>
      )}
    </div>
  );
}

function SocialButtons({
  social,
  disabled,
}: {
  social: ReturnType<typeof buildSocialLinks>;
  disabled: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
        Partager sur
      </p>
      <div className="flex flex-wrap gap-2">
        {social.map((s) => (
          <a
            key={s.name}
            href={disabled ? undefined : s.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`Partager sur ${s.name}`}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-semibold transition-all duration-150 hover:opacity-90 hover:scale-[1.02] aria-disabled:opacity-40 aria-disabled:pointer-events-none"
            style={{
              background: s.bg,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {s.icon}
            {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}

function ShareActions({
  onNativeShare,
  onCopy,
  disabled,
}: {
  onNativeShare: () => void;
  onCopy: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onNativeShare}
        disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
      >
        <Share2 className="w-4 h-4" aria-hidden="true" />
        Partage natif
      </button>
      <button
        onClick={onCopy}
        disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
      >
        <Copy className="w-4 h-4" aria-hidden="true" />
        Copier lien
      </button>
    </div>
  );
}

function ShareFooter({
  onShare,
  loading,
}: {
  onShare: () => void;
  loading: boolean;
}) {
  return (
    <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
      <button
        onClick={onShare}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-950 hover:bg-green-900 disabled:opacity-50 transition"
      >
        {loading ? (
          <div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            aria-label="Partage en cours"
          />
        ) : (
          <Send className="w-4 h-4" aria-hidden="true" />
        )}
        {loading ? "Partage..." : "Partager sur le feed"}
      </button>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export function ShareModal({ post, onClose }: ShareModalProps) {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ✅ Correction : Utiliser setTimeout pour éviter le setState synchrone
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Calcul direct de l'URL sans état ni effet
  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/community/post/${post.id}`;
  }, [post.id]);

  // ✅ Vérification que l'URL est prête
  const urlReady = url !== "";

  // ✅ Logique métier extraite dans un hook
  const { loading, handleShareInternal, handleNativeShare, handleCopy } =
    useSharePost(post.id, url, onClose);

  // ✅ encodedText / encodedUrl mémoïsés
  const encodedUrl = useMemo(() => encodeURIComponent(url), [url]);
  const encodedText = useMemo(
    () => encodeURIComponent(text || "Regarde cette publication"),
    [text],
  );

  // ✅ Tableau social mémoïsé
  const social = useMemo(
    () => buildSocialLinks(encodedText, encodedUrl),
    [encodedText, encodedUrl],
  );

  // ✅ Fermeture via Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ✅ Blocage du scroll du body quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ✅ Focus automatique sur le textarea à l'ouverture
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = useCallback(() => {
    handleShareInternal(text);
  }, [handleShareInternal, text]);

  const handleNative = useCallback(() => {
    handleNativeShare(text, post.content ?? "");
  }, [handleNativeShare, text, post.content]);

  // ✅ Contenu du modal
  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        style={{
          animation: "slideUp 0.25s ease-out",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ShareHeader onClose={onClose} />

        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <ShareUser
            firstname={user?.firstname}
            lastname={user?.lastname}
            avatar={user?.avatar}
          />

          <ShareTextarea
            value={text}
            onChange={setText}
            textareaRef={textareaRef}
            disabled={loading}
          />

          <PostPreview post={post} />

          <SocialButtons social={social} disabled={!urlReady || loading} />

          <ShareActions
            onNativeShare={handleNative}
            onCopy={handleCopy}
            disabled={!urlReady || loading}
          />
        </div>

        <ShareFooter onShare={handleShare} loading={loading} />
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );

  // ✅ Vérification du montage côté client
  if (!isClient) return null;
  return createPortal(modalContent, document.body);
}
