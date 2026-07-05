// app/community/settings/layout.tsx
"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function SupportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f9faf2]">
      <Toaster position="top-right" />

      {/* Navbar */}
      <CommunityNavbar />

      {/* Corps principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* LeftSidebar - fixée à gauche sur desktop */}
        <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 flex-shrink-0 z-40 border-r border-[#d9ddd2]/30 bg-white/50">
          <LeftSidebar />
        </aside>

        {/* Espace pour la sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0" />

        {/* Zone de contenu scrollable */}
        <main
          className={`
            flex-1 overflow-y-auto min-w-0
            px-4 sm:px-6 md:px-8
            py-4 sm:py-6 md:py-8
            pb-20 lg:pb-8
          `}
        >
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation - visible uniquement sur mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileBottomNav />
      </div>
    </div>
  );
}
