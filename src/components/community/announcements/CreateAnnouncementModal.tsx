/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementService } from "@/services/community/announcement.service";
import { 
  X, 
  Image as ImageIcon, 
  Calendar, 
  Send, 
  Globe,
  Briefcase,
  CalendarDays,
  Newspaper,
  GraduationCap,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Avatar } from "../shared/Avatar";
import toast from "react-hot-toast";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAnnouncementModal({
  isOpen,
  onClose,
}: CreateAnnouncementModalProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "news",
    expires_at: "",
  });

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [formData.content]);

  // Nettoyer la preview
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("content", formData.content);
      form.append("category", formData.category);
      if (formData.expires_at) form.append("expires_at", formData.expires_at);
      if (coverImage) form.append("cover_image", coverImage);
      return announcementService.create(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["latestAnnouncements"] });
      setFormData({ title: "", content: "", category: "news", expires_at: "" });
      setCoverImage(null);
      setCoverPreview(null);
      toast.success("Annonce créée avec succès !");
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erreur lors de la création de l'annonce";
      toast.error(message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 Mo");
        return;
      }
      
      // Vérifier le type
      if (!file.type.startsWith("image/")) {
        toast.error("Le fichier doit être une image");
        return;
      }
      
      setCoverImage(file);
      
      // Créer une preview
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const removeCoverImage = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverImage(null);
    setCoverPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Le contenu est obligatoire");
      return;
    }
    createMutation.mutate();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "job": return <Briefcase className="w-3.5 h-3.5" />;
      case "event": return <CalendarDays className="w-3.5 h-3.5" />;
      case "news": return <Newspaper className="w-3.5 h-3.5" />;
      case "training": return <GraduationCap className="w-3.5 h-3.5" />;
      default: return <MoreHorizontal className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "job": return "Offre d'emploi";
      case "event": return "Événement";
      case "news": return "Actualité";
      case "training": return "Formation";
      default: return "Autre";
    }
  };

  // Fonction pour obtenir l'URL complète de l'avatar
  const getAvatarUrl = () => {
    if (!user?.avatar) return undefined;
    if (user.avatar.startsWith('http')) return user.avatar;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const cleanPath = user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`;
    return `${apiUrl}${cleanPath}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(15,25,12,0.6)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          background: "rgba(249,250,242,0.98)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(194,201,187,0.5)",
          boxShadow: "0 24px 60px rgba(21,66,18,0.2)",
          animation: "groSlideUp 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            borderBottom: "1px solid rgba(194,201,187,0.35)",
            background:
              "linear-gradient(135deg, rgba(188,240,174,0.2) 0%, transparent 100%)",
          }}
        >
          <h2
            className="text-sm font-bold"
            style={{
              color: "#154212",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Créer une annonce
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150"
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
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Body modal */}
          <div className="px-5 py-4 space-y-4">
            {/* Auteur */}
            <div className="flex items-center gap-3">
              <Avatar
                src={getAvatarUrl()}
                firstname={user?.firstname}
                size="md"
              />
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
                  className="mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{
                    background: "rgba(45,90,39,0.1)",
                    border: "1px solid rgba(45,90,39,0.2)",
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
                    Annonce officielle
                  </span>
                </div>
              </div>
            </div>

            {/* Titre */}
            <div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Titre de l'annonce *"
                className="w-full px-0 py-1 text-lg font-semibold outline-none bg-transparent placeholder:text-gray-400"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                autoFocus
              />
              <div className="h-px mt-1" style={{ background: "rgba(194,201,187,0.3)" }} />
            </div>

            {/* Catégorie */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#72796e" }}
              >
                Catégorie
              </label>
              <div className="flex flex-wrap gap-2">
                {["job", "event", "news", "training", "other"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                      formData.category === cat
                        ? "shadow-sm"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={
                      formData.category === cat
                        ? {
                            background: "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
                            color: "#bcf0ae",
                          }
                        : {
                            background: "rgba(194,201,187,0.15)",
                            color: "#42493e",
                            border: "1px solid rgba(194,201,187,0.3)",
                          }
                    }
                  >
                    {getCategoryIcon(cat)}
                    <span>{getCategoryLabel(cat)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu */}
            <div>
              <textarea
                ref={textareaRef}
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Décrivez votre annonce..."
                rows={4}
                className="w-full resize-none outline-none text-sm leading-relaxed bg-transparent"
                style={{ color: "#191c18", fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            {/* Image de couverture */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#72796e" }}
              >
                Image de couverture
              </label>
              
              {coverPreview ? (
                <div className="relative rounded-xl overflow-hidden group">
                  <img
                    src={coverPreview}
                    alt="Aperçu"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 opacity-0 group-hover:opacity-100"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-xl p-6 transition-all duration-150 flex flex-col items-center gap-2"
                  style={{
                    background: "rgba(194,201,187,0.08)",
                    border: "1px dashed rgba(194,201,187,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(194,201,187,0.12)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(45,90,39,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(194,201,187,0.08)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(194,201,187,0.4)";
                  }}
                >
                  <ImageIcon
                    className="w-8 h-8"
                    style={{ color: "#72796e" }}
                    strokeWidth={1.5}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "#72796e" }}
                  >
                    Cliquez pour ajouter une image
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "#72796e80" }}
                  >
                    JPG, PNG, GIF, WebP (max. 5 Mo)
                  </span>
                </button>
              )}
            </div>

            {/* Date d'expiration */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#72796e" }}
              >
                <Calendar className="w-3 h-3 inline mr-1" />
                Date d'expiration (optionnelle)
              </label>
              <input
                type="datetime-local"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150"
                style={{
                  background: "rgba(194,201,187,0.08)",
                  border: "1px solid rgba(194,201,187,0.3)",
                  color: "#191c18",
                }}
              />
            </div>
          </div>

          {/* Footer modal */}
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{
              borderTop: "1px solid rgba(194,201,187,0.35)",
              background:
                "linear-gradient(135deg, transparent 0%, rgba(188,240,174,0.1) 100%)",
            }}
          >
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150"
                style={{ color: "#42493e" }}
                title="Ajouter une image"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(188,240,174,0.3)";
                  (e.currentTarget as HTMLElement).style.color = "#2d5a27";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#42493e";
                }}
              >
                <ImageIcon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  background: "rgba(194,201,187,0.15)",
                  color: "#72796e",
                  fontFamily: "'Inter', sans-serif",
                  border: "1px solid rgba(194,201,187,0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(194,201,187,0.25)";
                  (e.currentTarget as HTMLElement).style.color = "#42493e";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(194,201,187,0.15)";
                  (e.currentTarget as HTMLElement).style.color = "#72796e";
                }}
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={createMutation.isPending || !formData.title.trim() || !formData.content.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={
                  !createMutation.isPending && formData.title.trim() && formData.content.trim()
                    ? {
                        background:
                          "linear-gradient(135deg, #3b6934 0%, #154212 100%)",
                        color: "#bcf0ae",
                        boxShadow: "0 4px 12px rgba(21,66,18,0.3)",
                        fontFamily: "'Inter', sans-serif",
                      }
                    : {
                        background: "rgba(194,201,187,0.35)",
                        color: "#72796e",
                        cursor: "not-allowed",
                        fontFamily: "'Inter', sans-serif",
                      }
                }
              >
                <Send className="w-3.5 h-3.5" strokeWidth={2} />
                {createMutation.isPending ? "Création..." : "Publier l'annonce"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

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