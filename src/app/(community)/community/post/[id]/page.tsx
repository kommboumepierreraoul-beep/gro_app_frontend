/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Sparkles, Users } from "lucide-react";

import { postService } from "@/services/community/post.service";
import { PostCard } from "@/components/community/feed/posts/PostCard";
import { CommentSection } from "@/components/community/feed/CommentSection";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const postId = Number(id);

  // Récupérer le post
  const {
    data: postData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postService.getPost(postId),
    enabled: !!postId,
  });

  const post = postData?.data || postData;

  // Récupérer les commentaires
  const { data: commentsData } = useQuery({
    queryKey: ["postComments", postId],
    queryFn: () => postService.getComments(postId),
    enabled: !!postId && !!post,
  });

  const comments = commentsData?.data || commentsData || [];

  const handleBack = () => {
    router.back();
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-4">
            {/* Back button skeleton */}
            <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse" />

            {/* Post skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-full h-64 bg-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Comments skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
      <div className="min-h-screen bg-[#f9faf2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back button skeleton */}
          <div className="w-32 h-10 bg-[#e2e3dc] rounded-xl animate-pulse mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Post skeleton - 3 colonnes */}
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
              </div>
            </div>

            {/* Comments skeleton - 2 colonnes */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-6 space-y-4 sticky top-20">
                <div className="w-32 h-6 bg-[#e2e3dc] rounded animate-pulse" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#e2e3dc] rounded-full animate-pulse ring-2 ring-[#bcf0ae]/30" />
                    <div className="flex-1 space-y-2">
                      <div className="w-24 h-3 bg-[#e2e3dc] rounded animate-pulse" />
                      <div className="w-full h-3 bg-[#e2e3dc] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 mb-6"
      <div className="min-h-screen bg-[#f9faf2] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#c2c9bb]/30 shadow-sm hover:bg-[#f9faf2] hover:border-[#154212] transition-colors text-sm font-medium text-[#42493e] mb-6"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-400">Publication introuvable.</p>
          <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-12 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <MessageCircle className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-[#191c18] mb-2">
              Publication introuvable
            </h3>
            <p className="text-sm text-[#72796e]">
              La publication que vous recherchez n'existe pas ou a été
              supprimée.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          {/* Post */}
          <div className=" rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <PostCard post={post} />
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-950" />
              Commentaires ({post.comments_count || comments.length || 0})
            </h3>
            <CommentSection postId={post.id} />
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#c2c9bb]/30 shadow-sm hover:bg-[#f9faf2] hover:border-[#154212] transition-colors text-sm font-medium text-[#42493e] mb-6"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* ─── POST - 3 colonnes ─── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 overflow-hidden hover:shadow-md transition-shadow">
              <PostCard post={post} />
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
                      {post.comments_count || comments.length || 0}
                    </span>
                  </div>
                </div>

                {/* Liste des commentaires */}
                <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto">
                  <CommentSection postId={post.id} />
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-3 border-t border-[#c2c9bb]/20 bg-[#f9faf2]/50">
                  <div className="flex items-center gap-2 text-xs text-[#72796e]">
                    <Sparkles className="w-3 h-3 text-[#154212]" />
                    <span>Participez à la conversation</span>
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
