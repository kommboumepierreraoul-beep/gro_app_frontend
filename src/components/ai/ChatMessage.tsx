/* eslint-disable react/no-unescaped-entities */
// components/ai/ChatMessage.tsx
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";
import { AIMessage } from "@/types/ai.types";
import { useAIChat } from "@/hooks/AI/useAIChat";
import {
  Copy,
  Check,
  Sparkles,
  Loader2,
  User,
  Bot,
  Reply,
  Forward,
  Info,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChatMessageProps {
  message: AIMessage;
  isStreaming?: boolean;
  onReply?: (message: AIMessage) => void;
  onForward?: (message: AIMessage) => void;
  onDelete?: (messageId: string) => void;
  onInfo?: (message: AIMessage) => void;
}

export function ChatMessage({
  message,
  isStreaming,
  onReply,
  onForward,
  onDelete,
  onInfo,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const { improveText } = useAIChat();
  const [improvedVersion, setImprovedVersion] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isUser = message.role === "user";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Message copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImprove = async () => {
    setIsImproving(true);
    try {
      const improved = await improveText(message.content);
      setImprovedVersion(improved);
      toast.success("Texte amélioré avec succès !");
    } catch (error) {
      console.error("Improvement error:", error);
      toast.error("Impossible d'améliorer le texte");
    } finally {
      setIsImproving(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm("Supprimer ce message ?")) {
      onDelete(message.id);
      toast.success("Message supprimé");
    }
  };

  const markdownComponents: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const isBlock = Boolean(match);

      return isBlock ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match![1]}
          PreTag="div"
          customStyle={{
            borderRadius: "0.75rem",
            fontSize: "0.8125rem",
            margin: "0.5rem 0",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code
          className={`px-1.5 py-0.5 rounded-md font-mono text-[0.85em] ${
            isUser
              ? "bg-white/15 text-white"
              : "bg-[rgba(45,90,39,0.08)] text-[#2d5a27]"
          } ${className ?? ""}`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          {...props}
        >
          {children}
        </code>
      );
    },

    p({ children }) {
      return (
        <p className="leading-relaxed mb-2 last:mb-0" style={{ fontFamily: "'Inter', sans-serif" }}>
          {children}
        </p>
      );
    },

    ul({ children }) {
      return (
        <ul className="list-disc pl-5 space-y-1 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          {children}
        </ul>
      );
    },

    ol({ children }) {
      return (
        <ol className="list-decimal pl-5 space-y-1 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          {children}
        </ol>
      );
    },

    blockquote({ children }) {
      return (
        <blockquote
          className="pl-4 border-l-4 border-[#2d5a27] my-2 italic"
          style={{ color: "#72796e" }}
        >
          {children}
        </blockquote>
      );
    },

    h1({ children }) {
      return (
        <h1 className="text-xl font-bold my-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {children}
        </h1>
      );
    },

    h2({ children }) {
      return (
        <h2 className="text-lg font-bold my-2.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {children}
        </h2>
      );
    },

    h3({ children }) {
      return (
        <h3 className="text-base font-semibold my-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {children}
        </h3>
      );
    },

    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline underline-offset-2 transition-colors ${
            isUser
              ? "text-white hover:text-white/80"
              : "text-[#2d5a27] hover:text-[#154212]"
          }`}
        >
          {children}
        </a>
      );
    },

    table({ children }) {
      return (
        <div className="overflow-x-auto my-2">
          <table className="min-w-full border-collapse text-sm">{children}</table>
        </div>
      );
    },

    th({ children }) {
      return (
        <th className="border border-[rgba(194,201,187,0.4)] px-3 py-2 text-left font-semibold bg-[rgba(243,244,237,0.5)]">
          {children}
        </th>
      );
    },

    td({ children }) {
      return (
        <td className="border border-[rgba(194,201,187,0.4)] px-3 py-2">
          {children}
        </td>
      );
    },
  };

  const iconBtnStyle: React.CSSProperties = {
    padding: "4px 8px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-slide-in`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar assistant */}
      {!isUser && (
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
            color: "#bcf0ae",
          }}
        >
          <Bot size={18} className="sm:w-[20px] sm:h-[20px]" />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm transition-all ${
          isUser
            ? "bg-[#2d5a27] text-white rounded-tr-sm shadow-sm"
            : "bg-white border border-[rgba(194,201,187,0.3)] text-[#191c18] rounded-tl-sm shadow-sm"
        } ${isStreaming ? "border-l-4 border-l-[#2d5a27]" : ""}`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* En-tête rôle */}
        <div
          className={`flex items-center gap-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wide ${
            isUser ? "text-white/70" : "text-[#72796e]"
          }`}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <span>{isUser ? "Vous" : "Assistant IA"}</span>
          {isStreaming && (
            <span className="inline-flex gap-0.5 items-center">
              <span
                className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          )}
        </div>

        {/* Contenu */}
        <div className={isUser ? "prose-invert" : ""}>
          {improvedVersion ? (
            <div>
              <div
                className="flex items-center gap-1.5 text-[11px] font-bold mb-2"
                style={{ color: "#154212" }}
              >
                <Sparkles size={14} />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Version améliorée
                </span>
              </div>
              <ReactMarkdown components={markdownComponents}>
                {improvedVersion}
              </ReactMarkdown>
              <button
                onClick={() => setImprovedVersion(null)}
                className="mt-2 text-[12px] font-semibold transition-colors hover:underline"
                style={{ color: "#2d5a27" }}
              >
                Voir l'original
              </button>
            </div>
          ) : (
            <ReactMarkdown components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Actions */}
        <div
          className={`flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t ${
            isUser ? "border-white/15" : "border-[rgba(194,201,187,0.3)]"
          }`}
        >
          <button
            onClick={copyToClipboard}
            style={{
              ...iconBtnStyle,
              color: isUser ? "rgba(255,255,255,0.8)" : "#42493e",
              background: isUser
                ? "rgba(255,255,255,0.1)"
                : "rgba(45,90,39,0.06)",
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.background = isUser
                ? "rgba(255,255,255,0.2)"
                : "rgba(45,90,39,0.12)";
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.background = isUser
                ? "rgba(255,255,255,0.1)"
                : "rgba(45,90,39,0.06)";
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copié" : "Copier"}
          </button>

          {!isUser && !improvedVersion && (
            <button
              onClick={handleImprove}
              disabled={isImproving}
              style={{
                ...iconBtnStyle,
                color: "#154212",
                background: "rgba(188,240,174,0.2)",
                opacity: isImproving ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement;
                if (!isImproving) {
                  target.style.background = "rgba(188,240,174,0.35)";
                }
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement;
                if (!isImproving) {
                  target.style.background = "rgba(188,240,174,0.2)";
                }
              }}
            >
              {isImproving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {isImproving ? "Amélioration..." : "Améliorer"}
            </button>
          )}

          {/* Actions supplémentaires (sur hover) */}
          {showActions && !isUser && (
            <>
              <button
                onClick={() => onReply?.(message)}
                style={{
                  ...iconBtnStyle,
                  color: "#72796e",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.background = "rgba(45,90,39,0.06)";
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.background = "transparent";
                }}
              >
                <Reply size={14} />
              </button>
              <button
                onClick={() => onForward?.(message)}
                style={{
                  ...iconBtnStyle,
                  color: "#72796e",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.background = "rgba(45,90,39,0.06)";
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.background = "transparent";
                }}
              >
                <Forward size={14} />
              </button>
              <button
                onClick={() => onInfo?.(message)}
                style={{
                  ...iconBtnStyle,
                  color: "#72796e",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.background = "rgba(45,90,39,0.06)";
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.background = "transparent";
                }}
              >
                <Info size={14} />
              </button>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  style={{
                    ...iconBtnStyle,
                    color: "#ba1a1a",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.background = "rgba(186,26,26,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.background = "transparent";
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Tokens */}
        {message.tokens && (
          <div
            className={`text-[10px] mt-1.5 ${
              isUser ? "text-white/40" : "text-[#72796e]/60"
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ~{message.tokens} tokens
          </div>
        )}
      </div>

      {/* Avatar user */}
      {isUser && (
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #42493e 0%, #2d5a27 100%)",
            color: "#bcf0ae",
          }}
        >
          <User size={18} className="sm:w-[20px] sm:h-[20px]" />
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}