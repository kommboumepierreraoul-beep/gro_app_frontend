"use client";

import Link from "next/link";
import {
  Leaf,
  AtSign,
  BriefcaseBusiness,
  Code2,
  PlayCircle,
  Radio,
} from "lucide-react";

const footerLinks = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalites", href: "#" },
      { label: "Tarifs", href: "#" },
      { label: "Demo", href: "#demo" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Communaute",
    links: [
      { label: "Forum", href: "#" },
      { label: "Evenements", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Temoignages", href: "#" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "A propos", href: "#" },
      { label: "Carrieres", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Presse", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Conditions", href: "#" },
      { label: "Confidentialite", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Mentions", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#c2c9bb]/30 bg-[#f9faf2] px-4 py-10 text-[#72796e] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-8 rounded-2xl border border-[#c2c9bb]/30 bg-white/70 p-5 backdrop-blur-sm sm:p-6 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#154212]">
                <Leaf className="h-5 w-5 text-[#bcf0ae]" />
              </span>
              <span className="text-lg font-bold text-[#191c18]">
                Agripulse
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed">
              La plateforme qui connecte la communaute agricole. Cultivez vos
              projets, echangez vos connaissances.
            </p>
            <div className="mt-4 flex gap-2">
              {[AtSign, BriefcaseBusiness, PlayCircle, Radio, Code2].map(
                (Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-[#72796e] transition-colors hover:bg-[#eaf3de] hover:text-[#154212]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ),
              )}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-sm font-semibold text-[#191c18]">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[#154212]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 px-1 pt-5 text-xs text-[#72796e] sm:flex-row sm:items-center sm:justify-between">
          <p>2026 Agripulse. Tous droits reserves.</p>
          <p>Construit avec la communaute GRO</p>
        </div>
      </div>
    </footer>
  );
}
