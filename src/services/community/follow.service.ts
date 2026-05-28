import api from "@/lib/axios";

class FollowService {
  // Get user followers
  async getFollowers(userId: string | number) {
    try {
      const response = await api.get(`/community/users/${userId}/followers`);
      return response.data;
    } catch (error) {
      console.error("Error fetching followers:", error);
      throw error;
    }
  }

  // Get user following
  async getFollowing(userId: string | number) {
    try {
      const response = await api.get(`/community/users/${userId}/following`);
      return response.data;
    } catch (error) {
      console.error("Error fetching following:", error);
      throw error;
    }
  }

  // Get follow suggestions
  async getSuggestions() {
    try {
      const response = await api.get(`/community/users/suggestions`);
      return response.data;
    } catch (error) {
      console.error("Error fetching follow suggestions:", error);
      throw error;
    }
  }

  // Follow user
  async followUser(userId: string | number) {
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
