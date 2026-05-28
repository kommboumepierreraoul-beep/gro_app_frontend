/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnnouncementCard } from "@/components/community/announcements/AnnouncementCard";
import { announcementService }  from "@/services/community/announcement.service";
import { useAuthStore } from "@/store/auth.store";

const CATEGORIES = [
  { value: "", label: "Tous" },
  { value: "job", label: "💼 Emploi" },
  { value: "event", label: "📅 Événement" },
  { value: "news", label: "📰 Actualité" },
  { value: "training", label: "🎓 Formation" },
  { value: "other", label: "📌 Autre" },
];

export default function AnnouncementsPage() {
  const { user } = useAuthStore();
  const [category, setCategory] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["announcements", category],
    queryFn: () => announcementService.getAll(category || undefined),
  });

  const announcements = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Annonces</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
        >
          + Publier une annonce
        </button>
      </div>

      {/* Filtres catégories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              category === cat.value
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grille */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-3xl mb-2">📣</p>
          <p className="text-sm text-gray-400">
            Aucune annonce dans cette catégorie.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {announcements.map((a: any) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  );
}
