import api from "@/lib/axios";
import { tokenService } from "@/lib/auth-token";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  email_verified_at: string | null;
  avatar: string | null;
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

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

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
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
} => {
  return typeof error === "object" && error !== null && "response" in error;
};

const getApiError = (error: unknown): string => {
  if (axios_isAxiosError(error)) {
    const data = error.response?.data;

    // Laravel validation errors
    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];

      if (firstKey && data.errors[firstKey]?.length) {
        return data.errors[firstKey][0];
      }
    }

    return data?.message || "Une erreur est survenue.";
  }

  return "Erreur réseau.";
};

// ─────────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────────

export const authService = {
  // ─── REGISTER ──────────────────────────────
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);

      tokenService.set(res.data.token);

      return res.data;
    } catch (error) {
        throw new Error(getApiError(error));
    }
},

  // ─── LOGIN ─────────────────────────────────
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>("/auth/login", data);

      tokenService.set(res.data.token);

      return res.data;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  // ─── PROFILE ───────────────────────────────
  async getProfile(): Promise<User> {
    try {
      const res = await api.get<{
        success: boolean;
        user: User;
      }>("/auth/profile");

      return res.data.user;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  // ─── VERIFY EMAIL OTP ──────────────────────
  async verifyEmail(code: string): Promise<{
    success: boolean;
    message: string;
    user: User;
  }> {
    try {
      const res = await api.post("/auth/email/verify", { code });

      return res.data;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  // ─── RESEND OTP ────────────────────────────
  async resendVerificationCode(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const res = await api.post("/auth/email/resend");

      return res.data;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  // ─── FORGOT PASSWORD ───────────────────────
  async forgotPassword(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
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
  }): Promise<{
    success: boolean;
    message: string;
  }> {
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
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenService.remove();
    }
  },

  isAuthenticated(): boolean {
    return tokenService.exists();
  },
};