import api from "@/lib/axios";

export interface PendingProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  status: "pending" | "approved" | "rejected";
  category?: { id: number; name: string };
  shop?: { id: number; name: string; logo: string };
  created_at: string;
}

export interface ActivityLog {
  id: number;
  type: "product_added" | "product_approved" | "product_rejected" | "user_joined" | "system_event";
  description: string;
  category?: string;
  created_at: string;
  related_id?: number;
}

export interface AnalyticsData {
  total_sales: number;
  total_purchases: number;
  active_users: number;
  pending_approvals: number;
  monthly_data: Array<{
    month: string;
    sales: number;
    purchases: number;
  }>;
}

export const adminService = {
  // Produits en attente
  async getPendingProducts() {
    const res = await api.get("/admin/products/pending");
    return res.data;
  },

  // Approuver un produit
  async approveProduct(id: number) {
    const res = await api.post(`/admin/products/${id}/approve`);
    return res.data;
  },

  // Rejeter un produit
  async rejectProduct(id: number, reason?: string) {
    const res = await api.post(`/admin/products/${id}/reject`, { reason });
    return res.data;
  },

  // Timeline d'activités
  async getActivityLog(limit: number = 20) {
    const res = await api.get(`/admin/activities?limit=${limit}`);
    return res.data;
  },

  // Analytics
  async getAnalytics() {
    const res = await api.get("/admin/analytics");
    return res.data;
  },

  // Utilisateurs
  async getUsers(page: number = 1, limit: number = 20) {
    const res = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return res.data;
  },

  async suspendUser(id: number) {
    const res = await api.post(`/admin/users/${id}/suspend`);
    return res.data;
  },

  async unsuspendUser(id: number) {
    const res = await api.post(`/admin/users/${id}/unsuspend`);
    return res.data;
  },

  async deleteUser(id: number) {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  // Catalogue/Produits
  async getAllProducts(page: number = 1, limit: number = 20) {
    const res = await api.get(`/admin/products?page=${page}&limit=${limit}`);
    return res.data;
  },

  async updateProduct(id: number, data: any) {
    const res = await api.put(`/admin/products/${id}`, data);
    return res.data;
  },

  async deleteProductFromCatalog(id: number) {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data;
  },

  async getCategories() {
    const res = await api.get("/admin/categories");
    return res.data;
  },

  async createCategory(data: any) {
    const res = await api.post("/admin/categories", data);
    return res.data;
  },

  async updateCategory(id: number, data: any) {
    const res = await api.put(`/admin/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: number) {
    const res = await api.delete(`/admin/categories/${id}`);
    return res.data;
  },
};
