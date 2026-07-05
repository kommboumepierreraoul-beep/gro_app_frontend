"use client";

import { Toaster } from "react-hot-toast";
import { CommunityNavbar } from "@/components/community/layout/CommunityNavbar";
import { MarketplaceLeftSidebar } from "./MarketplaceLeftSidebar";
import { MarketplaceRightSidebar } from "./MarketplaceRightSidebar";
import { MarketplaceMobileNav } from "./MarketplaceMobileNav";

export default function MarketplaceAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f9faf2]">
      <CommunityNavbar />
      <Toaster position="top-right" />
      <MarketplaceLeftSidebar />
      <div className="pt-4 pb-24 lg:pb-8 lg:pl-64">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-4 lg:px-6">
          <div className="flex items-start gap-5 xl:gap-6">
            <main className="min-w-0 flex-1">{children}</main>
            <MarketplaceRightSidebar />
          </div>
        </div>
      </div>
      <MarketplaceMobileNav />
    </div>
  );
}
