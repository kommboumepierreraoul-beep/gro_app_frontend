"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  BriefcaseBusiness,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  WalletCards,
} from "lucide-react";

const footerLinks = [
  {
    title: "Produit",
    links: [
      { label: "Communauté", href: "/community" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Missions", href: "/missions" },
      { label: "Wallet", href: "/wallet" },
    ],
  },
  {
    title: "Espaces",
    links: [
      { label: "Acheteur", href: "/orders" },
      { label: "Vendeur", href: "/my-shop" },
      { label: "Admin", href: "/admin" },
      { label: "IA", href: "/chat-ai" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Centre d’aide", href: "/support" },
      { label: "Contact", href: "/support/contact" },
      { label: "Litiges", href: "/disputes" },
      { label: "Notifications", href: "/notifications" },
    ],
  },
];

const icons = [
  MessageCircle,
  ShoppingBag,
  BriefcaseBusiness,
  WalletCards,
  Bot,
  ShieldCheck,
];

export function Footer() {
  return (
    <footer className="border-t border-[#c2c9bb]/35 bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#154212]">
                <Image
                  src="/logo_agri_pulse.png"
                  alt="AgriPulse"
                  width={32}
                  height={32}
                />
              </span>
              <span className="text-xl font-black text-[#191c18]">
                AgriPulse
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#72796e]">
              Plateforme agricole complète pour connecter la communauté,
              vendre, acheter, organiser les missions et sécuriser les échanges.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {icons.map((Icon, index) => (
                <span
                  key={index}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f3f4ed] text-[#154212]"
                >
                  <Icon className="h-5 w-5" />
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-black text-[#191c18]">
                  {section.title}
                </h4>
                <ul className="mt-3 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-[#72796e] transition hover:text-[#154212]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#c2c9bb]/35 pt-5 text-xs font-medium text-[#72796e] sm:flex-row sm:items-center sm:justify-between">
          <p>2026 AgriPulse. Tous droits réservés.</p>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Design aligné avec l’application</span>
            <Headphones className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}
