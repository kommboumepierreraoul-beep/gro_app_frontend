import { Suspense } from "react";
import SearchPageContent from "./SearchPageContext";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

// ─── SKELETON ──────────────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex gap-6">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="space-y-4">
              <div className="rounded-2xl p-4 bg-white/70 backdrop-blur-sm border border-[#c2c9bb]/30 animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-4 bg-white/70 backdrop-blur-sm border border-[#c2c9bb]/30 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-6 w-16 bg-gray-200 rounded-full"
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-4 bg-white/70 backdrop-blur-sm border border-[#c2c9bb]/30 animate-pulse">
                <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
                <div className="h-16 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </aside>

          {/* Content skeleton */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 animate-pulse">
              <div className="h-8 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-200 rounded" />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="flex border-b border-gray-100 px-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="py-3 px-4">
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-gray-200 rounded" />
                      <div className="h-3 w-1/4 bg-gray-200 rounded" />
                      <div className="h-20 bg-gray-200 rounded" />
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
