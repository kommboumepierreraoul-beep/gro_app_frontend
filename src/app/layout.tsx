import type { Metadata } from "next";
import "./globals.css";
import { SystemTranslator } from "@/components/i18n/SystemTranslator";
import { GlobalLanguageToggle } from "@/components/ui/GlobalLanguageToggle";
import QueryProvider from "@/providers/query-provider";
import { CartProvider } from "@/context/CartContext"; // ✅ AJOUT
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { FirstRunGuide } from "@/components/onboarding/FirstRunGuide";

export const metadata: Metadata = {
  title: {
    default: "AgriPulse",
    template: "%s | AgriPulse",
  },
  description: "Plateforme communautaire agricole",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  applicationName: "AgriPulse",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={cn("h-full", "antialiased", "font-sans")}>
      <body className="min-h-full flex flex-col bg-white/20">
        {/* ✅ IMPORTANT: ordre des providers */}
        <LanguageProvider>
          <SystemTranslator />
          <QueryProvider>
            <CartProvider>
              <GlobalLanguageToggle />
              {children}
              <FirstRunGuide />
            </CartProvider>
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
