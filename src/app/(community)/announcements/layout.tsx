"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { RightSidebar } from "@/components/community/layout/RightSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-[#f3f4ed]/40"
    >
      {/* Navbar */}
      <CommunityNavbar />

      <Toaster position="top-right" />

      <div className="flex">
        {/* Sidebar gauche */}
        <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-56">
          <LeftSidebar />
        </aside>

        {/* Contenu principal */}
        <div className="flex-1 lg:ml-56">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-6">
            <div className="flex gap-6 items-start">
              
              {/* Feed principal */}
              <main
                className="
                  flex-1
                  w-full
                  max-w-4xl
                  mx-auto
                "
              >
                {children}
              </main>

              {/* Sidebar droite */}
              <aside
                className="
                  hidden
                  xl:block
                  w-[320px]
                  shrink-0
                  sticky
                  top-24
                "
              >
                <RightSidebar />
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation mobile */}
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}