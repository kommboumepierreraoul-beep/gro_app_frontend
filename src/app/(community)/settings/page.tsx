"use client";
import Link from "next/link";
import { User, Lock, Bell, Shield, ChevronRight, Settings } from "lucide-react";

const SETTINGS_LINKS = [
  {
    href: "/settings/profile",
    icon: User,
    title: "Profil",
    desc: "Photo, bio, headline, localisation",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    hoverBg: "group-hover:bg-emerald-100",
  },
  {
    href: "/settings/account",
    icon: Lock,
    title: "Compte",
    desc: "Email, mot de passe, sécurité",
    color: "text-blue-600",
    bg: "bg-blue-50",
    hoverBg: "group-hover:bg-blue-100",
  },
  {
    href: "/settings/notifications",
    icon: Bell,
    title: "Notifications",
    desc: "Gérer vos préférences de notifications",
    color: "text-amber-600",
    bg: "bg-amber-50",
    hoverBg: "group-hover:bg-amber-100",
  },
  {
    href: "/settings/privacy",
    icon: Shield,
    title: "Confidentialité",
    desc: "Visibilité, blocage, données",
    color: "text-purple-600",
    bg: "bg-purple-50",
    hoverBg: "group-hover:bg-purple-100",
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#154212]/10 flex items-center justify-center">
            <Settings size={20} className="text-[#154212]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#191c18]">
            Paramètres
          </h1>
        </div>
        <p className="text-sm text-[#72796e] ml-13 sm:ml-13">
          Gérez vos préférences et informations personnelles
        </p>
      </div>

      {/* Liste des paramètres */}
      <div className="space-y-3 sm:space-y-4">
        {SETTINGS_LINKS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="
                flex items-center gap-4 
                bg-white rounded-xl sm:rounded-2xl 
                p-3 sm:p-4 
                shadow-sm border border-[#c2c9bb]/30 
                hover:shadow-md hover:border-[#c2c9bb]/50 
                transition-all duration-200 group
              "
            >
              {/* Icône */}
              <div
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 
                  ${item.bg} ${item.hoverBg}
                  rounded-xl sm:rounded-2xl 
                  flex items-center justify-center 
                  transition-colors
                `}
              >
                <Icon size={18} className={`sm:w-5 sm:h-5 ${item.color}`} />
              </div>

              {/* Texte */}
              <div className="flex-1">
                <p className="font-semibold text-[#191c18] group-hover:text-[#154212] transition-colors text-sm sm:text-base">
                  {item.title}
                </p>
                <p className="text-xs sm:text-sm text-[#72796e] mt-0.5">
                  {item.desc}
                </p>
              </div>

              {/* Flèche */}
              <ChevronRight
                size={16}
                className="text-[#c2c9bb] group-hover:text-[#154212] transition-colors sm:w-5 sm:h-5"
              />
            </Link>
          );
        })}
      </div>

      {/* Footer informatif */}
      <div className="mt-8 p-4 bg-[#f3f4ed] rounded-xl border border-[#c2c9bb]/20">
        <p className="text-xs text-[#72796e] text-center">
          Vos paramètres sont sauvegardés automatiquement
        </p>
      </div>
    </div>
  );
}
