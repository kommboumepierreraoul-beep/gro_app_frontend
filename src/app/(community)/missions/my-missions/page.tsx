/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import  api from '@/lib/axios'
import MissionCard from "@/components/missions/Card/MissionCard";
import EmptyMissions from "@/components/missions/EmptyMission";
import { useMissionStore } from "@/stores/useMissionStore";
import { useRouter } from "next/navigation";

const BASE_URL="http://localhost:"
export default function MyMissionPage() {
  const { filters } = useMissionStore();
  const router = useRouter();

  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyMissions();
  }, [filters]);

  const fetchMyMissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/missions/my", {
        params: {
          status: filters.status || undefined,
          per_page: 20,
        },
      });

      setMissions(res.data.data);
    } catch (err) {
      setError("Erreur lors du chargement des missions");
    } finally {
      setLoading(false);
    }
  };

  // ── LOADING ─────────────────────
  if (loading) {
    return <div className="p-6 text-gray-500">Chargement...</div>;
  }

  // ── ERROR ───────────────────────
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  // ── EMPTY STATE (ICI TON COMPOSANT) ─────────────────────
  if (missions.length === 0) {
    return (
      <EmptyMissions
        onCreateClick={() => router.push("/community/missions/create")}
      />
    );
  }

  // ── LIST ────────────────────────
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} viewMode="grid" />
      ))}
    </div>
  );
}