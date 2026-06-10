/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/community/profile.service";
import { Avatar } from "@/components/community/shared/Avatar";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";

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
    }
  }, [profile]);

  const update = useMutation({
    mutationFn: (data: FormData) => profileService.update(data),
    onSuccess: (updated) => {
      setUser(updated as any);
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      toast.success("Profil mis à jour !");
      // Nettoyer les previews
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

    // Validation du type et taille
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG ou WEBP");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Fichier trop volumineux. Maximum 5MB");
      return;
    }

    setFile(file);
    setPreview(URL.createObjectURL(file));
    if (setError) setError(false);
  };

  // Nettoyage des previews au démontage
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [avatarPreview, bannerPreview]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        Modifier mon profil
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bannière */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="relative h-36 bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer group"
            onClick={() => bannerRef.current?.click()}
          >
            {(bannerPreview || (profile as any)?.banner) && !bannerError ? (
              <img
                src={bannerPreview ?? (profile as any).banner}
                alt="Bannière"
                className="w-full h-full object-cover"
                onError={() => setBannerError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/80 text-sm">
                  Cliquez pour ajouter une bannière
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                📷 Changer la bannière
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
          <div className="px-6 pb-6">
            <div
              className="-mt-8 mb-4 relative inline-block group cursor-pointer"
              onClick={() => avatarRef.current?.click()}
            >
              {avatarPreview || profile?.avatar ? (
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                  <img
                    src={avatarPreview ?? profile!.avatar!}
                    alt="Avatar"
                    className="object-cover w-full h-full"
                    onError={() => setAvatarError(true)}
                  />
                </div>
              ) : (
                <Avatar
                  src={null}
                  firstname={form.firstname || user?.firstname}
                  size="xl"
                  className="ring-4 ring-white shadow-lg"
                />
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white text-xs">📷</span>
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
            <p className="text-xs text-gray-400 mt-2">
              Formats acceptés: JPG, PNG, WEBP. Max 5MB
            </p>
          </div>
        </div>

        {/* Champs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {(["firstname", "lastname"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                  {field === "firstname" ? "Prénom" : "Nom"}
                </label>
                <input
                  value={form[field]}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                />
              </div>
            ))}
          </div>

          {[
            {
              key: "headline",
              label: "Titre professionnel",
              placeholder: "Ex: Développeur Full Stack",
            },
            {
              key: "location",
              label: "Localisation",
              placeholder: "Ex: Yaoundé, Cameroun",
            },
            {
              key: "website",
              label: "Site web",
              placeholder: "https://monsite.com",
            },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {label}
              </label>
              <input
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              placeholder="Parlez de vous..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {form.bio.length}/1000
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={update.isPending}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition"
          >
            {update.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
