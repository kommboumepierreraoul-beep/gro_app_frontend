"use client";

import { useSearchParams } from "next/navigation";
import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();

  // 👉 source de vérité = URL
  const conversationId = searchParams.get("id");
  const isChatOpen = Boolean(conversationId);

  // Logs pour vérifier le comportement
  useEffect(() => {
    console.log("=== MessagesLayout Debug ===");
    console.log("conversationId from URL:", conversationId);
    console.log("isChatOpen:", isChatOpen);
    console.log(
      "searchParams全体:",
      Object.fromEntries(searchParams.entries()),
    );
    console.log("Mobile navbar should show:", !isChatOpen);
    console.log("============================");
  }, [conversationId, isChatOpen, searchParams]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f9faf2] overflow-hidden">
      {/* ================= TOASTER ================= */}
      <Toaster position="top-right" />

      {/* ================= NAVBAR ================= */}
      <CommunityNavbar />

      {/* ================= MAIN BODY ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="hidden lg:block w-72 flex-shrink-0 fixed top-16 left-0 bottom-0 z-40">
          <LeftSidebar />
        </aside>

        {/* Spacer pour sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0" />

        {/* ================= CONTENT ================= */}
        <main
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ background: "rgba(243,244,237,0.4)" }}
        >
          {children}
        </main>
      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      {/* La navbar mobile disparaît complètement quand une conversation est ouverte */}
      {!isChatOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <MobileBottomNav />
        </div>
      )}
    </div>
  );
}
