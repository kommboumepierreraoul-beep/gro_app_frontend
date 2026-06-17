// app/community/notifications/layout.tsx
"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f9faf2]">
      <Toaster position="top-right" />

      {/* Navbar fixée */}
      <CommunityNavbar />

      {/* Corps principal */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Spacer pour la LeftSidebar - visible uniquement sur desktop */}
        <div className="hidden lg:block w-72 flex-shrink-0" />

        {/* Zone de contenu scrollable */}
        <main
          className={`
          flex-1 overflow-y-auto min-w-0
        `}
        >
          <div className="max-w-2xl mx-auto w-full">{children}</div>
        </main>

        {/* LeftSidebar - visible uniquement sur desktop (lg et plus) */}
        <div className="hidden lg:block">
          <LeftSidebar />
        </div>

        {/* Mobile bottom navigation - visible uniquement sur mobile */}
        <div className="lg:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
}
