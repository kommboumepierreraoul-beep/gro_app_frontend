"use client";

import MarketplaceAreaLayout from "@/components/marketplace/MarketplaceAreaLayout";

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketplaceAreaLayout>{children}</MarketplaceAreaLayout>;
}
