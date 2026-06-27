import api from "@/lib/axios";
import { CommunityUser } from "@/types/community.types";

export const profileService = {
  async getMe(): Promise<CommunityUser> {
    const res = await api.get("/community/profile/me");
    return res.data.data;
  },

  async getProfile(userId: number): Promise<CommunityUser> {
    const res = await api.get(`/community/profile/${userId}`);
    return res.data.data;
  },

  async update(data: FormData): Promise<CommunityUser> {
    const res = await api.put("/community/profile/me", data);
    return res.data.data;
  },

  async search(query: string): Promise<CommunityUser[]> {
    const res = await api.get(`/community/profile/search?q=${encodeURIComponent(query)}`);
    return res.data.data;
  },
};
