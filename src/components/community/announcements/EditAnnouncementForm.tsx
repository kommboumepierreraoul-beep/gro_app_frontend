/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// components/announcements/EditAnnouncementForm.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { 
  X, 
  Save, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Calendar,
  Briefcase,
  Megaphone,
  GraduationCap,
  MoreHorizontal,
  AlertCircle
} from "lucide-react";
import { useUpdateAnnouncement } from "@/hooks/community/useAnnouncements";
import toast from "react-hot-toast";

// Fonction pour l'URL complète
const getFullMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${apiUrl}${cleanPath}`;
};

// Configuration des catégories avec icônes
const categoryOptions = [
  { value: "job", label: "Offre d'emploi", icon: <Briefcase className="w-4 h-4" /> },
  { value: "event", label: "Événement", icon: <Megaphone className="w-4 h-4" /> },
  { value: "news", label: "Actualité", icon: <Megaphone className="w-4 h-4" /> },
  { value: "training", label: "Formation", icon: <GraduationCap className="w-4 h-4" /> },
  { value: "other", label: "Autre", icon: <MoreHorizontal className="w-4 h-4" /> },
];

interface EditAnnouncementFormProps {
  announcement: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EditAnnouncementForm({ announcement, onCancel, onSuccess }: EditAnnouncementFormProps) {
  const [title, setTitle] = useState(announcement.title);
  const [content, setContent] = useState(announcement.content);
  const [category, setCategory] = useState(announcement.category);
  const [expiresAt, setExpiresAt] = useState(announcement.expires_at?.slice(0, 16) || "");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateMutation = useUpdateAnnouncement();

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [content]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 20 Mo");
        return;
      }
      
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 20 Mo");
        return;
      }
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
      setRemoveImage(false);
    } else {
      toast.error("Veuillez déposer une image ou une vidéo");
    }
  };

  const removeCoverImage = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverImage(null);
    setCoverPreview(null);
    setRemoveImage(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Le contenu est obligatoire");
      return;
    }
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    if (expiresAt) formData.append("expires_at", expiresAt);
    if (coverImage) formData.append("cover_image", coverImage);
    if (removeImage) formData.append("remove_media", "true");

    updateMutation.mutate(
      { id: announcement.id, data: formData },
      { onSuccess }
    );
  };

  const isVideo = coverPreview && coverPreview.startsWith("blob:") 
    ? coverImage?.type.startsWith("video/") 
    : announcement.media_type === "video";

  const selectedCategory = categoryOptions.find(c => c.value === category);

  return (
    <form onSubmit={handleSubmit} className="p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-100">
            <ImageIcon className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Modifier l'annonce</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Titre */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'annonce"
            required
            className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Catégorie */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {selectedCategory?.icon || <Briefcase className="w-5 h-5" />}
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contenu <span className="text-red-500">*</span>
        </label>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Décrivez votre annonce..."
          rows={6}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Média */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image / Vidéo
        </label>
        
        {/* Média existant */}
        {!removeImage && announcement.cover_image && !coverPreview && (
          <div className="relative mb-3 rounded-xl overflow-hidden bg-gray-100 group">
            {announcement.media_type === "video" ? (
              <div className="relative">
                <video 
                  src={getFullMediaUrl(announcement.cover_image)} 
                  className="w-full rounded-xl max-h-64 object-cover"
                  controls
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={getFullMediaUrl(announcement.cover_image)} 
                  alt="Current" 
                  className="w-full rounded-xl max-h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Preview du nouveau média */}
        {coverPreview && (
          <div className="relative mb-3 rounded-xl overflow-hidden bg-gray-100 group">
            {isVideo ? (
              <div className="relative">
                <video 
                  src={coverPreview} 
                  className="w-full rounded-xl max-h-64 object-cover"
                  controls
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={coverPreview} 
                  alt="Preview" 
                  className="w-full rounded-xl max-h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Zone d'upload */}
        {(!announcement.cover_image || removeImage) && !coverPreview && (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-green-500 hover:bg-gray-50"
            }`}
          >
            <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-green-500" : "text-gray-400"}`} />
            <p className="text-sm text-gray-600 mb-1">
              {isDragging ? "Relâchez pour uploader" : "Cliquez ou glissez-déposez"}
            </p>
            <p className="text-xs text-gray-400">
              Images (JPG, PNG, GIF, WebP) ou Vidéos (MP4, WebM) - Max 20 Mo
            </p>
          </div>
        )}
        
        <input 
          ref={fileRef} 
          type="file" 
          accept="image/*,video/*" 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </div>

      {/* Date d'expiration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date d'expiration
        </label>
        <div className="relative">
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Laissez vide si l'annonce n'expire pas
        </p>
      </div>

      {/* Boutons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {updateMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer les modifications
            </>
          )}
        </button>
      </div>
    </form>
  );
}