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
    <div
      className="h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "#f9faf2" }}
    >
      <Toaster position="top-right" />

      {/* Navbar fixée — génère son propre spacer h-16 en bas de son render */}
      <CommunityNavbar />

      {/* Corps : sidebar spacer + contenu centré */}
      <div className="flex flex-1 overflow-hidden">
        {/* Spacer = largeur de la LeftSidebar fixed (w-72 = 18rem) */}
        <div
          className="hidden lg:block flex-shrink-0"
          style={{ width: "18rem" }}
        />

        {/* Zone de contenu scrollable */}
        <main className="flex-1 overflow-y-auto min-w-0 py-6 px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">{children}</div>
        </main>
      </div>

      {/* LeftSidebar fixed — positionnée indépendamment du flux */}
      <LeftSidebar />

      {/* Nav mobile bas de page */}
      <div className="lg:hidden flex-shrink-0 z-50">
        <MobileBottomNav />
      </div>
    </div>
  );
}
