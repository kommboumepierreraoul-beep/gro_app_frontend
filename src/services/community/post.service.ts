/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export interface CreatePostData {
  content?: string;
  type?: "text" | "image" | "video" | "pdf" | "shared" | "announcement";
  media?: File[];
  shared_post_id?: number;
}

class PostService {
  async getFeed(page: number = 1) {
    try {
      const response = await api.get(`/community/posts`, { params: { page } });
      return response.data;
    } catch (error) {
      console.error("Error fetching feed:", error);
      throw error;
    }
  }

  async getPost(postId: string | number) {
    try {
      const response = await api.get(`/community/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  }

  async getUserPosts(userId: string | number, page: number = 1) {
    try {
      const response = await api.get(`/community/posts/user/${userId}`, {
        params: { page },
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  }

  async getUserSharedPosts(userId: string | number, page: number = 1) {
    try {
      const response = await api.get(`/community/posts/user/${userId}/shared`, {
        params: { page },
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("Error fetching user shared posts:", error);
      throw error;
    }
  }

  async getUserLikedPosts(userId: string | number, page: number = 1) {
    try {
      const response = await api.get(`/community/posts/user/${userId}/liked`, {
        params: { page },
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("Error fetching user liked posts:", error);
      throw error;
    }
  }

  async createPost(data: CreatePostData) {
    const formData = new FormData();

    // ✅ N'envoyer content que s'il est non vide
    // Laravel reçoit le champ comme absent → nullable passe
    if (data.content && data.content.trim().length > 0) {
      formData.append("content", data.content.trim());
    } else {
      // Envoyer une chaîne vide explicite pour que Laravel
      // le traite comme nullable et non comme "missing"
      formData.append("content", "");
    }

    formData.append("type", data.type ?? "text");

    if (data.shared_post_id) {
      formData.append("shared_post_id", String(data.shared_post_id));
    }

   if (data.media && data.media.length > 0) {
     data.media.forEach((file) => {
       formData.append("media[]", file); // ← [] obligatoire pour PHP
     });
   }

    try {
      const response = await api.post("/community/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Response data:", error.response?.data);
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([key, val]) => {
          console.error(`  - ${key}:`, val);
        });
      }
      throw error;
    }
  }

  async deletePost(postId: string | number) {
    try {
      const response = await api.delete(`/community/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }

  async toggleLike(postId: string | number) {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  }

  async sharePost(postId: string | number, content: string = "") {
    try {
      const response = await api.post(`/community/posts`, {
        content: content || "A partagé une publication.",
        type: "shared",
        shared_post_id: postId,
      });
      return response.data;
    } catch (error) {
      console.error("Error sharing post:", error);
      throw error;
    }
  }

  async getComments(postId: string | number) {
    try {
      const response = await api.get(`/community/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  async searchPosts(query: string, page: number = 1) {
    try {
      const response = await api.get(`/community/posts/search`, {
        params: { q: query, page },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching posts:", error);
      return { data: [] };
    }
  }
}

export const postService = new PostService();
