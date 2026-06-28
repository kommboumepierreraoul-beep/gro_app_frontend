import api from "@/lib/axios"; // ✅ plus axios direct

interface CreateCommentData {
  content: string;
  parentId?: number;
}

class CommentService {
  async getComments(postId: string | number) {
    try {
      const response = await api.get(`/community/posts/${postId}/comments`); // ✅
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  async addComment(postId: string | number, data: CreateCommentData) {
    try {
      const response = await api.post(
        `/community/posts/${postId}/comments`,
        data,
      ); // ✅
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  async deleteComment(commentId: string | number) {
    try {
      const response = await api.delete(`/community/comments/${commentId}`); // ✅
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  async likeComment(commentId: string | number) {
    try {
      const response = await api.post(`/community/comments/${commentId}/like`); // ✅
      return response.data;
    } catch (error) {
      console.error("Error liking comment:", error);
      throw error;
    }
  }
}

export const commentService = new CommentService();
