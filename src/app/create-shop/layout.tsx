"use client";

import MarketplaceAreaLayout from "@/components/marketplace/MarketplaceAreaLayout";

export default function CreateShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketplaceAreaLayout>{children}</MarketplaceAreaLayout>;
}
