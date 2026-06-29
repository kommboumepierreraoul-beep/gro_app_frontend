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
  Trash2,
  Sparkles,
  Megaphone,
  Plus,
  ChevronDown,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(true);
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
      setIsSubmitting(false);
      toast.success("Annonce créée avec succès !");
      onClose();
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      const message =
        error.response?.data?.message ||
        "Erreur lors de la création de l'annonce";
      toast.error(message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 Mo");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Le fichier doit être une image");
        return;
      }

      setCoverImage(file);
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
      case "job":
        return <Briefcase className="w-3.5 h-3.5" />;
      case "event":
        return <CalendarDays className="w-3.5 h-3.5" />;
      case "news":
        return <Newspaper className="w-3.5 h-3.5" />;
      case "training":
        return <GraduationCap className="w-3.5 h-3.5" />;
      default:
        return <MoreHorizontal className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "job":
        return "Offre d'emploi";
      case "event":
        return "Événement";
      case "news":
        return "Actualité";
      case "training":
        return "Formation";
      default:
        return "Autre";
    }
  };

  const getAvatarUrl = () => {
    if (!user?.avatar) return undefined;
    if (user.avatar.startsWith("http")) return user.avatar;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const cleanPath = user.avatar.startsWith("/")
      ? user.avatar
      : `/${user.avatar}`;
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
          background: "#ffffff",
          border: "1px solid rgba(194,201,187,0.3)",
          boxShadow: "0 24px 60px rgba(21,66,18,0.15)",
          animation: "groSlideUp 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: "1px solid rgba(194,201,187,0.2)",
            background: "rgba(249,250,242,0.5)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#154212] flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#191c18]">
              Nouvelle annonce
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#f3f4ed] transition-all duration-150 text-[#72796e] hover:text-[#191c18]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            {/* Auteur */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#c2c9bb]/20">
              <Avatar
                src={getAvatarUrl()}
                firstname={user?.firstname}
                size="md"
                className="ring-2 ring-[#bcf0ae]/30"
              />
              <div>
                <p className="text-sm font-semibold text-[#191c18]">
                  {user?.firstname} {user?.lastname}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Globe className="w-3 h-3 text-[#2d5a27]" />
                  <span className="text-[10px] font-medium text-[#2d5a27] bg-[#eaf3de] px-2 py-0.5 rounded-full">
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
                className="w-full px-0 py-1 text-lg font-semibold outline-none bg-transparent placeholder:text-[#a0a8a0] text-[#191c18]"
                autoFocus
              />
              <div className="h-px mt-1 bg-[#c2c9bb]/30" />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-xs font-medium text-[#72796e] mb-2">
                Catégorie
              </label>
              <div className="flex flex-wrap gap-2">
                {["job", "event", "news", "training", "other"].map((cat) => {
                  const isActive = formData.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: cat })
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-[#154212] text-[#bcf0ae] shadow-sm"
                          : "bg-[#f3f4ed] text-[#42493e] hover:bg-[#eaf3de] border border-[#c2c9bb]/20"
                      }`}
                    >
                      {getCategoryIcon(cat)}
                      <span>{getCategoryLabel(cat)}</span>
                    </button>
                  );
                })}
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
                className="w-full resize-none outline-none text-sm leading-relaxed bg-transparent text-[#42493e] placeholder:text-[#a0a8a0]"
              />
            </div>

            {/* Image de couverture */}
            <div>
              <label className="block text-xs font-medium text-[#72796e] mb-2">
                Image de couverture
              </label>

              {coverPreview ? (
                <div className="relative rounded-xl overflow-hidden group border border-[#c2c9bb]/20">
                  <img
                    src={coverPreview}
                    alt="Aperçu"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-xl bg-black/60 text-white hover:bg-black/80 transition-all duration-150 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-xl p-6 transition-all duration-150 flex flex-col items-center gap-2 border-2 border-dashed border-[#c2c9bb]/30 hover:border-[#154212]/40 hover:bg-[#f9faf2]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#eaf3de] flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-[#154212]" />
                  </div>
                  <span className="text-sm font-medium text-[#42493e]">
                    Ajouter une image
                  </span>
                  <span className="text-xs text-[#72796e]">
                    JPG, PNG, GIF, WebP (max. 5 Mo)
                  </span>
                </button>
              )}
            </div>

            {/* Date d'expiration */}
            <div>
              <label className="block text-xs font-medium text-[#72796e] mb-1.5">
                <Calendar className="w-3 h-3 inline mr-1 text-[#154212]" />
                Date d'expiration (optionnelle)
              </label>
              <input
                type="datetime-local"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-150 bg-[#f9faf2] border border-[#c2c9bb]/30 text-[#191c18] focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212]"
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{
              borderTop: "1px solid rgba(194,201,187,0.2)",
              background: "rgba(249,250,242,0.5)",
            }}
          >
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[#72796e] hover:text-[#154212] hover:bg-[#eaf3de] transition-all duration-150"
              title="Ajouter une image"
            >
              <ImageIcon className="w-[18px] h-[18px]" />
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-sm font-medium text-[#72796e] hover:text-[#42493e] hover:bg-[#f3f4ed] transition-all duration-150"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  !formData.title.trim() ||
                  !formData.content.trim()
                }
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-[#154212] text-white hover:bg-[#2d5a27] shadow-sm hover:shadow-md active:scale-95"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publier l'annonce
                  </>
                )}
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
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
