import { useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { authService, LoginData, RegisterData } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
  const router = useRouter();
  const { user, isLoading, setUser, setLoading, reset } = useAuthStore();

  const register = useCallback(
    async (data: RegisterData) => {
      setLoading(true);
      try {
        const res = await authService.register(data);
        setUser(res.user);
        toast.success("Inscription réussie ! Vérifiez votre email.");
        router.push("/verify-email");
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Erreur inscription",
        );
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading],
  );

  const login = useCallback(
    async (data: LoginData) => {
      setLoading(true);
      try {
        const res = await authService.login(data);
        setUser(res.user);
        toast.success("Connexion réussie !");

        // 1. Email non vérifié → vérification d'abord (quelque soit le rôle)
        if (!res.user.email_verified_at) {
          router.push("/verify-email");
          return;
        }

        // 2. Redirection selon le rôle
        if (res.user.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/community");
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Erreur connexion",
        );
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading],
  );

  const verifyEmail = useCallback(
    async (code: string) => {
      setLoading(true);
      try {
        const res = await authService.verifyEmail(code);
        setUser(res.user);
        toast.success("Email vérifié avec succès !");
        router.push("/dashboard");
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Code invalide");
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading],
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      reset();
      toast.success("Déconnexion réussie.");
      router.push("/login");
    } catch {
      reset();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router, reset, setLoading]);

  return {
    user,
    isLoading,
    isAuthenticated: authService.isAuthenticated(),
    isEmailVerified: !!user?.email_verified_at,
    register,
    login,
    verifyEmail,
    logout,
  };
}
