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
      <div className="flex flex-1 relative overflow-hidden">
        {/* COMMUNITY SIDEBAR (desktop only, fixed drawer style) */}
        <aside className="hidden lg:block w-72 border-r border-[#d9ddd2] bg-white overflow-y-auto">
          <LeftSidebar />
        </aside>

        {/* CONTENT WRAPPER */}
        <div className="flex flex-1 min-w-0 overflow-hidden relative">
          {/* MAIN CONTENT */}
          <main className={`
            flex-1 overflow-y-auto min-w-0
            ${isMobile ? 'pb-0' : 'pb-20 lg:pb-0'}
            px-2 md:px-4
          `}>
            {children}
          </main>

          {/* MISSIONS NAVBAR - Visible sur mobile et desktop */}
          <div className={`
            ${isMobile ? 'block' : 'hidden xl:block'}
            transition-all duration-300
          `}>
            <MissionNavbar />
          </div>
        </div>
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