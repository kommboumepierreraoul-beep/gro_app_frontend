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

export default function MissionsSupportLayout({ children }: Props) {
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
    <>
      <MissionNavbar />
      <main
        className={`
            flex-1 overflow-y-auto min-w-0
            px-4 sm:px-6 md:px-8
            py-4 sm:py-6 md:py-8
            pb-20 lg:pb-8
          `}
      >
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </>
  );
}