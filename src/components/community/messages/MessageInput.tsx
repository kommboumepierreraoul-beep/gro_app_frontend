"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Paperclip, 
  Send, 
  X, 
  Image as ImageIcon, 
  Film, 
  Smile,
  CornerDownLeft,
  Loader2
} from "lucide-react";
import Image from "next/image";

interface MessageInputProps {
  onSend: (content: string, media?: File) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function MessageInput({ 
  onSend, 
  isLoading, 
  placeholder = "Écrivez votre message..." 
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight, 
        120
      ) + "px";
    }
  }, [message]);

  // Auto-focus sur desktop
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, []);

  const handleSend = () => {
    if ((!message.trim() && !mediaFile) || isLoading) return;
    
    onSend(message, mediaFile || undefined);
    
    // Reset
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
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Gérer la composition IME (pour les langues asiatiques)
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (max 10MB)");
        return;
      }
      
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      
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
  };

  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => setIsComposing(false);

  return (
    <div
      className="px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0"
      style={{
        background: "rgba(249,250,242,0.98)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(194,201,187,0.3)",
        boxShadow: "0 -2px 20px rgba(21,66,18,0.04)",
      }}
    >
      {/* Aperçu du média */}
      {mediaPreview && (
        <div className="relative mb-2 inline-block group">
          <div
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden"
            style={{ 
              background: "#edefe7",
              border: "1px solid rgba(194,201,187,0.3)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {mediaType === "video" ? (
              <div className="w-full h-full flex items-center justify-center bg-black/60">
                <Film size={28} className="text-white" />
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                  <Film size={20} className="text-white" />
                </div>
              </div>
            )}
          </div>
          
          {/* Badge type */}
          <span
            className="absolute bottom-1.5 left-1.5 text-[9px] font-medium px-2 py-0.5 rounded-full text-white"
            style={{ 
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
          >
            {mediaType === "video" ? "Vidéo" : "Image"}
          </span>
          
          {/* Bouton supprimer */}
          <button
            onClick={removeMedia}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ 
              background: "#dc2626", 
              color: "#fff",
              boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
            }}
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Zone de saisie */}
      <div
        className={`flex items-end gap-1.5 p-1.5 rounded-2xl transition-all duration-200 ${
          isFocused ? 'ring-2 ring-[#154212]/20' : ''
        }`}
        style={{
          background: "#ffffff",
          border: isFocused 
            ? "1px solid #154212" 
            : "1px solid rgba(194,201,187,0.5)",
          boxShadow: isFocused 
            ? "0 4px 16px rgba(21,66,18,0.08)" 
            : "0 2px 4px rgba(0,0,0,0.02)",
        }}
      >
        {/* Bouton pièce jointe */}
        <button
          onClick={() => fileRef.current?.click()}
          className="p-1.5 rounded-full transition-all duration-200 flex items-center justify-center flex-shrink-0 hover:bg-[rgba(114,121,110,0.1)] active:scale-90"
          style={{ color: "#72796e" }}
          title="Joindre un fichier (max 10MB)"
        >
          <Paperclip size={19} strokeWidth={1.8} />
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
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none outline-none bg-transparent text-sm py-1.5 px-1 transition-all duration-200"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: "#191c18",
            lineHeight: "1.6",
            maxHeight: "120px",
            overflowY: "auto",
            minHeight: "36px",
            caretColor: "#154212",
          }}
          disabled={isLoading}
        />

        {/* Bouton envoi */}
        <button
          onClick={handleSend}
          disabled={(!message.trim() && !mediaFile) || isLoading}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{
            background: (!message.trim() && !mediaFile) || isLoading
              ? "#e5e7e0"
              : "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
            color: (!message.trim() && !mediaFile) || isLoading
              ? "#a0a69b"
              : "#ffffff",
            boxShadow: (!message.trim() && !mediaFile) || isLoading
              ? "none"
              : "0 4px 12px rgba(45,90,39,0.25)",
          }}
          title="Envoyer (Entrée)"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={17} strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Indicateurs */}
      <div className="flex justify-between items-center mt-1.5 px-1">
        {message.length > 0 && !isLoading && (
          <span className="text-[10px]" style={{ color: "#72796e" }}>
            {message.length} caractères
          </span>
        )}
        
        {!isLoading && (
          <div className="flex items-center gap-3 ml-auto">
            <span 
              className="text-[10px] flex items-center gap-1"
              style={{ color: "#72796e" }}
            >
              <CornerDownLeft size={12} />
              <span className="hidden sm:inline">Entrée pour envoyer</span>
              <span className="sm:hidden">Envoyer</span>
            </span>
            {mediaFile && (
              <span 
                className="text-[10px] font-medium"
                style={{ color: "#2d5a27" }}
              >
                {Math.round(mediaFile.size / 1024)} KB
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}