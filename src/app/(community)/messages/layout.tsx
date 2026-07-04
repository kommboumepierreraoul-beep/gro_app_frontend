"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 👉 source de vérité = URL
  const conversationId = searchParams.get("id");
  const isChatOpen = Boolean(conversationId);

  // État pour le mobile
  const [isMobile, setIsMobile] = useState(false);

  // Détecter le mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Logs pour vérifier le comportement (uniquement en dev)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("=== MessagesLayout Debug ===");
      console.log("conversationId from URL:", conversationId);
      console.log("isChatOpen:", isChatOpen);
      console.log("pathname:", pathname);
      console.log("isMobile:", isMobile);
      console.log("Mobile navbar should show:", !isChatOpen && isMobile);
      console.log("============================");
    }
  }, [conversationId, isChatOpen, pathname, isMobile]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f9faf2]">
      {/* ================= TOASTER ================= */}
      <Toaster position="top-right" />

      {/* ================= NAVBAR ================= */}
      <CommunityNavbar />

      {/* ================= MAIN BODY ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 flex-shrink-0 z-40 border-r border-[#d9ddd2]/30 bg-white/50">
          <LeftSidebar />
        </aside>

        {/* ================= CONTENT ================= */}
        <main
          className="flex-1 min-w-0 overflow-y-auto lg:ml-72"
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

      {/* Padding bottom pour mobile quand la navbar est visible */}
      {!isChatOpen && isMobile && <div className="lg:hidden h-16" />}
    </div>
  );
}
