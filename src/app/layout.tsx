import type { Metadata } from "next";
// import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { cn } from "@/lib/utils";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={cn(
        "h-full",
        "antialiased",
        // geistMono.variable,
        "font-sans",
        // inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col bg-white/20">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
