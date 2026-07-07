"use client";

import type { ReactNode } from "react";
import MarketplaceAreaLayout from "@/components/marketplace/MarketplaceAreaLayout";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return <MarketplaceAreaLayout>{children}</MarketplaceAreaLayout>;
}
