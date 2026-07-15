"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  LockKeyhole,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Star,
  Users,
} from "lucide-react";

const advantages = [
  {
    icon: Smartphone,
    title: "Responsive réel",
    text: "Les vues communauté, marketplace, missions, messagerie et wallet sont pensées pour téléphone et desktop.",
  },
  {
    icon: LockKeyhole,
    title: "Actions sensibles protégées",
    text: "PIN wallet, solde masqué, modals de confirmation, toasts d’erreur et flux de dépôt clarifié.",
  },
  {
    icon: ShieldAlert,
    title: "Modération complète",
    text: "Files de contenu, audit, utilisateurs, vendeurs, litiges et transactions pour garder la plateforme saine.",
  },
  {
    icon: Bot,
    title: "IA intégrée",
    text: "Un espace IA vient compléter les parcours opérationnels sans sortir de l’application.",
  },
];

const proof = [
  { label: "Rôles couverts", value: "4", detail: "user, vendeur, admin, mission" },
  { label: "Espaces clés", value: "8+", detail: "communauté, marché, wallet, IA..." },
  { label: "Navigation", value: "mobile", detail: "menus adaptés par contexte" },
];

export function TestimonialsSection() {
  return (
    <section id="trust" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-[#c2c9bb]/35 bg-[#f8faf4] p-6 shadow-sm sm:p-8"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#154212] text-[#bcf0ae]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#3b6934]">
              Atouts produit
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#191c18] sm:text-5xl">
              Une app plus robuste qu’une simple vitrine.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#72796e]">
              AgriPulse ne présente pas seulement des pages : l’app gère des
              accès par rôle, des paiements, des boutiques, des conversations,
              des litiges et une administration de contenu.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {proof.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#c2c9bb]/35 bg-white p-4"
                >
                  <p className="text-3xl font-black text-[#154212]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm font-black text-[#191c18]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#72796e]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <motion.article
                  key={advantage.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border border-[#c2c9bb]/35 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3f4ed] text-[#154212]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-[#3b6934]" />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-[#191c18]">
                    {advantage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#72796e]">
                    {advantage.text}
                  </p>
                </motion.article>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-[#c2c9bb]/35 bg-[#111827] p-5 text-white shadow-xl sm:col-span-2"
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_0.9fr] sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="mt-4 text-xl font-black">
                    Une expérience pensée pour être utilisée tous les jours.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/64">
                    Moins de pages isolées, plus de parcours cohérents entre
                    communauté, commerce, missions et administration.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[Users, BarChart3, Radio].map((Icon, index) => (
                    <div
                      key={index}
                      className="flex aspect-square items-center justify-center rounded-2xl bg-white/10"
                    >
                      <Icon className="h-6 w-6 text-[#bcf0ae]" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
