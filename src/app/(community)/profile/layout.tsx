// app/community/messages/layout.tsx
"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-full w-full g flex flex-col"
      style={{ background: "#f9faf2" }}
    >
      <Toaster position="top-right" />

      {/* Navbar */}
      <div className="flex-shrink-0 z-50">
        <CommunityNavbar />
      </div>

      {/* Corps */}
      <div className="flex  flex-1 h-full m-auto ">
        {/* Sidebar gauche — desktop */}
        <aside className="hidden lg:block  left-0 w-60 z-40 ">
          <LeftSidebar />
        </aside>

        {/* Contenu — liste + chat */}
        <main className="flex flex-1  min-w-0">{children}</main>
      </div>

      {/* Nav mobile */}
      <div
        className="lg:hidden flex-shrink-0 z-50"
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
