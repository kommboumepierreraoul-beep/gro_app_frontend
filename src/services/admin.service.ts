/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export interface PendingProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  status: "pending" | "approved" | "rejected";
  approval_status?: "pending" | "approved" | "rejected";
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
  overview?: {
    users_total: number;
    active_users: number;
    admins_total: number;
    sellers_total: number;
    shops_active: number;
    products_total: number;
    pending_approvals: number;
    approved_products: number;
    rejected_products: number;
    orders_total: number;
    orders_active: number;
    orders_completed: number;
    orders_pending_payment: number;
    orders_cash_on_delivery: number;
    disputes_open: number;
    disputes_escalated: number;
    missions_total: number;
    missions_published: number;
    mission_applications_pending: number;
    moderation_pending: number;
    wallet_balance: number;
    pending_deposits: number;
    pending_withdrawals: number;
    total_sales: number;
    monthly_sales: number;
    previous_monthly_sales: number;
    sales_growth: number;
  };
  product_status?: Record<string, number>;
  dispute_status?: Record<string, number>;
  mission_status?: Record<string, number>;
  recent_orders?: Array<{
    id: number;
    order_number: string;
    status: string;
    payment_method?: string | null;
    payment_status?: string | null;
    total_amount: number;
    customer?: string | null;
    shop?: string | null;
    created_at?: string | null;
  }>;
  recent_disputes?: Array<{
    id: number;
    status: string;
    reason: string;
    order_number?: string | null;
    customer?: string | null;
    seller?: string | null;
    created_at?: string | null;
  }>;
  monthly_data: Array<{
    month: string;
    sales: number;
    purchases: number;
    users?: number;
  }>;
}

export type AdminResource =
  | "users"
  | "shops"
  | "products"
  | "categories"
  | "missions"
  | "mission-categories"
  | "mission-applications"
  | "orders"
  | "wallets"
  | "transactions"
  | "disputes";

export interface AdminPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface AdminListResponse<T = Record<string, any>> {
  success: boolean;
  data: T[];
  pagination?: AdminPagination;
}

export interface AdminSingleResponse<T = Record<string, any>> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AdminUserInsights {
  user: Record<string, any>;
  summary: {
    account_age_days: number;
    community_score: number;
    marketplace_score: number;
    risk_flags: {
      suspended: boolean;
      publishing_blocked: boolean;
      open_disputes: number;
      pending_products: number;
    };
  };
  community: {
    posts: number;
    comments: number;
    likes_given: number;
    followers: number;
    following: number;
    messages: number;
    notifications: number;
    recent_posts: Array<Record<string, any>>;
  };
  marketplace: {
    shop: Record<string, any> | null;
    products_total: number;
    products_approved: number;
    products_pending: number;
    products_rejected: number;
    buyer_orders: number;
    seller_orders: number;
    buyer_spent: number;
    seller_revenue: number;
    recent_orders: Array<Record<string, any>>;
    map_points: Array<{
      id: number;
      label: string;
      lat: number;
      lng: number;
      status: string;
    }>;
  };
  missions: {
    authored_total: number;
    authored_published: number;
    applications_total: number;
    applications_pending: number;
    applications_accepted: number;
    recent_authored: Array<Record<string, any>>;
    recent_applications: Array<Record<string, any>>;
  };
  finance: {
    wallet: Record<string, any> | null;
    transactions_total: number;
    transactions_pending: number;
    transactions_completed: number;
    recent_transactions: Array<Record<string, any>>;
  };
  disputes: {
    as_client: number;
    as_seller: number;
    open: number;
    recent: Array<Record<string, any>>;
  };
  charts: {
    monthly: Array<{
      month: string;
      community_posts: number;
      buyer_orders: number;
      seller_orders: number;
      wallet_amount: number;
      missions: number;
    }>;
    order_status: Record<string, number>;
    product_status: Record<string, number>;
  };
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

  async systemList<T = Record<string, any>>(
    resource: AdminResource,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    } = {},
  ): Promise<AdminListResponse<T>> {
    const res = await api.get(`/admin/system/${resource}`, { params });
    return res.data;
  },

  async systemGet<T = Record<string, any>>(
    resource: AdminResource,
    id: number,
  ): Promise<AdminSingleResponse<T>> {
    const res = await api.get(`/admin/system/${resource}/${id}`);
    return res.data;
  },

  async systemCreate<T = Record<string, any>>(
    resource: AdminResource,
    data: Record<string, any>,
  ): Promise<AdminSingleResponse<T>> {
    const res = await api.post(`/admin/system/${resource}`, data);
    return res.data;
  },

  async systemUpdate<T = Record<string, any>>(
    resource: AdminResource,
    id: number,
    data: Record<string, any>,
  ): Promise<AdminSingleResponse<T>> {
    const res = await api.patch(`/admin/system/${resource}/${id}`, data);
    return res.data;
  },

  async systemDelete(resource: AdminResource, id: number) {
    const res = await api.delete(`/admin/system/${resource}/${id}`);
    return res.data;
  },

  async systemAction<T = Record<string, any>>(
    resource: AdminResource,
    id: number,
    action: string,
    data: Record<string, any> = {},
  ): Promise<AdminSingleResponse<T>> {
    const res = await api.post(
      `/admin/system/${resource}/${id}/actions/${action}`,
      data,
    );
    return res.data;
  },

  async getUserInsights(id: number): Promise<AdminSingleResponse<AdminUserInsights>> {
    const res = await api.get(`/admin/system/users/${id}/insights`);
    return res.data;
  },
};
