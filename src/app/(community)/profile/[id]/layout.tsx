"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#f9faf2]">
      <Toaster position="top-right" />

      <div className="z-50 flex-shrink-0">
        <CommunityNavbar />
      </div>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 border-r border-[rgba(194,201,187,0.3)] lg:block">
          <LeftSidebar />
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      <div
        className="z-50 flex-shrink-0 lg:hidden"
        style={{
          borderTop: "1px solid rgba(194,201,187,0.35)",
          background: "rgba(249,250,242,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <MobileBottomNav />
      </div>
    </div>
  );
}
