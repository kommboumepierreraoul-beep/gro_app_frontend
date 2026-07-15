/* eslint-disable @typescript-eslint/no-explicit-any */
// services/community/follow.service.ts

import api from "@/lib/axios";
import { CommunityUser, Paginated } from "@/types/community.types";

class FollowService {
  async getUsers(params?: {
    search?: string;
    per_page?: number;
  }): Promise<Paginated<CommunityUser>> {
    const response = await api.get("/community/users", { params });
    return response.data.data;
  }

  // Get user followers
  async getFollowers(userId: number | string | undefined) {
    // ✅ Vérification du userId
    if (!userId) {
      console.warn("[FollowService] getFollowers: userId is required");
      return { success: true, data: [] };
    }

    try {
      const response = await api.get(`/community/users/${userId}/followers`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching followers:", {
        userId,
        status: error.response?.status,
        data: error.response?.data,
      });

      // ✅ Retourner des données vides en cas d'erreur
      return { success: false, data: [] };
    }
  }

  // Get user following
  async getFollowing(userId: string | number | undefined) {
    if (!userId) {
      console.warn("[FollowService] getFollowing: userId is required");
      return { success: true, data: [] };
    }

    try {
      const response = await api.get(`/community/users/${userId}/following`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching following:", {
        userId,
        status: error.response?.status,
        data: error.response?.data,
      });
      return { success: false, data: [] };
    }
  }

  // Get follow suggestions
  async getSuggestions() {
    try {
      const response = await api.get(`/community/users/suggestions`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching follow suggestions:", error);
      return { success: false, data: [] };
    }
  }

  // Follow user
  async followUser(userId: string | number) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const response = await api.post(`/community/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  }

  // Unfollow user
  async unfollowUser(userId: string | number) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const response = await api.delete(`/community/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
  }
}

export const followService = new FollowService();
