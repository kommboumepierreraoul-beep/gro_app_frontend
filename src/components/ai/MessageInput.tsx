// components/ai/MessageInput.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Zap, ZapOff, Loader2, Lightbulb, CornerDownLeft } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string, useStreaming?: boolean) => void;
  isLoading: boolean;
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [useStreaming, setUseStreaming] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160,
      )}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim(), useStreaming);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const examples = [
    "Qu'est-ce qu'une mission AgriPulse ?",
    "Génère-moi des tags pour mon post",
    "Résume cette discussion",
    "Améliore mon texte",
  ];

  const iconBtnStyle: React.CSSProperties = {
    padding: "4px 12px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div
      className="border-t border-[rgba(194,201,187,0.4)] px-3 sm:px-4 py-2 sm:py-3"
      style={{
        background: "rgba(249,250,242,0.95)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Options */}
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setUseStreaming(!useStreaming)}
            style={{
              ...iconBtnStyle,
              color: useStreaming ? "#2d5a27" : "#72796e",
              background: useStreaming
                ? "rgba(188,240,174,0.25)"
                : "rgba(114,121,110,0.08)",
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.background = useStreaming
                ? "rgba(188,240,174,0.35)"
                : "rgba(114,121,110,0.15)";
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.background = useStreaming
                ? "rgba(188,240,174,0.25)"
                : "rgba(114,121,110,0.08)";
            }}
          >
            {useStreaming ? (
              <Zap size={14} />
            ) : (
              <ZapOff size={14} />
            )}
            <span>{useStreaming ? "Streaming activé" : "Streaming désactivé"}</span>
          </button>

          <span
            className="text-[11px]"
            style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
          >
            {message.length} caractères
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Posez votre question... (Shift+Entrée pour une nouvelle ligne)"
              className="w-full bg-white rounded-2xl px-4 py-3 pr-12 resize-none text-sm transition-all"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: "#191c18",
                border: isFocused
                  ? "2px solid #2d5a27"
                  : "1px solid rgba(194,201,187,0.4)",
                boxShadow: isFocused
                  ? "0 0 0 4px rgba(45,90,39,0.1)"
                  : "none",
                outline: "none",
                minHeight: "48px",
                maxHeight: "160px",
              }}
              rows={1}
              disabled={isLoading}
            />
            {useStreaming && isLoading && (
              <div
                className="absolute right-3 bottom-3 w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#2d5a27" }}
              />
            )}
            {message.length === 0 && !isLoading && (
              <div
                className="absolute right-3 bottom-3 text-[#72796e]/40"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <CornerDownLeft size={14} />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="shrink-0 rounded-2xl w-12 h-12 flex items-center justify-center shadow-sm transition-all active:scale-[0.96]"
            style={{
              background: message.trim() && !isLoading
                ? "linear-gradient(135deg, #2d5a27 0%, #154212 100%)"
                : "#e5e7e0",
              color: message.trim() && !isLoading ? "#bcf0ae" : "#a0a69b",
              cursor: message.trim() && !isLoading ? "pointer" : "not-allowed",
              boxShadow: message.trim() && !isLoading
                ? "0 2px 8px rgba(45,90,39,0.15)"
                : "none",
            }}
            onMouseEnter={(e) => {
              if (message.trim() && !isLoading) {
                const target = e.currentTarget as HTMLElement;
                target.style.transform = "scale(1.02)";
                target.style.boxShadow = "0 4px 12px rgba(45,90,39,0.25)";
              }
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = "scale(1)";
              if (message.trim() && !isLoading) {
                target.style.boxShadow = "0 2px 8px rgba(45,90,39,0.15)";
              }
            }}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>

        {/* Exemples */}
        {message.length === 0 && !isLoading && (
          <div className="mt-3">
            <div
              className="flex items-center gap-1.5 text-[11px] mb-1.5"
              style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
            >
              <Lightbulb size={14} />
              <span className="font-medium">Suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(example)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all active:scale-[0.97]"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: "#42493e",
                    background: "white",
                    borderColor: "rgba(194,201,187,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.borderColor = "#2d5a27";
                    target.style.color = "#2d5a27";
                    target.style.boxShadow = "0 2px 8px rgba(45,90,39,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.borderColor = "rgba(194,201,187,0.4)";
                    target.style.color = "#42493e";
                    target.style.boxShadow = "none";
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}