"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Map,
  Briefcase,
  PlusCircle,
  FileText,
  Users,
  Clock3,
  CheckCircle2,
  Settings,
} from "lucide-react";

const links = [
  {
    href: "/missions/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    href: "/missions/map",
    label: "Carte",
    icon: Map,
  },
  {
    href: "/missions/explore",
    label: "Explorer",
    icon: Briefcase,
  },
  {
    href: "/missions/create",
    label: "Publier",
    icon: PlusCircle,
  },
  {
    href: "/missions/my-missions",
    label: "Mes missions",
    icon: FileText,
  },
  {
    href: "/missions/applications",
    label: "Candidatures",
    icon: Users,
  },
  {
    href: "/missions/in-progress",
    label: "En cours",
    icon: Clock3,
  },
  {
    href: "/missions/completed",
    label: "Terminées",
    icon: CheckCircle2,
  },
  {
    href: "/missions/settings",
    label: "Paramètres",
    icon: Settings,
  },
];

export default function MissionNavbar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        fixed left-2 md:left-4
        top-1/2 -translate-y-1/2
        z-50
        flex
        flex-col gap-1 md:gap-2

        p-1.5 md:p-2
        md:ml-60

        rounded-2xl

        bg-white/10 md:bg-white/20
        backdrop-blur-md md:backdrop-blur-xl

        border border-white/20 md:border-white/30
        shadow-lg md:shadow-xl

        md:opacity-40
        hover:opacity-80 md:hover:opacity-100

        transition-all duration-300
      "
    >
      {links.map((item) => {
        const Icon = item.icon;

        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              group relative

              flex items-center justify-center

              w-10 h-10 md:w-11 md:h-11
              rounded-xl

              transition-all duration-200

              ${
                active
                  ? "bg-black text-white"
                  : "bg-white/20 md:bg-white/30 hover:bg-white/50 text-black"
              }

              opacity-70 md:opacity-100
            `}
          >
            <Icon size={18} />

            <span
              className="
                absolute left-full ml-3

                px-2 py-1
                rounded-md

                text-xs
                whitespace-nowrap

                bg-black text-white

                opacity-0
                group-hover:opacity-100

                pointer-events-none
                transition-opacity
              "
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}
