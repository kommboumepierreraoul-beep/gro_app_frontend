"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  Briefcase,
  GraduationCap,
  MapPin,
  Users,
  Calendar,
  Leaf,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Messagerie integree",
    description:
      "Communiquez en temps reel avec la communaute agricole et les experts.",
    color: "#154212",
    bg: "rgba(21,66,18,0.08)",
  },
  {
    icon: Briefcase,
    title: "Missions agricoles",
    description:
      "Trouvez des missions, partagez des offres et developpez votre activite.",
    color: "#2d5a27",
    bg: "rgba(45,90,39,0.08)",
  },
  {
    icon: GraduationCap,
    title: "Formations & apprentissages",
    description:
      "Accedez a des contenus educatifs pour perfectionner vos competences.",
    color: "#805533",
    bg: "rgba(128,85,51,0.08)",
  },
  {
    icon: MapPin,
    title: "Cartographie interactive",
    description:
      "Visualisez les projets agricoles et les ressources a proximite.",
    color: "#3b6934",
    bg: "rgba(59,105,52,0.08)",
  },
  {
    icon: Users,
    title: "Communautes locales",
    description:
      "Rejoignez des groupes d'entraide par region ou par activite.",
    color: "#854f0b",
    bg: "rgba(133,79,11,0.08)",
  },
  {
    icon: Calendar,
    title: "Agenda agricole",
    description:
      "Planifiez vos activites et suivez les evenements du secteur.",
    color: "#72796e",
    bg: "rgba(114,121,110,0.08)",
  },
];

const stats = [
  { value: "2500+", label: "Agriculteurs", icon: Leaf },
  { value: "150+", label: "Communautes", icon: Users },
  { value: "300+", label: "Missions", icon: Briefcase },
  { value: "95%", label: "Satisfaction", icon: TrendingUp },
];

export function FeaturesSection() {
  return (
    <section className="bg-[#f9faf2] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#3b6934]">
              Fonctionnalites
            </p>
            <h2 className="text-3xl font-bold text-[#191c18] sm:text-4xl">
              Tout ce dont vous avez besoin
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-[#72796e] sm:text-base">
            Une plateforme complete pour connecter la communaute agricole et
            faciliter vos projets, avec des espaces plus clairs et faciles a
            parcourir.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-[#c2c9bb]/30 bg-white/70 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#bcf0ae]/70 hover:shadow-lg hover:shadow-[#154212]/5"
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105"
                  style={{ background: feature.bg }}
                >
                  <Icon size={21} style={{ color: feature.color }} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-[#191c18]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#72796e]">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-[#c2c9bb]/30 bg-white/70 p-3 backdrop-blur-sm lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 rounded-xl bg-[#f3f4ed]/70 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#154212]/10">
                  <Icon className="h-4 w-4 text-[#154212]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold leading-none text-[#191c18]">
                    {stat.value}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#72796e]">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
