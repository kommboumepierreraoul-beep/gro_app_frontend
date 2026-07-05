"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#f9faf2]">
      <Toaster position="top-right" />
      <div className="z-50 flex-shrink-0">
        <CommunityNavbar />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 border-r border-[#d9ddd2]/60 lg:block">
          <LeftSidebar />
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
