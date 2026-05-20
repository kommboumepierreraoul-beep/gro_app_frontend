import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set({ user: null, isLoading: false }),
    }),
    {
      name: "auth-storage", // clé dans localStorage
      partialize: (state) => ({ user: state.user }), // ne persiste que le user
    },
  ),
);
