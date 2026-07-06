/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/community/profile.service";
import { Avatar } from "@/components/community/shared/Avatar";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  Link2,
  Briefcase,
  Camera,
  X,
  Save,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

export default function EditProfilePage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    headline: "",
    bio: "",
    location: "",
    website: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [bioLength, setBioLength] = useState(0);

  const { data: profile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: profileService.getMe,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        firstname: profile.firstname ?? "",
        lastname: profile.lastname ?? "",
        headline: (profile as any).headline ?? "",
        bio: (profile as any).bio ?? "",
        location: (profile as any).location ?? "",
        website: (profile as any).website ?? "",
      });
      setBioLength((profile as any).bio?.length ?? 0);
    }
  }, [profile]);

  const update = useMutation({
    mutationFn: (data: FormData) => profileService.update(data),
    onSuccess: (updated) => {
      setUser(updated as any);
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      toast.success("Profil mis à jour !");
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      setAvatarPreview(null);
      setBannerPreview(null);
      setAvatarFile(null);
      setBannerFile(null);
    },
    onError: () => toast.error("Erreur lors de la mise à jour."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (avatarFile) fd.append("avatar", avatarFile);
    if (bannerFile) fd.append("banner", bannerFile);
    update.mutate(fd);
  };

  const handleFileChange = (
    file: File | undefined,
    setPreview: (s: string) => void,
    setFile: (f: File) => void,
    setError?: (e: boolean) => void,
  ) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG ou WEBP");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Fichier trop volumineux. Maximum 5MB");
      return;
    }

    setFile(file);
    setPreview(URL.createObjectURL(file));
    if (setError) setError(false);
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarError(false);
    if (avatarRef.current) avatarRef.current.value = "";
  };

  const removeBanner = () => {
    setBannerPreview(null);
    setBannerFile(null);
    setBannerError(false);
    if (bannerRef.current) bannerRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [avatarPreview, bannerPreview]);

  return (
    <div className="min-h-screen ">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2  rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Section */}
          <div className=" rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="relative h-32 sm:h-40 bg-gradient-to-r from-primary to-tertiary cursor-pointer group"
              onClick={() => bannerRef.current?.click()}
            >
              {(bannerPreview || (profile as any)?.banner) && !bannerError ? (
                <>
                  <img
                    src={bannerPreview ?? (profile as any).banner}
                    alt="Bannière"
                    className="w-full h-full object-cover"
                    onError={() => setBannerError(true)}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBanner();
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Camera size={24} className="text-white/60 mb-2" />
                  <span className="text-white/80 text-xs sm:text-sm">
                    Cliquez pour ajouter une bannière
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-semibold flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                  <Camera size={14} />
                  Changer la bannière
                </span>
              </div>
            </div>
            <input
              ref={bannerRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) =>
                handleFileChange(
                  e.target.files?.[0],
                  setBannerPreview,
                  setBannerFile,
                  setBannerError,
                )
              }
            />

            {/* Avatar */}
            <div className="px-4 sm:px-6 pb-6">
              <div className="relative inline-block group -mt-10 sm:-mt-12">
                <div
                  className="cursor-pointer"
                  onClick={() => avatarRef.current?.click()}
                >
                  {avatarPreview || profile?.avatar ? (
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                      <img
                        src={avatarPreview ?? profile!.avatar!}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover ring-4 ring-white shadow-lg"
                        onError={() => setAvatarError(true)}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAvatar();
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                      >
                        <X size={10} className="sm:w-3 sm:h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <Avatar
                      src={null}
                      firstname={form.firstname || user?.firstname}
                      size="xl"
                      className="ring-4 ring-white shadow-lg cursor-pointer"
                    />
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Camera size={14} className="sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
              </div>
              <input
                ref={avatarRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) =>
                  handleFileChange(
                    e.target.files?.[0],
                    setAvatarPreview,
                    setAvatarFile,
                    setAvatarError,
                  )
                }
              />
              <p className="text-[10px] sm:text-xs text-gray-400 mt-3">
                Formats acceptés: JPG, PNG, WEBP. Max 5MB
              </p>
            </div>
          </div>

          {/* Profile Fields */}
          <div className=" rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Prénom
                </label>
                <input
                  value={form.firstname}
                  onChange={(e) =>
                    setForm({ ...form, firstname: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all "
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Nom
                </label>
                <input
                  value={form.lastname}
                  onChange={(e) =>
                    setForm({ ...form, lastname: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all "
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={12} />
                Titre professionnel
              </label>
              <input
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="Ex: Développeur Full Stack"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={12} />
                Localisation
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex: Yaoundé, Cameroun"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all "
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                <Link2 size={12} />
                Site web
              </label>
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://monsite.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all "
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => {
                  setForm({ ...form, bio: e.target.value });
                  setBioLength(e.target.value.length);
                }}
                rows={4}
                placeholder="Parlez de vous..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none "
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] text-gray-400">
                  Maximum 1000 caractères
                </p>
                <p
                  className={`text-[10px] font-medium ${bioLength > 900 ? "text-amber-600" : "text-gray-400"}`}
                >
                  {bioLength}/1000
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 order-2 sm:order-1"
            >
              <X size={16} />
              Annuler
            </button>
            <button
              type="submit"
              disabled={update.isPending}
              className="flex-1 px-6 py-3 bg-green-950 hover:bg-green-900 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {update.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Enregistrer
                </>
              )}
            </button>
          </div>

          {/* Message informatif */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-start gap-3">
              <CheckCircle
                size={16}
                className="text-primary flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-gray-500">
                Votre profil est visible par tous les membres de la communauté.
                Assurez-vous que les informations partagées sont conformes à nos
                conditions d'utilisation.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
