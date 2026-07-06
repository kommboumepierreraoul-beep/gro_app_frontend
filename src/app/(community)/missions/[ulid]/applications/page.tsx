/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useMission } from "@/hooks/missions/useMissions";
import { useMissionStore } from "@/stores/useMissionStore";
import ApplicationsList from "@/components/missions/Form/ApplicationsList";
import MissionStatusBadge from "@/components/missions/MissionStatusBadge";
import ReviewModal from "@/components/missions/Form/ReviewModal";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function MissionApplicationsPage() {
  const { ulid } = useParams<{ ulid: string }>();
  const queryClient = useQueryClient();
  const [, setRetryCount] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    data: mission,
    isLoading: isLoadingMission,
    error: missionError,
  } = useMission(ulid);
  const reviewModalMission = useMissionStore((s) => s.reviewModalMission);
  const { user, isLoading: isLoadingAuth, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isHydrated || user || !isAuthenticated) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingProfile(true);

    authService
      .getProfile()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Session expiree. Veuillez vous reconnecter.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isHydrated, setUser, user]);

  const missionAuthorId = useMemo(() => {
    const missionWithAuthorId = mission as typeof mission & {
      author_id?: number | string;
    };

    return Number(mission?.author?.id ?? missionWithAuthorId?.author_id);
  }, [mission]);

  const currentUserId = Number(user?.id);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    queryClient.invalidateQueries({ queryKey: ["mission", ulid] });
    queryClient.invalidateQueries({ queryKey: ["mission-applications", ulid] });
    toast.success("Tentative de rechargement...");
  };

  // Attendre que l'authentification et la mission soient chargées
  if (!isHydrated || isLoadingAuth || isLoadingMission || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <Loader2 className="animate-spin text-[#154212]" size={32} />
      </div>
    );
  }

  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3">
        <AlertTriangle size={32} className="text-[#72796e]" />
        <p className="text-[#42493e]">
          Vous devez être connecté pour accéder à cette page.
        </p>
        <Link
          href="/login"
          className="text-[#154212] text-sm font-semibold hover:underline"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  // Vérifier si la mission existe
  if (!mission && missionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3">
        <AlertTriangle size={32} className="text-[#72796e]" />
        <p className="text-[#42493e]">Mission introuvable.</p>
        <p className="text-sm text-red-500 mb-4">{missionError.message}</p>
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-[#154212] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a27] transition-colors"
          >
            <RefreshCw size={16} /> Réessayer
          </button>
          <Link
            href="/missions/dashboard"
            className="px-4 py-2 border border-[#c2c9bb]/40 text-[#42493e] text-sm font-semibold rounded-xl hover:bg-[#edefe7] transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3">
        <AlertTriangle size={32} className="text-[#72796e]" />
        <p className="text-[#42493e]">Mission introuvable.</p>
        <Link
          href="/missions/dashboard"
          className="text-[#154212] text-sm font-semibold hover:underline"
        >
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  // Sécurité : seul l'auteur peut voir cette page
  if (!currentUserId || !missionAuthorId || currentUserId !== missionAuthorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3">
        <AlertTriangle size={32} className="text-[#72796e]" />
        <p className="text-[#42493e]">
          Vous n'êtes pas autorisé à voir cette page.
        </p>
        <Link
          href="/missions"
          className="text-[#154212] text-sm font-semibold hover:underline"
        >
          Retour aux missions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32 md:pb-12">
      {/* Header */}
      <Link
        href="/missions/dashboard"
        className="flex items-center gap-2 text-[#42493e] text-sm font-medium hover:text-[#154212] transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Retour au tableau de bord
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {mission.category && (
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-full uppercase"
                style={{
                  backgroundColor: `${mission.category.color}18`,
                  color: mission.category.color,
                }}
              >
                {mission.category.name}
              </span>
            )}
            <MissionStatusBadge status={mission.status} />
          </div>
          <h1 className="font-[Plus_Jakarta_Sans] text-2xl font-bold text-[#191c18]">
            {mission.title}
          </h1>
          <p className="text-sm text-[#72796e] mt-1">
            Gérez les candidatures reçues pour cette mission
          </p>
        </div>
        <Link
          href={`/missions/${mission.ulid}`}
          className="px-4 py-2 border border-[#c2c9bb]/40 text-[#42493e] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#edefe7] transition-colors shrink-0"
        >
          Voir la mission
        </Link>
      </div>

      <ApplicationsList mission={mission} />

      {reviewModalMission && <ReviewModal />}
    </div>
  );
}
