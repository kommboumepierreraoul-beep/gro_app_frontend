/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export interface CreatePostData {
  content: string;
  type?: "text" | "image" | "video" | "announcement";
  media?: File[];
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
  async createPost(data: CreatePostData) {
    const formData = new FormData();

    formData.append("content", data.content);
    formData.append("type", data.type ?? "text");

    if (data.media?.length) {
      data.media.forEach((file) => {
        formData.append("media", file);
      });
    }

    const response = await api.post("/community/posts", formData);

    return response.data;
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
}

export const postService = new PostService();
