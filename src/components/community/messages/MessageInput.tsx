"use client";
import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, X, Image as ImageIcon, Film } from "lucide-react";
import Image from "next/image";

interface MessageInputProps {
  onSend: (content: string, media?: File) => void;
  isLoading: boolean;
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus sur mobile quand on clique
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSend = () => {
    if ((!message.trim() && !mediaFile) || isLoading) return;
    onSend(message, mediaFile || undefined);
    setMessage("");
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
      setMediaFile(null);
      setMediaType(null);
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
      // Déterminer le type de média
      if (file.type.startsWith("image/")) {
        setMediaType("image");
      } else if (file.type.startsWith("video/")) {
        setMediaType("video");
      }
    }
  };

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    setMediaFile(null);
    setMediaType(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div
      className="px-2 sm:px-4 py-2 sm:py-3 flex-shrink-0"
      style={{
        background: "rgba(249,250,242,0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(194,201,187,0.35)",
      }}
    >
      {/* Aperçu du média */}
      {mediaPreview && (
        <div className="relative mb-2 inline-block group">
          <div
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden"
            style={{ background: "#edefe7" }}
          >
            {mediaType === "video" ? (
              <div className="w-full h-full flex items-center justify-center bg-black/50">
                <Film size={24} className="text-white" />
              </div>
            ) : (
              <Image
                src={mediaPreview}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
            )}
            {mediaType === "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                  <Film size={16} className="text-white" />
                </div>
              </div>
            )}
          </div>
          <button
            onClick={removeMedia}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95"
            style={{ background: "#ba1a1a", color: "#fff" }}
          >
            <X size={11} />
          </button>
          <span
            className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded-full bg-black/60 text-white"
            style={{ backdropFilter: "blur(4px)" }}
          >
            {mediaType === "video" ? "Vidéo" : "Image"}
          </span>
        </div>
      )}

      {/* Zone de saisie */}
      <div
        className="flex items-end gap-1 p-1.5 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-[#154212]/20"
        style={{
          background: "#ffffff",
          border: "1px solid #c2c9bb",
        }}
      >
        {/* Bouton pièce jointe */}
        <button
          onClick={() => fileRef.current?.click()}
          className="p-1.5 rounded-full transition-all flex items-center justify-center flex-shrink-0 hover:bg-[#e7e9e1] active:scale-95"
          style={{ color: "#72796e" }}
          title="Joindre un fichier"
        >
          <Paperclip size={18} className="sm:w-[19px] sm:h-[19px]" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Zone texte */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyPress}
          placeholder="Écrivez votre message..."
          rows={1}
          className="flex-1 resize-none outline-none bg-transparent text-sm py-1.5 px-1 placeholder:text-[#72796e]"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: "#191c18",
            lineHeight: "1.5",
            maxHeight: "120px",
            overflowY: "auto",
            minHeight: "36px",
          }}
        />

        {/* Bouton envoi */}
        <button
          onClick={handleSend}
          disabled={(!message.trim() && !mediaFile) || isLoading}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-88 active:scale-95"
          style={{ background: "#154212", color: "#fff" }}
          title="Envoyer"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={16} className="sm:w-[17px] sm:h-[17px]" />
          )}
        </button>
      </div>

      {/* Indicateur de saisie (optionnel) */}
      {message.length > 0 && !isLoading && (
        <div className="text-right mt-1">
          <span className="text-[10px]" style={{ color: "#72796e" }}>
            {message.length} caractères • Entrée pour envoyer
          </span>
        </div>
      )}
    </div>
  );
}
