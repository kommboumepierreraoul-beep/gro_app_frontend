import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;

  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isHydrated: false,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),

      setHydrated: (isHydrated) => set({ isHydrated }),

      reset: () =>
        set({
          user: null,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",

      partialize: (state) => ({
        user: state.user,
      }),

      onRehydrateStorage: () => (state) => {
        // 🔥 appelé quand le localStorage est rechargé
        state?.setHydrated(true);
      },
    },
  ),
);
