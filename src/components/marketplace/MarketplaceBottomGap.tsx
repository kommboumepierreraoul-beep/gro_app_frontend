"use client";

import React from "react";

export default function MarketplaceBottomGap() {
  // Helps avoid overlap on some devices where fixed bottom nav differs.
  return <div className="h-6" aria-hidden />;
}
