// app/(community)/chat-ai/layout.tsx
"use client";

import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { LeftSidebar } from "@/components/community/layout/LeftSidebar";
import { MobileBottomNav } from "@/components/community/layout/MobileBottomNav";
import { Toaster } from "react-hot-toast";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f9faf2]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#f9faf2",
            color: "#191c18",
            border: "1px solid rgba(194,201,187,0.4)",
            borderRadius: "16px",
            padding: "12px 16px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          },
          success: {
            iconTheme: {
              primary: "#2d5a27",
              secondary: "#bcf0ae",
            },
          },
          error: {
            iconTheme: {
              primary: "#ba1a1a",
              secondary: "#ffdad6",
            },
          },
          duration: 3000,
        }}
      />

      {/* NAVBAR FIXE */}
      <header className="h-16 flex-shrink-0 z-50">
        <CommunityNavbar />
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR FIXE (desktop) */}
        <aside className="hidden lg:block fixed top-16 left-0 w-72 h-[calc(100vh-4rem)] z-40">
          <LeftSidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main
          className="flex-1 flex overflow-hidden min-w-0 lg:ml-72"
          style={{
            background: "rgba(243,244,237,0.4)",
          }}
        >
          <div className="flex-1 flex overflow-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileBottomNav />
      </div>
    </div>
  );
}
