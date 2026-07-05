"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");
  const isChatOpen = Boolean(conversationId);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-hidden bg-[#f9faf2]">
      <Toaster position="top-right" />
      <CommunityNavbar />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100dvh-4rem)] w-72 flex-shrink-0 border-r border-[#d9ddd2]/30 bg-white/50 lg:block">
          <LeftSidebar />
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden lg:ml-72">
          {children}
        </main>
      </div>

      {!isChatOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
          <MobileBottomNav />
        </div>
      )}

      {!isChatOpen && isMobile && <div className="h-16 shrink-0 lg:hidden" />}
    </div>
  );
}
