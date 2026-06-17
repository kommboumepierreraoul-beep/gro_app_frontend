/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Reply,
  Forward,
  Copy,
  Trash2,
  Info,
  MoreHorizontal,
  CheckCheck,
  Clock,
  Download,
  RotateCw,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender: any;
    isOwn: boolean;
    createdAt: string;
    media_url?: string;
    media_type?: "image" | "video";
    status?: "sent" | "delivered" | "read";
    reply_to?: {
      id: string;
      content: string;
      sender?: {
        id: number;
        firstname: string;
        lastname?: string;
      };
      media_url?: string;
      media_type?: "image" | "video";
    };
  };
  onReply?: (message: any) => void;
  onForward?: (message: any) => void;
  onCopy?: (content: string) => void;
  onDelete?: (messageId: string) => void;
  onInfo?: (message: any) => void;
  onDownload?: (mediaUrl: string) => void;
  onRotate?: (messageId: string, rotation: number) => void;
  onTransfer?: (message: any) => void;
}

export default function MessageBubble({
  message,
  onReply,
  onForward,
  onCopy,
  onDelete,
  onInfo,
  onDownload,
  onRotate,
  onTransfer,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);
  const [rotation, setRotation] = useState(0);
  const actionButtonRef = useRef<HTMLDivElement>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout>();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowActions(true);
  };

  const handleAction = (action: string) => {
    setShowActions(false);
    switch (action) {
      case "reply":
        onReply?.(message);
        break;
      case "forward":
        onForward?.(message);
        break;
      case "copy":
        onCopy?.(message.content);
        break;
      case "delete":
        setShowDeleteConfirm(true);
        break;
      case "info":
        onInfo?.(message);
        break;
      case "download":
        if (message.media_url && onDownload) {
          onDownload(message.media_url);
        } else if (message.media_url) {
          window.open(message.media_url, "_blank");
        }
        break;
      case "rotate":
        const newRotation = (rotation + 90) % 360;
        setRotation(newRotation);
        onRotate?.(message.id, newRotation);
        break;
      case "transfer":
        onTransfer?.(message);
        break;
    }
  };

  const handleDelete = () => {
    onDelete?.(message.id);
    setShowDeleteConfirm(false);
  };

  const handleDownload = async () => {
    if (message.media_url) {
      try {
        const response = await fetch(message.media_url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `media_${message.id}.${message.media_type === "video" ? "mp4" : "jpg"}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Média téléchargé");
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Erreur lors du téléchargement");
      }
    }
  };

  const scrollToRepliedMessage = () => {
    if (message.reply_to?.id) {
      const element = document.getElementById(`msg-${message.reply_to.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.style.transition = "background-color 0.3s ease";
        element.style.backgroundColor = "rgba(188,240,174,0.4)";
        setTimeout(() => {
          element.style.backgroundColor = "";
        }, 2000);
      }
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullDate = (date: string) => {
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = () => {
    if (!message.isOwn) return null;
    
    // Message lu (read)
    if (message.status === "read") {
      return (
        <div 
          className="relative flex items-center cursor-pointer group/status"
          onMouseEnter={() => {
            statusTimeoutRef.current = setTimeout(() => setShowStatusTooltip(true), 300);
          }}
          onMouseLeave={() => {
            clearTimeout(statusTimeoutRef.current);
            setShowStatusTooltip(false);
          }}
        >
          <CheckCheck size={12} style={{ color: "#34b7f1" }} />
          <span className="text-[9px] ml-0.5" style={{ color: "#34b7f1" }}>Lu</span>
          
          {showStatusTooltip && (
            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 rounded-lg text-[10px] whitespace-nowrap z-10 shadow-lg"
              style={{ background: "#191c18", color: "#fff" }}>
              Lu
            </div>
          )}
        </div>
      );
    }
    
    // Message délivré (delivered)
    if (message.status === "delivered") {
      return (
        <div 
          className="relative flex items-center cursor-pointer group/status"
          onMouseEnter={() => {
            statusTimeoutRef.current = setTimeout(() => setShowStatusTooltip(true), 300);
          }}
          onMouseLeave={() => {
            clearTimeout(statusTimeoutRef.current);
            setShowStatusTooltip(false);
          }}
        >
          <CheckCheck size={12} style={{ color: "#72796e" }} />
          <span className="text-[9px] ml-0.5" style={{ color: "#72796e" }}>Délivré</span>
          
          {showStatusTooltip && (
            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 rounded-lg text-[10px] whitespace-nowrap z-10 shadow-lg"
              style={{ background: "#191c18", color: "#fff" }}>
              Délivré
            </div>
          )}
        </div>
      );
    }
    
    // Message envoyé (sent) - statut par défaut
    return (
      <div 
        className="relative flex items-center cursor-pointer group/status"
        onMouseEnter={() => {
          statusTimeoutRef.current = setTimeout(() => setShowStatusTooltip(true), 300);
        }}
        onMouseLeave={() => {
          clearTimeout(statusTimeoutRef.current);
          setShowStatusTooltip(false);
        }}
      >
        <Check size={12} style={{ color: "#72796e" }} />
        <span className="text-[9px] ml-0.5" style={{ color: "#72796e" }}>Envoyé</span>
        
        {showStatusTooltip && (
          <div className="absolute bottom-full right-0 mb-1 px-2 py-1 rounded-lg text-[10px] whitespace-nowrap z-10 shadow-lg"
            style={{ background: "#191c18", color: "#fff" }}>
            Envoyé
          </div>
        )}
      </div>
    );
  };

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (showMediaModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(statusTimeoutRef.current);
    };
  }, [showMediaModal]);

  // Détection si le message reply contient un média
  const hasRepliedMedia = message.reply_to?.media_url;
  const isRepliedVideo = message.reply_to?.media_type === "video";

  return (
    <>
      <div
        id={`msg-${message.id}`}
        className={`flex flex-col gap-0.5 max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[60%] ${
          message.isOwn ? "items-end self-end" : "items-start"
        }`}
        onContextMenu={handleContextMenu}
      >
        {/* ================= MESSAGE RÉPONDU (REPLY QUOTE) ================= */}
        {message.reply_to && (
          <div
            onClick={scrollToRepliedMessage}
            className="relative group cursor-pointer mb-1 max-w-full transition-all duration-200 hover:opacity-80"
            style={{ maxWidth: "280px" }}
          >
            {/* Ligne de connexion verticale */}
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
              style={{
                background: message.isOwn
                  ? "linear-gradient(135deg, #bcf0ae, #a1d494)"
                  : "#154212",
              }}
            />

            <div
              className="pl-2.5 py-1.5 pr-2 rounded-lg"
              style={{
                background: message.isOwn
                  ? "rgba(188,240,174,0.12)"
                  : "rgba(21,66,18,0.06)",
              }}
            >
              {/* En-tête de la réponse */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <Reply
                  size={10}
                  style={{
                    color: message.isOwn ? "#bcf0ae" : "#154212",
                  }}
                />
                <span
                  className="text-[10px] font-semibold truncate"
                  style={{
                    color: message.isOwn ? "#bcf0ae" : "#154212",
                  }}
                >
                  {message.reply_to.sender?.firstname || "Utilisateur"}
                </span>
              </div>

              {/* Contenu du message répondu */}
              <div className="flex items-center gap-1.5">
                {hasRepliedMedia && (
                  <div className="flex-shrink-0">
                    {isRepliedVideo ? (
                      <div className="w-3 h-3 rounded bg-black/20 flex items-center justify-center">
                        <span className="text-[8px]">🎬</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 rounded bg-black/20 flex items-center justify-center">
                        <span className="text-[8px]">🖼️</span>
                      </div>
                    )}
                  </div>
                )}
                <p
                  className="text-[11px] truncate flex-1"
                  style={{
                    color: message.isOwn ? "rgba(255,255,255,0.7)" : "#72796e",
                  }}
                >
                  {message.reply_to.content || "📎 Média"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= MÉDIA DU MESSAGE ================= */}
        {message.media_url && (
          <div
            className="mb-1 rounded-xl overflow-hidden cursor-pointer group relative"
            style={{
              maxWidth: "250px",
              maxHeight: "250px",
              background: "#edefe7",
            }}
            onClick={() => setShowMediaModal(true)}
          >
            {message.media_type === "video" ? (
              <video
                src={message.media_url}
                controls
                className="w-full h-full object-cover"
                style={{ maxHeight: "250px" }}
              />
            ) : (
              <div
                className="relative"
                style={{ minHeight: "150px", minWidth: "150px" }}
              >
                <Image
                  src={message.media_url}
                  alt="Media"
                  width={250}
                  height={250}
                  className="object-cover transition-transform group-hover:scale-105"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-black/50 rounded-full p-2">
                    <MoreHorizontal size={20} color="white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= BULLE DU MESSAGE ================= */}
        <div className="relative group max-w-full">
          <div
            className="px-3.5 py-2.5 text-sm leading-relaxed relative break-words"
            style={
              message.isOwn
                ? {
                    background: "#154212",
                    color: "#ffffff",
                    borderRadius: "18px 18px 4px 18px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }
                : {
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(194,201,187,0.3)",
                    color: "#191c18",
                    borderRadius: "18px 18px 18px 4px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }
            }
          >
            {/* Contenu du message */}
            {message.content || (message.media_url && "📎 Média")}

            {/* Chevron pour ouvrir le menu d'actions */}
            <button
              onClick={() => setShowActions(true)}
              className="absolute -bottom-2 -right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-105 active:scale-95"
              style={{
                background: message.isOwn ? "#2d5a27" : "#ffffff",
                color: message.isOwn ? "#bcf0ae" : "#72796e",
                border: message.isOwn
                  ? "none"
                  : "1px solid rgba(194,201,187,0.5)",
              }}
            >
              <ChevronDown size={10} />
            </button>
          </div>
        </div>

        {/* ================= TIMESTAMP & STATUS ================= */}
        <div className="flex items-center gap-1.5 px-1 mt-0.5">
          <span 
            className="text-[10px] cursor-pointer hover:underline"
            style={{ color: "#72796e" }}
            onClick={() => {
              const fullDate = formatFullDate(message.createdAt);
              toast.success(`Message du ${fullDate}`, { duration: 2000 });
            }}
          >
            {formatTime(message.createdAt)}
          </span>
          {getStatusIcon()}
        </div>
      </div>

      {/* ================= MODAL D'ACTIONS ================= */}
      {showActions && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowActions(false)}
          />
          <div
            ref={actionButtonRef}
            className="fixed z-50 bg-white rounded-2xl overflow-hidden shadow-xl animate-slideUp"
            style={{
              width: "320px",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <div className="py-2 max-h-[80vh] overflow-y-auto">
              {/* Info utilisateur */}
              {!message.isOwn && message.sender && (
                <div
                  className="flex items-center gap-3 px-4 py-3 border-b"
                  style={{ borderColor: "#f0f0f0" }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#bcf0ae] to-[#a1d494] flex items-center justify-center">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#154212" }}
                    >
                      {message.sender?.firstname?.[0] || "U"}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#191c18" }}
                    >
                      {message.sender?.firstname}{" "}
                      {message.sender?.lastname || ""}
                    </p>
                    <p className="text-xs" style={{ color: "#72796e" }}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Info statut pour les messages envoyés */}
              {message.isOwn && (
                <div
                  className="px-4 py-2 border-b"
                  style={{ borderColor: "#f0f0f0" }}
                >
                  <p className="text-xs" style={{ color: "#72796e" }}>
                    <span className="font-semibold">Statut :</span>{" "}
                    {message.status === "read" 
                      ? "Lu ✓✓" 
                      : message.status === "delivered" 
                        ? "Délivré ✓✓" 
                        : "Envoyé ✓"}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#72796e" }}>
                    {formatFullDate(message.createdAt)}
                  </p>
                </div>
              )}

              {/* Actions principales */}
              <button
                onClick={() => handleAction("reply")}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <Reply size={18} style={{ color: "#72796e" }} />
                <span className="text-sm" style={{ color: "#191c18" }}>
                  Répondre
                </span>
              </button>

              <button
                onClick={() => handleAction("forward")}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <Forward size={18} style={{ color: "#72796e" }} />
                <span className="text-sm" style={{ color: "#191c18" }}>
                  Transférer
                </span>
              </button>

              {message.media_url && (
                <>
                  <button
                    onClick={() => handleAction("download")}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
                  >
                    <Download size={18} style={{ color: "#72796e" }} />
                    <span className="text-sm" style={{ color: "#191c18" }}>
                      Télécharger
                    </span>
                  </button>

                  {message.media_type !== "video" && (
                    <button
                      onClick={() => handleAction("rotate")}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
                    >
                      <RotateCw size={18} style={{ color: "#72796e" }} />
                      <span className="text-sm" style={{ color: "#191c18" }}>
                        Pivoter
                      </span>
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => handleAction("copy")}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <Copy size={18} style={{ color: "#72796e" }} />
                <span className="text-sm" style={{ color: "#191c18" }}>
                  Copier
                </span>
              </button>

              <button
                onClick={() => handleAction("info")}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <Info size={18} style={{ color: "#72796e" }} />
                <span className="text-sm" style={{ color: "#191c18" }}>
                  Informations
                </span>
              </button>

              {message.isOwn && (
                <>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => handleAction("delete")}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-red-50 active:bg-red-100"
                    style={{ color: "#dc2626" }}
                  >
                    <Trash2 size={18} />
                    <span className="text-sm">Supprimer</span>
                  </button>
                </>
              )}
            </div>

            {/* Bouton Annuler */}
            <div className="border-t" style={{ borderColor: "#f0f0f0" }}>
              <button
                onClick={() => setShowActions(false)}
                className="w-full py-3 text-center font-semibold transition-colors hover:bg-gray-50 active:bg-gray-100"
                style={{ color: "#154212" }}
              >
                Annuler
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL MÉDIA PLEIN ÉCRAN ================= */}
      {showMediaModal && message.media_url && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowMediaModal(false)}
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scaleIn"
            onClick={() => setShowMediaModal(false)}
          >
            <div className="relative max-w-[90vw] max-h-[90vh]">
              {message.media_type === "video" ? (
                <video
                  src={message.media_url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[90vh] rounded-2xl"
                />
              ) : (
                <div className="relative">
                  <Image
                    src={message.media_url}
                    alt="Media plein écran"
                    width={800}
                    height={800}
                    className="object-contain rounded-2xl"
                    style={{ transform: `rotate(${rotation}deg)` }}
                    unoptimized
                  />
                </div>
              )}

              {/* Boutons de contrôle */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-full p-2 backdrop-blur-md">
                {message.media_type !== "video" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newRotation = (rotation + 90) % 360;
                      setRotation(newRotation);
                      onRotate?.(message.id, newRotation);
                    }}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95"
                  >
                    <RotateCw size={20} color="white" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95"
                >
                  <Download size={20} color="white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMediaModal(false);
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95"
                >
                  <X size={20} color="white" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL DE CONFIRMATION SUPPRESSION ================= */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div
            className="fixed z-50 bg-white rounded-2xl overflow-hidden shadow-xl animate-slideUp"
            style={{
              width: "320px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="p-5 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: "#fee2e2" }}
              >
                <Trash2 size={20} style={{ color: "#dc2626" }} />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "#191c18" }}
              >
                Supprimer le message
              </h3>
              <p className="text-sm mb-5" style={{ color: "#72796e" }}>
                Êtes-vous sûr de vouloir supprimer ce message ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-colors hover:bg-gray-100 active:bg-gray-200"
                  style={{ background: "#f0f0f0", color: "#42493e" }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-colors hover:bg-red-700 active:bg-red-800"
                  style={{ background: "#dc2626", color: "#ffffff" }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}