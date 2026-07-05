"use client";

import MarketplaceAreaLayout from "@/components/marketplace/MarketplaceAreaLayout";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketplaceAreaLayout>{children}</MarketplaceAreaLayout>;
}
