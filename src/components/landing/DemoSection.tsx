"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";

const workflow = [
  {
    title: "Découvrir",
    text: "L’utilisateur rejoint la communauté, suit des profils et repère des besoins terrain.",
    icon: MessageCircle,
  },
  {
    title: "Acheter ou vendre",
    text: "La marketplace connecte produits, boutique, panier, commandes et suivi.",
    icon: ShoppingCart,
  },
  {
    title: "Exécuter",
    text: "Les missions structurent candidatures, agenda, notifications et preuves d’avancement.",
    icon: ClipboardList,
  },
  {
    title: "Sécuriser",
    text: "Wallet, PIN, litiges, modération et admin gardent la plateforme contrôlée.",
    icon: ShieldCheck,
  },
];

const mobileCards = [
  { icon: Store, label: "Boutique", value: "validée" },
  { icon: Truck, label: "Commande", value: "en route" },
  { icon: BellRing, label: "Push", value: "reçu" },
  { icon: CircleDollarSign, label: "Wallet", value: "protégé" },
];

export function DemoSection() {
  return (
    <section
      id="marketplace"
      className="overflow-hidden bg-[#f8faf4] px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-9 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3b6934]">
              Expérience produit
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#191c18] sm:text-5xl">
              Une interface mobile-first pour acheter, vendre et collaborer.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-[#72796e]">
            Les parcours clés sont reliés : marketplace acheteur, espace vendeur,
            wallet, litiges, missions et notifications.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true }}
            className="relative min-h-[580px] overflow-hidden rounded-[2rem] border border-[#c2c9bb]/35 bg-[#11190f] shadow-2xl shadow-[#154212]/12"
          >
            <Image
              src="/images/iot.png"
              alt="Agriculture connectée"
              fill
              className="object-cover opacity-72"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,15,0.20),rgba(17,25,15,0.86))]" />

            <div className="absolute inset-x-4 top-4 rounded-3xl border border-white/12 bg-white/12 p-4 text-white backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#bcf0ae]">
                    Marketplace live
                  </p>
                  <h3 className="mt-1 text-xl font-black">
                    Produits, commandes et wallet
                  </h3>
                </div>
                <PackageCheck className="h-6 w-6 text-[#bcf0ae]" />
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-2">
              {mobileCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-3xl border border-white/14 bg-white/94 p-4 shadow-xl backdrop-blur"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3de] text-[#154212]">
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#72796e]">
                          {card.label}
                        </p>
                        <p className="text-lg font-black text-[#191c18]">
                          {card.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div id="missions" className="grid gap-3">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border border-[#c2c9bb]/35 bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#154212] text-[#bcf0ae]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f4ed] text-xs font-black text-[#154212]">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-black text-[#191c18]">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#72796e]">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-[#154212]/15 bg-[#154212] p-5 text-white shadow-xl shadow-[#154212]/18"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#bcf0ae]">
                    Résultat
                  </p>
                  <h3 className="mt-2 text-2xl font-black">
                    Moins de friction, plus d’action.
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    Chaque rôle voit les bons menus, les bonnes routes et les
                    bons boutons au bon moment.
                  </p>
                </div>
                <ArrowRight className="hidden h-8 w-8 text-[#bcf0ae] sm:block" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  ["Acheteur", "commande suivie"],
                  ["Vendeur", "stock maîtrisé"],
                  ["Admin", "contenu modéré"],
                  ["Mission", "candidat validé"],
                ].map(([role, value]) => (
                  <div key={role} className="rounded-2xl bg-white/10 p-3">
                    <CheckCircle2 className="h-4 w-4 text-[#bcf0ae]" />
                    <p className="mt-2 text-sm font-black">{role}</p>
                    <p className="text-xs text-white/62">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
