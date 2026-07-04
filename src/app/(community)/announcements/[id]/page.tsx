/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Sparkles,
  Users,
  AlertCircle,
  Megaphone,
} from "lucide-react";

import { announcementService } from "@/services/community/announcement.service";
import { AnnouncementCard } from "@/components/community/announcements/AnnouncementCard";
import { CommentSection } from "@/components/community/feed/CommentSection";
import { postService } from "@/services/community/post.service";

interface AnnouncementPageProps {
  params: Promise<{ id: string }>;
}

export default function AnnouncementPage({ params }: AnnouncementPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const announcementId = Number(id);

  // Récupérer l'annonce
  const {
    data: announcementData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["announcement", announcementId],
    queryFn: () => announcementService.getOne(announcementId),
    enabled: !!announcementId,
  });

  const announcement = announcementData;

  // Récupérer les commentaires
  const { data: commentsData } = useQuery({
    queryKey: ["announcementComments", announcementId],
    queryFn: () => postService.getComments(announcementId),
    enabled: !!announcementId && !!announcement,
  });

  const comments = commentsData?.data || commentsData || [];

  const handleBack = () => {
    router.back();
  };

  // ─── LOADING ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9faf2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back button skeleton */}
          <div className="w-32 h-10 bg-[#e2e3dc] rounded-xl animate-pulse mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Announcement skeleton - 3 colonnes */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#e2e3dc] rounded-full animate-pulse ring-2 ring-[#bcf0ae]/30" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-[#e2e3dc] rounded animate-pulse" />
                    <div className="w-24 h-3 bg-[#e2e3dc] rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-[#e2e3dc] rounded animate-pulse" />
                  <div className="w-3/4 h-4 bg-[#e2e3dc] rounded animate-pulse" />
                  <div className="w-1/2 h-4 bg-[#e2e3dc] rounded animate-pulse" />
                </div>
                <div className="w-full h-64 bg-gradient-to-r from-[#e2e3dc] to-[#f3f4ed] rounded-xl animate-pulse" />
                <div className="flex gap-4 pt-2">
                  <div className="w-16 h-8 bg-[#e2e3dc] rounded-full animate-pulse" />
                  <div className="w-16 h-8 bg-[#e2e3dc] rounded-full animate-pulse" />
                  <div className="w-16 h-8 bg-[#e2e3dc] rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Comments skeleton - 2 colonnes */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-6 space-y-4 sticky top-20">
                <div className="flex items-center justify-between">
                  <div className="w-32 h-6 bg-[#e2e3dc] rounded animate-pulse" />
                  <div className="w-12 h-6 bg-[#e2e3dc] rounded-full animate-pulse" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#e2e3dc] rounded-full animate-pulse ring-2 ring-[#bcf0ae]/30 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-3 bg-[#e2e3dc] rounded animate-pulse" />
                          <div className="w-16 h-2 bg-[#e2e3dc] rounded animate-pulse" />
                        </div>
                        <div className="w-full h-3 bg-[#e2e3dc] rounded animate-pulse" />
                        <div className="w-3/4 h-3 bg-[#e2e3dc] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ERROR ──────────────────────────────────────────────────────────
  if (isError || !announcement) {
    return (
      <div className="min-h-screen bg-[#f9faf2] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#c2c9bb]/30 shadow-sm hover:bg-[#f9faf2] hover:border-[#154212] transition-colors text-sm font-medium text-[#42493e] mb-6"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-12 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <Megaphone className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-[#191c18] mb-2">
              Annonce introuvable
            </h3>
            <p className="text-sm text-[#72796e]">
              L'annonce que vous recherchez n'existe pas ou a été supprimée.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUCCÈS ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#c2c9bb]/30 shadow-sm hover:bg-[#f9faf2] hover:border-[#154212] transition-colors text-sm font-medium text-[#42493e] mb-6 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* ─── ANNONCE - 3 colonnes ─── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <AnnouncementCard announcement={announcement} />
            </div>

            {/* Stats rapides */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-[#c2c9bb]/30 px-4 py-3 text-center">
                <p className="text-lg font-bold text-[#154212]">
                  {announcement.likes_count || 0}
                </p>
                <p className="text-[10px] text-[#72796e] font-medium uppercase tracking-wider">
                  J'aime
                </p>
              </div>
              <div className="bg-white rounded-xl border border-[#c2c9bb]/30 px-4 py-3 text-center">
                <p className="text-lg font-bold text-[#154212]">
                  {announcement.comments_count || comments.length || 0}
                </p>
                <p className="text-[10px] text-[#72796e] font-medium uppercase tracking-wider">
                  Commentaires
                </p>
              </div>
              <div className="bg-white rounded-xl border border-[#c2c9bb]/30 px-4 py-3 text-center">
                <p className="text-lg font-bold text-[#154212]">
                  {announcement.shares_count || 0}
                </p>
                <p className="text-[10px] text-[#72796e] font-medium uppercase tracking-wider">
                  Partages
                </p>
              </div>
            </div>
          </div>

          {/* ─── COMMENTAIRES - 2 colonnes ─── */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-[#c2c9bb]/20 bg-gradient-to-r from-[#f9faf2] to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#eaf3de] flex items-center justify-center border border-[#bcf0ae]/30">
                        <MessageCircle className="w-4 h-4 text-[#154212]" />
                      </div>
                      <h3 className="text-base font-semibold text-[#191c18]">
                        Commentaires
                      </h3>
                    </div>
                    <span className="text-sm font-medium text-[#72796e] bg-[#f9faf2] px-3 py-1 rounded-full border border-[#c2c9bb]/20">
                      {announcement.comments_count || comments.length || 0}
                    </span>
                  </div>
                </div>

                {/* Liste des commentaires */}
                <div
                  className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto"
                  style={{ scrollbarWidth: "thin" }}
                >
                  <CommentSection postId={announcement.id} />
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-3 border-t border-[#c2c9bb]/20 bg-[#f9faf2]/50">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#72796e]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-[#154212]" />
                      <span>Participez à la conversation</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#72796e]" />
                      <span>{comments.length || 0} participants</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}