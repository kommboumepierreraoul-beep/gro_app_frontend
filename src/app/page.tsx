"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import LoginPage from "./(auth)/login/page";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2, LucideLoader } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && user) {
      router.replace("/community"); 
    }
  }, [isHydrated, user, router]);

  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">
          Chargement...
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="h-screen flex items-center justify-center animate-pulse">
        <p className="text-green-400">
          <LucideLoader className="animate-spin  size={24}" />
          <span className="ml-2">Redirection en cours...</span>
        </p>
      </div>
    );
  }

  // 👉 utilisateur non connecté => login
  return <LoginPage />;
}