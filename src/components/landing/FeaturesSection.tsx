"use client";

import { motion } from "framer-motion";
import {
  Bot,
  BriefcaseBusiness,
  CreditCard,
  LayoutDashboard,
  MapPinned,
  MessageSquareText,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  Store,
  UsersRound,
  WalletCards,
} from "lucide-react";

const features = [
  {
    icon: UsersRound,
    title: "Communauté agricole",
    description:
      "Posts, commentaires, profils, annonces et notifications pour échanger vite avec les producteurs, experts et partenaires.",
    color: "text-[#154212]",
    bg: "bg-[#eaf3de]",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace e-commerce",
    description:
      "Catalogue, filtres, panier, détails produits, commandes et suivi vendeur dans une interface pensée mobile.",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  {
    icon: Store,
    title: "Espace vendeur",
    description:
      "Création de boutique, ajout produit, ventes, litiges, tableau de bord et accès conditionné aux boutiques validées.",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  {
    icon: BriefcaseBusiness,
    title: "Missions agricoles",
    description:
      "Publication, candidatures, agenda, carte, notifications push et workflow complet pour organiser les besoins terrain.",
    color: "text-[#805533]",
    bg: "bg-orange-100",
  },
  {
    icon: WalletCards,
    title: "Wallet sécurisé",
    description:
      "Solde masqué, PIN 4 cases, dépôt, paiement, historique et confirmation avant les actions sensibles.",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  {
    icon: Bot,
    title: "Espace IA",
    description:
      "Assistant intégré pour accompagner les utilisateurs, structurer les recherches et accélérer les décisions.",
    color: "text-violet-700",
    bg: "bg-violet-100",
  },
  {
    icon: MessageSquareText,
    title: "Messagerie responsive",
    description:
      "Conversations, profils, boutons de création, bulles lisibles et expérience adaptée aux petits écrans.",
    color: "text-sky-700",
    bg: "bg-sky-100",
  },
  {
    icon: ShieldCheck,
    title: "Administration & modération",
    description:
      "Catalogue, utilisateurs, vendeurs, transactions, litiges, audit et files de modération de contenu.",
    color: "text-slate-700",
    bg: "bg-slate-100",
  },
  {
    icon: CreditCard,
    title: "Paiements et litiges",
    description:
      "Flux achat, confirmation, remboursement, disputes acheteur/vendeur/admin et suivi des commandes.",
    color: "text-rose-700",
    bg: "bg-rose-100",
  },
];

const pillars = [
  { icon: LayoutDashboard, label: "Un tableau de bord pour chaque rôle" },
  { icon: PackageSearch, label: "Produits, commandes et boutiques reliés" },
  { icon: MapPinned, label: "Missions terrain, agenda et carte" },
  { icon: ShieldCheck, label: "Contrôle, modération et sécurité intégrés" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3b6934]">
              Fonctionnalités
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#191c18] sm:text-5xl">
              Toute la chaîne agricole dans un seul produit.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#72796e]">
              La landing reflète l’application réelle : une plateforme complète,
              multi-rôles, opérationnelle et prête pour la croissance.
            </p>

            <div className="mt-6 grid gap-2">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.label}
                    className="flex items-center gap-3 rounded-2xl border border-[#c2c9bb]/35 bg-[#f8faf4] p-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#154212] shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-[#42493e]">
                      {pillar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.035 }}
                  viewport={{ once: true }}
                  className="group rounded-2xl border border-[#c2c9bb]/35 bg-[#fbfcf8] p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#154212]/20 hover:bg-white hover:shadow-xl hover:shadow-[#154212]/8"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-base font-black text-[#191c18]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#72796e]">
                    {feature.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
