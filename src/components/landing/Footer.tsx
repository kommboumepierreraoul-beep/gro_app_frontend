"use client";

import Link from "next/link";
import { Leaf, Twitter, Linkedin, Youtube, Instagram, Github } from "lucide-react";

const footerLinks = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "#" },
      { label: "Tarifs", href: "#" },
      { label: "Démo", href: "#demo" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Communauté",
    links: [
      { label: "Forum", href: "#" },
      { label: "Événements", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Témoignages", href: "#" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "#" },
      { label: "Carrières", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Presse", href: "#" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Conditions", href: "#" },
      { label: "Confidentialité", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Mentions", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#191c18] text-white/60 border-t border-white/5">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-[#bcf0ae]" />
              <span className="text-xl font-bold text-white">Agripulse</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              La plateforme qui connecte la communauté agricole. Cultivez vos
              projets, échangez vos connaissances.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-white/40 hover:text-[#bcf0ae] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-white/40 hover:text-[#bcf0ae] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="text-white/40 hover:text-[#bcf0ae] transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="text-white/40 hover:text-[#bcf0ae] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-white/40 hover:text-[#bcf0ae] transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© 2026 Agripulse. Tous droits réservés.</p>
          <p>Made with 🌱 by la communauté GRO</p>
        </div>
      </div>
    </footer>
  );
}