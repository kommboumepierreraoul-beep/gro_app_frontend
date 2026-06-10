// app/community/messages/layout.tsx
"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "#f9faf2" }}
    >
      <Toaster position="top-right" />
      {/* Navbar fixée en haut — hauteur 4rem (h-16) */}
      <CommunityNavbar />
      {/* Corps principal sous la navbar */}
      <div className="flex flex-1 overflow-hidden " style={{ paddingTop: "0" }}>
        {/* LeftSidebar est fixed (top-16, w-72) — on lui réserve l'espace avec un spacer */}
        <div
          className="hidden lg:block flex-shrink-0"
          style={{ width: "18rem" }}
        />

        {/* Contenu — prend tout le reste */}
        <main
          className="flex flex-1 overflow-hidden min-w-0"
          style={{ background: "rgba(243,244,237,0.4)" }}
        >
          {children}
        </main>
      </div>
      {/* LeftSidebar réelle (fixed, rendue ici pour le z-order) */}
      <div className="hidden lg:block fixed top-16 left-0 w-72 z-40">
        <LeftSidebar />
      </div>
      {/* Nav mobile */}
      <div className="lg:hidden flex-shrink-0 z-50">
        <MobileBottomNav />
      </div>
    </div>
  );
}