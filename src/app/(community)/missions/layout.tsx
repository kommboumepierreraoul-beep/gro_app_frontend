"use client";

import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import MissionNavbar from "@/components/missions/layout/MissionNavbar";

interface Props {
  children: ReactNode;
}

export default function MissionsLayout({ children }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f9faf2]">
      <Toaster position="top-right" />

      <header className="z-40 h-16 flex-shrink-0">
        <CommunityNavbar />
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-72 border-r border-[#d9ddd2] lg:block">
          <LeftSidebar />
        </aside>

        <div className="hidden transition-all duration-300 xl:block">
          <MissionNavbar />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto pb-20 xl:pb-0">
          {children}
        </main>
      </div>

      <div className="xl:hidden">
        <MissionNavbar />
      </div>

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 xl:hidden">
          <MobileBottomNav />
        </div>
      )}
    </div>
  );
}
