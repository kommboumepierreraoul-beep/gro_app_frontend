// app/community/missions/layout.tsx
"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function MissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f9faf2]">
      <Toaster position="top-right" />

      {/* Navbar fixée en haut */}
      <CommunityNavbar />

      {/* Corps principal */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* LeftSidebar - fixe à gauche */}
        <div className="hidden lg:block fixed left-0 top-16 w-72 h-[calc(100vh-4rem)] overflow-y-auto z-40">
          <LeftSidebar />
        </div>

        {/* Espace réservé pour la sidebar (pour éviter que le contenu passe dessous) */}
        <div className="hidden lg:block flex-shrink-0 w-72" />

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileBottomNav />
      </div>
    </div>
  );
}
