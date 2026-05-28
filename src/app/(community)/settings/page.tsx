"use client";
import Link from "next/link";

const SETTINGS_LINKS = [
  {
    href: "/settings/profile",
    icon: "👤",
    title: "Profil",
    desc: "Photo, bio, headline, localisation",
  },
  {
    href: "/settings/account",
    icon: "🔐",
    title: "Compte",
    desc: "Email, mot de passe, sécurité",
  },
  {
    href: "/settings/notifications",
    icon: "🔔",
    title: "Notifications",
    desc: "Gérer vos préférences de notifications",
  },
  {
    href: "/settings/privacy",
    icon: "🛡️",
    title: "Confidentialité",
    desc: "Visibilité, blocage, données",
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Paramètres</h1>

      <div className="space-y-3">
        {SETTINGS_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-50 rounded-xl flex items-center justify-center text-2xl transition">
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                {item.title}
              </p>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
            <svg
              className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
