"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CreditCard,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Marketplace", href: "#marketplace" },
  { label: "Missions", href: "#missions" },
  { label: "Sécurité", href: "#trust" },
];

const liveStats = [
  { label: "Communauté", value: "active", icon: Users },
  { label: "Wallet", value: "protégé", icon: CreditCard },
  { label: "Vendeurs", value: "pilotés", icon: Store },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f8faf4] text-[#191c18]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(234,243,222,0.92),rgba(248,250,244,0.98)_42%,rgba(255,255,255,1))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(188,240,174,0.38),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(255,184,108,0.18),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.10),transparent_30%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1240px] flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <nav className="sticky top-3 z-30 flex items-center justify-between rounded-2xl border border-[#c2c9bb]/40 bg-white/82 px-3 py-2 shadow-[0_18px_50px_rgba(21,66,18,0.08)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#154212] shadow-sm">
              <Image
                src="/logo_agri_pulse.png"
                alt="AgriPulse"
                width={30}
                height={30}
                priority
              />
            </span>
            <span className="text-base font-black tracking-tight text-[#191c18]">
              AgriPulse
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-xl bg-[#f3f4ed]/80 p-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#42493e] transition hover:bg-white hover:text-[#154212] hover:shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl px-3 py-2 text-sm font-bold text-[#42493e] transition hover:bg-[#f3f4ed] sm:inline-flex"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#154212] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-[#154212]/15 transition hover:bg-[#2d5a27] active:scale-[0.98]"
            >
              Démarrer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c2c9bb]/60 bg-white/80 px-3.5 py-2 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#a16207]" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[#3b6934]">
                Réseau agricole, marché et opérations en une app
              </span>
            </div>

            <h1 className="max-w-[720px] text-4xl font-black leading-[1.02] tracking-tight text-[#191c18] sm:text-6xl lg:text-[72px]">
              Le cockpit moderne de l’écosystème agricole.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-[#42493e] sm:text-lg">
              AgriPulse réunit communauté, marketplace, missions, messagerie,
              wallet, IA et administration dans une expérience fluide pour les
              producteurs, acheteurs, vendeurs et équipes de modération.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#154212] px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-[#154212]/18 transition hover:bg-[#2d5a27] active:scale-[0.98]"
              >
                Créer mon compte
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#c2c9bb]/60 bg-white/80 px-5 py-3.5 text-sm font-black text-[#191c18] shadow-sm transition hover:border-[#154212]/30 hover:bg-[#f3f4ed]"
              >
                Accéder à l’espace
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-2">
              {liveStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#c2c9bb]/40 bg-white/76 p-3 shadow-sm backdrop-blur"
                  >
                    <Icon className="h-4 w-4 text-[#154212]" />
                    <p className="mt-3 text-xs font-bold text-[#72796e]">
                      {stat.label}
                    </p>
                    <p className="text-sm font-black text-[#191c18]">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_28px_90px_rgba(21,66,18,0.16)]">
              <div className="relative h-[520px] overflow-hidden bg-[#11190f] sm:h-[620px]">
                <Image
                  src="/images/cover.png"
                  alt="Agriculture connectée avec AgriPulse"
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 52vw, 100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,15,0.92)_0%,rgba(17,25,15,0.62)_42%,rgba(17,25,15,0.10)_100%)]" />

                <div className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-2xl border border-white/12 bg-white/12 p-3 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bcf0ae] text-[#154212]">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">
                        Tableau de bord live
                      </p>
                      <p className="text-xs text-white/62">
                        Activité communauté, ventes et missions
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/18 px-3 py-1 text-xs font-black text-[#bcf0ae]">
                    En ligne
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 grid gap-3 lg:grid-cols-[1fr_0.8fr]">
                  <div className="rounded-3xl border border-white/12 bg-white/94 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#3b6934]">
                          Flux communautaire
                        </p>
                        <h2 className="mt-1 text-lg font-black text-[#191c18]">
                          Diagnostic terrain partagé
                        </h2>
                      </div>
                      <MessageCircle className="h-5 w-5 text-[#154212]" />
                    </div>
                    <div className="space-y-2">
                      {[
                        ["Maladie détectée sur maïs", "12 réponses d’experts"],
                        ["Nouvelle mission récolte", "3 candidatures"],
                        ["Boutique vérifiée", "Paiement wallet sécurisé"],
                      ].map(([title, meta]) => (
                        <div
                          key={title}
                          className="flex items-center gap-3 rounded-2xl bg-[#f8faf4] p-3"
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-[#154212]" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black text-[#191c18]">
                              {title}
                            </p>
                            <p className="text-xs text-[#72796e]">{meta}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {[
                      {
                        icon: PackageCheck,
                        label: "Commandes",
                        value: "suivies",
                        tone: "bg-amber-100 text-amber-700",
                      },
                      {
                        icon: Bell,
                        label: "Push",
                        value: "instantané",
                        tone: "bg-blue-100 text-blue-700",
                      },
                      {
                        icon: ShieldCheck,
                        label: "Admin",
                        value: "modéré",
                        tone: "bg-slate-100 text-slate-700",
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/16 bg-white/90 p-3 shadow-xl backdrop-blur-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-xs font-bold text-[#72796e]">
                                {item.label}
                              </p>
                              <p className="text-sm font-black text-[#191c18]">
                                {item.value}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="absolute right-5 top-24 hidden w-64 rounded-3xl border border-white/15 bg-white/92 p-4 shadow-2xl backdrop-blur-xl sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#154212] text-[#bcf0ae]">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#191c18]">
                        IA agricole
                      </p>
                      <p className="text-xs text-[#72796e]">
                        Conseils, recherche et aide contextuelle
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute left-5 top-28 hidden rounded-2xl border border-white/15 bg-[#154212]/88 px-4 py-3 text-white shadow-2xl backdrop-blur-xl md:block">
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-[#bcf0ae]" />
                    <span className="text-sm font-black">Mission publiée</span>
                  </div>
                  <p className="mt-1 text-xs text-white/70">
                    Candidatures et agenda synchronisés
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
