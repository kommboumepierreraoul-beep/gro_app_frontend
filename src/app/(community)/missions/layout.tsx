/* app/community/missions/layout.tsx */

"use client";

import { ReactNode, useState, useEffect } from "react";
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
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#f9faf2] overflow-hidden">
      <Toaster position="top-right" />

      {/* TOP NAV */}
      <header className="h-16 flex-shrink-0 z-40">
        <CommunityNavbar />
      </header>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:block w-72 border-r border-[#d9ddd2]">
          <LeftSidebar />
        </aside>

        <div
          className="
      hidden xl:block
      border-r border-[#d9ddd2]
      transition-all duration-300
    "
        >
          <MissionNavbar />
        </div>

        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>

      {/* MOBILE BOTTOM NAV - Caché quand MissionNavbar est ouvert sur mobile */}
      {isMobile && (
        <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40">
          <MobileBottomNav />
        </div>
      )}
    </div>
  );
}