"use client";

import MarketplaceAreaLayout from "@/components/marketplace/MarketplaceAreaLayout";
import { SellerShopGuard } from "@/components/marketplace/SellerShopGuard";

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketplaceAreaLayout>
      <SellerShopGuard>{children}</SellerShopGuard>
    </MarketplaceAreaLayout>
  );
}
