/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";
import Cookies from "js-cookie";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin";
  email_verified_at: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  gender?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const saveToken = (token: string) => {
  if (!token) {
    console.error('saveToken appelé avec token vide !');
    return;
  }
  Cookies.set("auth_token", token, {
    expires: 7,
    secure: false,
    sameSite: "strict",
  });
};

const removeToken = () => {
  Cookies.remove("auth_token");
};

const getApiError = (error: unknown): string => {
  if (axios_isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      return data.errors[firstKey][0];
    }
    return data?.message || "Une erreur est survenue.";
  }
  return "Erreur réseau.";
};

const axios_isAxiosError = (
  error: unknown,
): error is {
  response?: {
    data?: { message?: string; errors?: Record<string, string[]> };
    status?: number;
  };
} => {
  return typeof error === "object" && error !== null && "response" in error;
};

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  // auth.service.ts
async register(data: RegisterData): Promise<AuthResponse> {
    try {
        const res = await api.post("/auth/register", data);
        
        // ✅ Parse manuellement si c'est encore une string
        const responseData = typeof res.data === 'string' 
            ? JSON.parse(res.data) 
            : res.data;
        
        console.log('Token extrait:', responseData.token);
        saveToken(responseData.token);
        return responseData;
    } catch (error) {
        throw new Error(getApiError(error));
    }
},

async login(data: LoginData): Promise<AuthResponse> {
    try {
        const res = await api.post("/auth/login", data);
        
        const responseData = typeof res.data === 'string'
            ? JSON.parse(res.data)
            : res.data;

        saveToken(responseData.token);
        return responseData;
    } catch (error) {
        throw new Error(getApiError(error));
    }
},

  async getProfile(): Promise<User> {
    try {
      const res = await api.get<{ success: boolean; user: User }>("/auth/profile");
      return res.data.user;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  // ✅ verifyEmail corrigé — utilise `api` avec le token du cookie
  async verifyEmail(code: string): Promise<any> {
    try {
      const res = await api.post("/auth/email/verify", { code });
      return res.data;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  // ✅ resendVerificationCode corrigé
  async resendVerificationCode(): Promise<any> {
    try {
      const res = await api.post("/auth/email/resend");
      return res.data;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return res.data;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  async resetPassword(data: {
    email: string;
    code: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.post("/auth/reset-password", data);
      return res.data;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      removeToken();
    }
  },

  isAuthenticated(): boolean {
    return !!Cookies.get("auth_token");
  },
};