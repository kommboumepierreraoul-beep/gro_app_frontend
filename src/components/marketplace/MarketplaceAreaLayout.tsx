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
    <div className="marketplace-root min-h-dvh overflow-x-hidden bg-[#f9faf2]">
      <CommunityNavbar />
      <Toaster position="top-right" />
      <MarketplaceLeftSidebar />
      <div className="pb-28 pt-3 lg:pb-8 lg:pl-64">
        <div className="mx-auto w-full max-w-[1680px] px-3 sm:px-4 lg:px-5 2xl:px-6">
          <div className="flex items-start gap-4 xl:gap-5">
            <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
            <MarketplaceRightSidebar />
          </div>
        </div>
      </div>
      <MarketplaceMobileNav />
    </div>
  );
}
