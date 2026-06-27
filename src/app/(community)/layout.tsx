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
    <div className="min-h-screen bg-gray-50">
      <CommunityNavbar />
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-20 md:pb-6">
        <div className="flex gap-6">
          {/* Sidebar gauche — masquée sur mobile */}
          <div className=" lg:block">
            <LeftSidebar />
          </div>

          {/* Contenu principal */}
          <main className="flex-1 min-w-0">{children}</main>

          {/* Sidebar droite — masquée sur mobile */}
          <div className=" xl:block">
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Nav mobile */}
      <MobileBottomNav />
    </div>
  );
}
