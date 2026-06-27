import "./globals.css";
import { CartProvider } from '@/context/CartContext';
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import QueryProvider from "@/providers/query-provider";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'], variable:'--font-sans'});
const geistSans = Geist({ subsets: ['latin'], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Gro App",
  description: "Application de gestion agricole",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <QueryProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
