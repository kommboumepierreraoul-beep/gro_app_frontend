// app/community/settings/layout.tsx
"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function SettingsLayout({
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

        {/* Zone de contenu scrollable avec padding adaptatif */}
        <main
          className={`
            flex-1 overflow-y-auto min-w-0
            px-4 sm:px-6 md:px-8
            py-4 sm:py-6 md:py-8
            pb-20 lg:pb-8
          `}
        >
          <div className="max-w-3xl mx-auto w-full">{children}</div>
        </main>

        {/* LeftSidebar - visible uniquement sur desktop (lg et plus) */}
        <div className="hidden lg:block">
          <LeftSidebar />
        </div>

        {/* Mobile bottom navigation - visible uniquement sur mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
}
