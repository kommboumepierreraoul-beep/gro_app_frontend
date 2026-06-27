/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Plus,
  Briefcase,
  Users,
  Eye,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { useMyMissions } from "@/hooks/missions/useMissions";
import { missionService } from "@/services/mission/mission.service";
import Agenda from "@/components/missions/Agenda";
import MyMissionCard from "@/components/missions/Card/MyMissionCard";
import { Mission } from "@/lib/missions/types";
import CreateMissionModal from "@/components/missions/Form/CreateMissionModal";

type ViewMode = "agenda" | "grid" | "list";

export default function MissionsAgendaPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("agenda");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);

  const { data: missionsData, isLoading } = useMyMissions();

  const missions = missionsData?.data ?? [];

  // Statistiques
  const publishedMissions = missions.filter((m) => m.status === "published");
  const totalApplications = missions.reduce(
    (acc, m) => acc + (m.applications_count || 0),
    0,
  );
  const totalViews = missions.reduce((acc, m) => acc + (m.views_count || 0), 0);
  const filledMissions = missions.filter((m) => m.status === "filled");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/missions"
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft size={18} className="text-gray-500" />
                </Link>
                <p className="text-green-950 text-xs tracking-widest uppercase font-semibold">
                  Mon agenda
                </p>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Calendrier des missions
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Visualisez toutes vos missions sur un calendrier
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Vue switcher */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setViewMode("agenda")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "agenda"
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Calendar size={18} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center justify-center gap-2 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-all active:scale-95"
              >
                <Plus size={16} />
                Nouvelle mission
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats rapides ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-green-950" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {publishedMissions.length}
                </p>
                <p className="text-xs text-gray-500 font-medium">Publiées</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {totalApplications}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Candidatures
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{totalViews}</p>
                <p className="text-xs text-gray-500 font-medium">
                  Vues totales
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {missions.length > 0
                    ? Math.round(
                        (filledMissions.length / missions.length) * 100,
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Taux de pourvoi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Contenu principal ────────────────────────────────────── */}
        {viewMode === "agenda" ? (
          <Agenda
            missions={missions}
            isLoading={isLoading}
            onMissionClick={(mission) => setSelectedMission(mission)}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-2xl p-6 space-y-4 animate-pulse"
                  >
                    <div className="h-5 w-20 bg-gray-200 rounded-full" />
                    <div className="h-6 w-3/4 bg-gray-200 rounded" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gray-200 rounded" />
                      <div className="h-3 w-2/3 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : missions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Aucune mission
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mb-5">
                  Commencez par créer votre première mission pour la voir
                  apparaître ici.
                </p>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm rounded-xl transition"
                >
                  <Plus size={16} />
                  Créer une mission
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "divide-y divide-gray-100"
                }
              >
                {missions.map((mission) => (
                  <MyMissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Modal ───────────────────────────────────────────────────── */}
        {createOpen && (
          <CreateMissionModal onClose={() => setCreateOpen(false)} />
        )}
      </div>
    </div>
  );
}
