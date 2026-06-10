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
  ChevronUp,
  X,
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
    is_read?: boolean;
    is_delivered?: boolean;
    reply_to?: any;
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
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const actionButtonRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = () => {
    if (!message.isOwn) return null;
    if (message.is_read) {
      return <CheckCheck size={12} style={{ color: "#34b7f1" }} />;
    }
    if (message.is_delivered) {
      return <CheckCheck size={12} style={{ color: "#72796e" }} />;
    }
    return <Clock size={10} style={{ color: "#72796e" }} />;
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
    };
  }, [showMediaModal]);

  return (
    <>
      <div
        className={`flex flex-col gap-0.5 max-w-[80%] ${
          message.isOwn ? "items-end self-end" : "items-start"
        }`}
        onContextMenu={handleContextMenu}
      >
        {/* Reply indicator */}
        {message.reply_to && (
          <div
            className="text-xs px-2 py-1 rounded-lg mb-1 max-w-full cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              background: "rgba(0,0,0,0.05)",
              borderLeft: `2px solid #154212`,
            }}
            onClick={() => {
              // Scroll to replied message
              const element = document.getElementById(
                `msg-${message.reply_to.id}`,
              );
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.style.backgroundColor = "rgba(188,240,174,0.3)";
                setTimeout(() => {
                  element.style.backgroundColor = "";
                }, 2000);
              }
            }}
          >
            <span style={{ color: "#154212", fontWeight: 600 }}>
              Réponse à {message.reply_to.sender?.firstname || "message"}
            </span>
            <p className="truncate" style={{ color: "#72796e" }}>
              {message.reply_to.content}
            </p>
          </div>
        )}

        {/* Media content */}
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

        {/* Message bubble with chevron */}
        <div className="relative group">
          <div
            className="px-3.5 py-2.5 text-sm leading-relaxed relative"
            style={
              message.isOwn
                ? {
                    background: "#154212",
                    color: "#ffffff",
                    borderRadius: "16px 16px 4px 16px",
                    boxShadow: "0 2px 8px rgba(21,66,18,0.18)",
                  }
                : {
                    background: "rgba(255,255,255,0.75)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(194,201,187,0.35)",
                    color: "#191c18",
                    borderRadius: "16px 16px 16px 4px",
                    boxShadow: "0 1px 4px rgba(21,66,18,0.06)",
                  }
            }
          >
            {message.content}

            {/* Chevron pour ouvrir le modal */}
            <button
              onClick={() => setShowActions(true)}
              className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
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

        {/* Timestamp & status */}
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px]" style={{ color: "#72796e" }}>
            {formatTime(message.createdAt)}
          </span>
          {getStatusIcon()}
        </div>
      </div>

      {/* Modal d'actions (style WhatsApp) */}
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
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
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

              {/* Actions principales */}
              <button
                onClick={() => handleAction("reply")}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <Reply size={18} style={{ color: "#72796e" }} />
                <span className="text-sm" style={{ color: "#191c18" }}>
                  Répondre
                </span>
              </button>

              <button
                onClick={() => handleAction("forward")}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
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
                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <Download size={18} style={{ color: "#72796e" }} />
                    <span className="text-sm" style={{ color: "#191c18" }}>
                      Télécharger
                    </span>
                  </button>

                  {message.media_type !== "video" && (
                    <button
                      onClick={() => handleAction("rotate")}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
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
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <Copy size={18} style={{ color: "#72796e" }} />
                <span className="text-sm" style={{ color: "#191c18" }}>
                  Copier
                </span>
              </button>

              <button
                onClick={() => handleAction("info")}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
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
                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-red-50"
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
                className="w-full py-3 text-center font-semibold transition-colors hover:bg-gray-50"
                style={{ color: "#154212" }}
              >
                Annuler
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal média plein écran */}
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

              {/* Boutons de contrôle sur le modal */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-full p-2 backdrop-blur-md">
                {message.media_type !== "video" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newRotation = (rotation + 90) % 360;
                      setRotation(newRotation);
                      onRotate?.(message.id, newRotation);
                    }}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <RotateCw size={20} color="white" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <Download size={20} color="white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMediaModal(false);
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={20} color="white" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de confirmation suppression */}
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
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-colors hover:bg-gray-100"
                  style={{ background: "#f0f0f0", color: "#42493e" }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-colors hover:bg-red-700"
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
