"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { RightSidebar } from "@/components/community/layout/RightSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "rgba(243,244,237,0.4)" }}
    >
      {/* Navbar */}
      <CommunityNavbar />

      <Toaster position="top-right" />

      <div className="relative">
        {/* Sidebar gauche desktop */}
        <aside className="hidden lg:block">
          <LeftSidebar />
        </aside>

        {/* Zone principale */}
        <div
          className="
            pt-10
            pb-20
            lg:pb-6
            lg:pl-72
          "
        >
          <div
            className="
              mx-auto
              max-w-[1200px]
              px-3
              sm:px-4
              lg:px-6
            "
          >
            <div className="flex gap-6 items-start">
              {/* Contenu */}
              <main
                className="
                  flex-1
                  min-w-0
                  w-full
                  max-w-3xl
                  mx-auto
                "
                style={{
                          background: "rgba(249,250,242,0.92)",

                }}
              >
                {children}
              </main>

              {/* Sidebar droite uniquement XL */}
              <div
                className="
                  hidden
                  xl:block
                  w-[320px]
                  flex-shrink-0
                "
              >
                <div>
                  <RightSidebar />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation mobile uniquement */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
