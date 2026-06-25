/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";

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

  // Extraire les données du post
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
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-400">Publication introuvable.</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
