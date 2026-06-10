"use client";
import { useState, useRef } from "react";
import { Paperclip, Send, X } from "lucide-react";
import Image from "next/image";

interface MessageInputProps {
  onSend: (content: string, media?: File) => void;
  isLoading: boolean;
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if ((!message.trim() && !mediaFile) || isLoading) return;
    onSend(message, mediaFile || undefined);
    setMessage("");
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
      setMediaFile(null);
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    setMediaFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div
      className="px-4 py-3 flex-shrink-0"
      style={{
        background: "rgba(249,250,242,0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(194,201,187,0.35)",
      }}
    >
      {mediaPreview && (
        <div className="relative mb-2 inline-block">
          <div
            className="relative w-20 h-20 rounded-xl overflow-hidden"
            style={{ background: "#edefe7" }}
          >
            <Image
              src={mediaPreview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            onClick={removeMedia}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
            style={{ background: "#ba1a1a", color: "#fff" }}
          >
            <X size={11} />
          </button>
        </div>
      )}

      <div
        className="flex items-end gap-1.5 p-1.5 rounded-2xl transition-all"
        style={{
          background: "#ffffff",
          border: "1px solid #c2c9bb",
        }}
      >
        <button
          onClick={() => fileRef.current?.click()}
          className="p-1.5 rounded-full transition-colors flex items-center justify-center flex-shrink-0"
          style={{ color: "#72796e" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e7e9e1")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Paperclip size={19} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyPress}
          placeholder="Écrivez votre message..."
          rows={1}
          className="flex-1 resize-none outline-none bg-transparent text-sm py-1.5 px-1"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: "#191c18",
            lineHeight: "1.5",
            maxHeight: "120px",
            overflowY: "auto",
            minHeight: "36px",
          }}
        />

        <button
          onClick={handleSend}
          disabled={(!message.trim() && !mediaFile) || isLoading}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#154212", color: "#fff" }}
          onMouseEnter={(e) =>
            !e.currentTarget.disabled &&
            (e.currentTarget.style.opacity = "0.88")
          }
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={17} />
          )}
        </button>
      </div>
    </div>
  );
}