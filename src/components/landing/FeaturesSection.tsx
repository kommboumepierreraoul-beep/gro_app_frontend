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
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Messagerie intégrée",
    description: "Communiquez en temps réel avec la communauté agricole et les experts.",
    color: "#154212",
    bg: "rgba(21,66,18,0.08)",
  },
  {
    icon: Briefcase,
    title: "Missions agricoles",
    description: "Trouvez des missions, partagez des offres et développez votre activité.",
    color: "#2d5a27",
    bg: "rgba(45,90,39,0.08)",
  },
  {
    icon: GraduationCap,
    title: "Formations & apprentissages",
    description: "Accédez à des contenus éducatifs pour perfectionner vos compétences.",
    color: "#805533",
    bg: "rgba(128,85,51,0.08)",
  },
  {
    icon: MapPin,
    title: "Cartographie interactive",
    description: "Visualisez les projets agricoles et les ressources à proximité.",
    color: "#3b6934",
    bg: "rgba(59,105,52,0.08)",
  },
  {
    icon: Users,
    title: "Communautés locales",
    description: "Rejoignez des groupes d'entraide par région ou par activité.",
    color: "#854f0b",
    bg: "rgba(133,79,11,0.08)",
  },
  {
    icon: Calendar,
    title: "Agenda agricole",
    description: "Planifiez vos activités et suivez les événements du secteur.",
    color: "#72796e",
    bg: "rgba(114,121,110,0.08)",
  },
];

const stats = [
  { value: "2500+", label: "Agriculteurs", icon: Leaf },
  { value: "150+", label: "Communautés", icon: Users },
  { value: "300+", label: "Missions", icon: Briefcase },
  { value: "95%", label: "Satisfaction", icon: TrendingUp },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[#3b6934] text-xs tracking-widest uppercase font-semibold mb-2">
            Fonctionnalités
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191c18] mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-[#72796e] max-w-2xl mx-auto">
            Une plateforme complète pour connecter la communauté agricole et
            faciliter vos projets.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group p-6 rounded-2xl border border-[#c2c9bb]/20 hover:border-[#bcf0ae]/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.8)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: feature.bg }}
                >
                  <Icon size={22} style={{ color: feature.color }} strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-semibold text-[#191c18] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#72796e] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-[#c2c9bb]/20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon className="w-5 h-5 text-[#154212]" strokeWidth={1.8} />
                  <p className="text-3xl font-bold text-[#191c18]">{stat.value}</p>
                </div>
                <p className="text-sm text-[#72796e]">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}