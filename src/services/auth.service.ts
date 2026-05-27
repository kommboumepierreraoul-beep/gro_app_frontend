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
  Cookies.set("auth_token", token, {
    expires: 7,
    secure: true,
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
      // Retourne la première erreur de validation
      const firstKey = Object.keys(data.errors)[0];
      return data.errors[firstKey][0];
    }
    return data?.message || "Une erreur est survenue.";
  }
  return "Erreur réseau.";
};

// Workaround pour isAxiosError sans import circulaire
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
  // Inscription utilisateur
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);
      saveToken(res.data.token);
      return res.data;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  // Connexion
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>("/auth/login", data);
      saveToken(res.data.token);
      return res.data;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  // Profil de l'utilisateur connecté
  async getProfile(): Promise<User> {
    try {
      const res = await api.get<{ success: boolean; user: User }>(
        "/auth/profile",
      );
      return res.data.user;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  // Vérification email avec code OTP
  async verifyEmail(
    code: string,
  ): Promise<{ success: boolean; message: string; user: User }> {
    try {
      const res = await api.post("/auth/email/verify", { code });
      return res.data;
    } catch (error) {
      throw new Error(getApiError(error));
    }
  },

  // Renvoyer le code OTP
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

  // Mot de passe oublié
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

  // Réinitialisation du mot de passe
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

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      removeToken();
    }
  },

  // Vérifier si un token existe en cookie
  isAuthenticated(): boolean {
    return !!Cookies.get("auth_token");
  },
};
