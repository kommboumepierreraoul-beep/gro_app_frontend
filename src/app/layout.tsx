import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { CartProvider } from "@/context/CartContext"; // ✅ AJOUT
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "AgriPulse",
    template: "%s | AgriPulse",
  },
  description: "Plateforme communautaire agricole",
  icons: {
    icon: [
      { url: "/logo_agri_pulse.png", sizes: "32x32", type: "image/png" },
      { url: "/logo_agri_pulse.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/logo_agri_pulse.png",
    apple: "/logo_agri_pulse.png",
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
        <QueryProvider>
          <CartProvider>{children}</CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
