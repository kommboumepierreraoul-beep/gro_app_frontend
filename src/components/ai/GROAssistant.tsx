/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Leaf,
  Trash2,
  X,
  ArrowUp,
  Square,
  Search,
  PenLine,
  Droplets,
  Home,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useCreatePostStore } from "@/stores/createpost.store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface GROAssistantProps {
  mode?: "panel" | "floating";
}

// ─── Design Tokens GRO ───────────────────────────────────────────────────────

const GRO = {
  primary: "#154212",
  secondary: "#2d5a27",
  accent: "#3b6934",
  light: "#e8f0e6",
  lighter: "#f2f7f1",
  border: "#c5d9c2",
  text: "#1a2e18",
  muted: "#5a7a56",
  white: "#ffffff",
  surface: "rgba(255,255,255,0.88)",
  glass: "rgba(245,250,244,0.95)",
} as const;

// ─── Suggestions rapides ──────────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  {
    icon: Search,
    label: "Diagnostic plante",
    prompt: "Ma plante a des feuilles qui jaunissent, que faire ?",
  },
  {
    icon: PenLine,
    label: "Idée de post",
    prompt: "Aide-moi à rédiger un post sur mes récoltes du mois",
  },
  {
    icon: Droplets,
    label: "Irrigation",
    prompt: "Quand et comment arroser efficacement en saison sèche ?",
  },
  {
    icon: Home,
    label: "Sol & compost",
    prompt: "Comment améliorer la qualité de mon sol avec du compost maison ?",
  },
];

// ─── Sous-composants ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "10px 14px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: GRO.accent,
            display: "inline-block",
            animation: "groTyping 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const { openModal } = useCreatePostStore();
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 8,
        alignItems: "flex-end",
        marginBottom: 14,
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${GRO.secondary}, ${GRO.accent})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: GRO.white,
          }}
        >
          <Leaf size={14} />
        </div>
      )}

      <div
        style={{
          maxWidth: "78%",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <div
          style={{
            padding: "9px 13px",
            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            background: isUser
              ? `linear-gradient(135deg, ${GRO.primary}, ${GRO.secondary})`
              : GRO.surface,
            color: isUser ? GRO.white : GRO.text,
            fontSize: 13,
            lineHeight: 1.65,
            border: isUser ? "none" : `0.5px solid ${GRO.border}`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </div>

        {!isUser && message.content.length > 50 && (
          <button
            onClick={() => openModal(message.content)}
            style={{
              alignSelf: "flex-start",
              background: "transparent",
              border: `0.5px solid ${GRO.border}`,
              borderRadius: 10,
              padding: "3px 9px",
              fontSize: 11,
              color: GRO.muted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                GRO.light;
              (e.currentTarget as HTMLButtonElement).style.color = GRO.primary;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = GRO.muted;
            }}
          >
            <PenLine size={11} />
            Utiliser pour un post
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Composant Principal ──────────────────────────────────────────────────────

export default function GROAssistant({ mode = "panel" }: GROAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(mode === "panel");
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
        if (!response.body) throw new Error("Pas de réponse reçue");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m,
            ),
          );
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(
          "Impossible de contacter GRO Assistant. Vérifiez votre connexion.",
        );
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
        inputRef.current?.focus();
      }
    },
    [messages, isStreaming],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const stopStreaming = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
  };

  // ── Bouton flottant (mode floating fermé) ─────────────────────────────────

  if (mode === "floating" && !isOpen) {
    return (
      <>
        <style>{groAnimations}</style>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir GRO Assistant"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${GRO.primary}, ${GRO.accent})`,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: GRO.white,
            boxShadow: `0 4px 20px rgba(21,66,18,0.35)`,
            zIndex: 1000,
            transition: "transform 0.2s ease",
            animation: "groPulse 2.5s ease-in-out infinite",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          <Leaf size={22} />
        </button>
      </>
    );
  }

  const containerStyle: React.CSSProperties =
    mode === "floating"
      ? {
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 380,
          height: 580,
          zIndex: 1000,
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: `0 8px 40px rgba(21,66,18,0.25), 0 2px 8px rgba(0,0,0,0.1)`,
          animation: "groSlideUp 0.25s ease-out",
        }
      : {
          width: "100%",
          height: "100%",
          minHeight: 500,
          borderRadius: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          border: `0.5px solid ${GRO.border}`,
          boxShadow: `0 4px 24px rgba(21,66,18,0.1)`,
        };

  return (
    <>
      <style>{groAnimations}</style>

      <div
        style={{
          ...containerStyle,
          background: GRO.glass,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: `linear-gradient(135deg, ${GRO.primary} 0%, ${GRO.secondary} 100%)`,
            padding: "13px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid rgba(255,255,255,0.25)",
              color: GRO.white,
            }}
          >
            <Leaf size={17} />
          </div>

          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                color: GRO.white,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              GRO Assistant
            </p>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {isStreaming ? (
                "En train de répondre..."
              ) : (
                <>
                  <CheckCircle size={10} />
                  Toujours là pour vous aider
                </>
              )}
            </p>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                title="Nouvelle conversation"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "0.5px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: GRO.white,
                }}
              >
                <Trash2 size={13} />
              </button>
            )}
            {mode === "floating" && (
              <button
                onClick={() => setIsOpen(false)}
                title="Fermer"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "0.5px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: GRO.white,
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                gap: 18,
                padding: "20px 0",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: GRO.light,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: GRO.secondary,
                }}
              >
                <Leaf size={26} />
              </div>

              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    margin: "0 0 5px",
                    color: GRO.text,
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Bonjour, je suis GRO Assistant
                </p>
                <p
                  style={{
                    margin: 0,
                    color: GRO.muted,
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Posez vos questions sur le jardinage,
                  <br />
                  l'agriculture durable ou votre communauté.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                  width: "100%",
                }}
              >
                {QUICK_SUGGESTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.label}
                      onClick={() => sendMessage(s.prompt)}
                      style={{
                        background: GRO.lighter,
                        border: `0.5px solid ${GRO.border}`,
                        borderRadius: 12,
                        padding: "9px 11px",
                        fontSize: 12,
                        color: GRO.text,
                        cursor: "pointer",
                        textAlign: "left",
                        lineHeight: 1.4,
                        transition: "all 0.15s ease",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 7,
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = GRO.light;
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = GRO.accent;
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = GRO.lighter;
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = GRO.border;
                      }}
                    >
                      <Icon
                        size={13}
                        color={GRO.secondary}
                        style={{ marginTop: 2, flexShrink: 0 }}
                      />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div
              style={{
                alignSelf: "flex-start",
                background: GRO.surface,
                border: `0.5px solid ${GRO.border}`,
                borderRadius: "16px 16px 16px 4px",
                marginBottom: 14,
              }}
            >
              <TypingIndicator />
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#fff5f5",
                border: "0.5px solid #fecaca",
                borderRadius: 12,
                padding: "10px 13px",
                fontSize: 13,
                color: "#dc2626",
                marginBottom: 12,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <div
          style={{
            padding: "9px 10px 11px",
            borderTop: `0.5px solid ${GRO.border}`,
            background: GRO.lighter,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 7,
              alignItems: "flex-end",
              background: GRO.white,
              borderRadius: 14,
              border: `1px solid ${GRO.border}`,
              padding: "5px 5px 5px 11px",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question... (Entrée pour envoyer)"
              rows={1}
              disabled={isStreaming}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 13,
                color: GRO.text,
                background: "transparent",
                fontFamily: "inherit",
                lineHeight: 1.55,
                maxHeight: 120,
                overflowY: "auto",
                padding: "4px 0",
                opacity: isStreaming ? 0.6 : 1,
              }}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
            />

            <button
              onClick={isStreaming ? stopStreaming : () => sendMessage(input)}
              disabled={!isStreaming && !input.trim()}
              title={isStreaming ? "Arrêter" : "Envoyer"}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "none",
                background: isStreaming
                  ? "#fee2e2"
                  : input.trim()
                    ? `linear-gradient(135deg, ${GRO.primary}, ${GRO.accent})`
                    : GRO.light,
                cursor: !isStreaming && !input.trim() ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: isStreaming
                  ? "#dc2626"
                  : input.trim()
                    ? GRO.white
                    : GRO.muted,
                opacity: !isStreaming && !input.trim() ? 0.5 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {isStreaming ? <Square size={13} /> : <ArrowUp size={15} />}
            </button>
          </div>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: 10,
              color: GRO.muted,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <Shield size={10} />
            GRO Assistant · Propulsé par Claude · Shift+Entrée pour nouvelle
            ligne
          </p>
        </div>
      </div>
    </>
  );
}

const groAnimations = `
@keyframes groTyping {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-5px); opacity: 1; }
}
@keyframes groPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(21,66,18,0.35); }
  50% { box-shadow: 0 4px 28px rgba(21,66,18,0.55), 0 0 0 6px rgba(21,66,18,0.08); }
}
@keyframes groSlideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
`;
