"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import LoginPage from "./(auth)/login/page";
import { useAuthStore } from "@/stores/auth.store";

export default function Home() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // minimum 3 secondes

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash && isHydrated && user) {
      router.replace("/community");
    }
  }, [showSplash, isHydrated, user, router]);

  if (showSplash || !isHydrated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-white overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-green-100/40 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-green-200/30 blur-3xl animate-pulse" />

        <div className="relative flex flex-col items-center">
          {/* Halo */}
          <div className="absolute w-40 h-40 rounded-full bg-green-200/40 blur-3xl animate-pulse" />

          {/* Logo */}
          <div className="relative animate-[float_3s_ease-in-out_infinite]">
            <Image
              src="/logo_agri_pulse.png"
              alt="AgriPulse"
              width={120}
              height={120}
              priority
              className="drop-shadow-2xl"
            />
          </div>

          {/* Nom */}
          <h1 className="mt-8 text-4xl font-bold tracking-tight bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent">
            AgriPulse
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Connecter • Produire • Grandir
          </p>

          {/* Barre de progression */}
          <div className="mt-10 w-56 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-green-700 to-green-400 animate-[loading_3s_linear_forwards]" />
          </div>
        </div>

        <style jsx global>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-12px);
            }
          }

          @keyframes loading {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0%);
            }
          }
        `}</style>
      </div>
    );
  }

  if (user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <Image
            src="/logo_agri_pulse.png"
            alt="AgriPulse"
            width={80}
            height={80}
            className="animate-pulse"
            priority
          />
        </div>
      </div>
    );
  }

  return <LoginPage />;
}
