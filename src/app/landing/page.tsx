import type { Metadata } from "next";

import { LandingPageContent } from "@/components/landing/LandingPageContent";

export const metadata: Metadata = {
  title: "AgriPulse - Plateforme agricole communautaire",
  description:
    "Découvrez AgriPulse : communauté agricole, marketplace, missions, wallet, IA, messagerie et administration dans une seule application.",
};

export default function LandingPage() {
  return <LandingPageContent />;
}
