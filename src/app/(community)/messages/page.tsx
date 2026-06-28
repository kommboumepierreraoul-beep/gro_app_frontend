export const dynamic = "force-dynamic";

import { Suspense } from "react";
import MessagesPageContent from "./MessagesPageContent";

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesPageContent />
    </Suspense>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function MessagesSkeleton() {
  return (
    <div className="inset-0 top-16 h-[calc(100vh-4rem)] flex w-full overflow-hidden bg-[#f9faf2]">
      <section
        className="flex flex-col md:w-96 border-r border-[rgba(194,201,187,0.35)]"
        style={{ background: "rgba(249,250,242,0.96)" }}
      >
        <div className="px-6 py-4 border-b border-[rgba(194,201,187,0.35)] flex items-center justify-between flex-shrink-0">
          <div className="h-8 w-32 bg-[#e7e9e1] rounded animate-pulse" />
          <div className="w-10 h-10 bg-[#e7e9e1] rounded-full animate-pulse" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-[#e7e9e1]/50 rounded-xl animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-[#e7e9e1] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-[#e7e9e1] rounded" />
                <div className="h-3 w-24 bg-[#e7e9e1] rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="flex-1 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-[#e7e9e1] rounded-full animate-pulse mb-4" />
        <div className="h-6 w-48 bg-[#e7e9e1] rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-[#e7e9e1] rounded animate-pulse" />
      </section>
    </div>
  );
}
