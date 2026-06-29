import api from "@/lib/axios";
import { CommunityUser } from "@/types/community.types";

export const profileService = {
  // Récupérer mon profil
 async getMe() {
  const res = await api.get("/community/profile/me");

  console.log("TYPE", typeof res.data);
  console.log("RAW", res.data);

  return res.data.data;
},

  // Récupérer le profil d'un utilisateur
  async getProfile(userId: number): Promise<CommunityUser> {
    const res = await api.get(`/community/profile/${userId}`);
    return res.data.data;
  },

  // 🔥 CORRECTION: Mettre à jour le profil (sans /me)
  async update(data: FormData): Promise<CommunityUser> {
    console.log("📤 Profile update - Sending data:", {
      hasAvatar: data.has("avatar"),
      hasBanner: data.has("banner"),
      firstname: data.get("firstname"),
      lastname: data.get("lastname"),
    });

    const res = await api.put("/community/profile/me", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Profile update - Response:", res.data);
    return res.data.data;
  },

  // Supprimer l'avatar
  async deleteAvatar(): Promise<{ success: boolean; message: string }> {
    const res = await api.delete("/community/profile/avatar");
    return res.data;
  },

  // Supprimer la bannière
  async deleteBanner(): Promise<{ success: boolean; message: string }> {
    const res = await api.delete("/community/profile/banner");
    return res.data;
  },

  // Rechercher des utilisateurs
  async search(query: string): Promise<CommunityUser[]> {
    const res = await api.get(
      `/community/profile/search?q=${encodeURIComponent(query)}`,
    );
    return res.data.data;
  },

  
};
