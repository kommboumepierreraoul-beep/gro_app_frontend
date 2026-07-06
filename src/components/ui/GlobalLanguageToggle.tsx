"use client";

import { usePathname } from "next/navigation";

import { LanguageToggle } from "./LanguageToggle";

const ROUTES_WITH_LOCAL_LANGUAGE_TOGGLE = ["/community", "/marketplace"];

export function GlobalLanguageToggle() {
  const pathname = usePathname();
  const hasLocalToggle = ROUTES_WITH_LOCAL_LANGUAGE_TOGGLE.some((route) =>
    pathname.startsWith(route),
  );

  if (hasLocalToggle) return null;

  return (
    <div className="fixed right-4 top-4 z-[70]">
      <LanguageToggle />
    </div>
  );
}
