"use client";

import MarketplaceAreaLayout from "@/components/marketplace/MarketplaceAreaLayout";

export default function ShopCreatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketplaceAreaLayout>{children}</MarketplaceAreaLayout>;
}
