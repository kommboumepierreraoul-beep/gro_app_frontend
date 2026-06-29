/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { PostCard } from "../feed/PostCard";
import { FileText, AlertCircle, Filter, Loader2 } from "lucide-react";

interface ProfilePostsProps {
  posts: any[];
  isLoading?: boolean;
  title?: string;
}

export default function ProfilePosts({
  posts,
  isLoading = false,
  title = "Publications",
}: ProfilePostsProps) {
  const [filter, setFilter] = useState<"all" | "recent" | "popular">("recent");

  const filteredPosts = [...posts].sort((a, b) => {
    if (filter === "recent") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if (filter === "popular") {
      return (b.likes_count || 0) - (a.likes_count || 0);
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/20 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-4 sm:p-6">
        {/* Header avec filtres */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#154212] rounded-full" />
            <h3 className="text-base font-bold text-[#191c18]">{title}</h3>
            {posts.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#f3f4ed] text-[#72796e] rounded-full">
                {posts.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#72796e]" strokeWidth={1.8} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-xs bg-[#f3f4ed] border border-[#c2c9bb]/20 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212]"
            >
              <option value="recent">Plus récents</option>
              <option value="popular">Plus populaires</option>
            </select>
          </div>
        </div>

        {/* Contenu */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-20 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-[#f3f4ed] rounded-full flex items-center justify-center mb-4 border border-[#c2c9bb]/20">
              <FileText
                size={32}
                className="text-[#c2c9bb]"
                strokeWidth={1.5}
              />
            </div>
            <h4 className="text-base font-semibold text-[#42493e] mb-1">
              Aucune publication
            </h4>
            <p className="text-sm text-[#72796e] max-w-sm">
              Cet utilisateur n'a pas encore publié de contenu.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
