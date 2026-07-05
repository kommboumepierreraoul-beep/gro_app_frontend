"use client";

import MarketplaceAreaLayout from "./MarketplaceAreaLayout";

export default function MarketplaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketplaceAreaLayout>{children}</MarketplaceAreaLayout>;
}
