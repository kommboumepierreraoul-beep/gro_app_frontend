"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import {
  LayoutDashboard,
  Map,
  Briefcase,
  PlusCircle,
  FileText,
  Users,
  Settings,
  Calendar,
  HelpCircleIcon,
  Menu,
  ChevronRight,
  ChevronLeft,
  X,
  Bell,
} from "lucide-react";

const links = [
  {
    href: "/missions/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    color: "#2d5a27",
  },
  {
    href: "/missions/agenda",
    label: "Agenda",
    icon: Calendar,
    color: "#805533",
  },
  {
    href: "/missions/map",
    label: "Carte",
    icon: Map,
    color: "#7c3aed",
  },
  {
    href: "/missions/create",
    label: "Publier",
    icon: PlusCircle,
    color: "#2d5a27",
  },
  {
    href: "/missions/my-missions",
    label: "Mes missions",
    icon: FileText,
    color: "#805533",
  },
  {
    href: "/missions/applications",
    label: "Candidatures",
    icon: Users,
    color: "#7c3aed",
  },
  {
    href: "/missions/notification",
    label: "Notifications",
    icon: Bell,
    color: "#7c3aed",
  },
  {
    href: "/support/mission-support",
    label: "Support",
    icon: HelpCircleIcon,
  },
  {
    href: "/missions/settings",
    label: "Paramètres",
    icon: Settings,
    color: "#72796e",
  },
];

export default function MissionNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Détecter la taille d'écran
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Version mobile : bouton flottant en bas à droite
  if (isMobile) {
    return (
      <>
        {/* Bouton flottant "tirez-moi" en bas à droite */}
        <button
          ref={buttonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed right-0 top-[46%] z-[70] flex -translate-y-1/2 items-center gap-1 rounded-l-2xl border border-r-0 border-white/30 px-2.5 py-4 shadow-2xl backdrop-blur-md transition-all duration-200 hover:pr-3 active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, rgba(49,69,45,0.98) 0%, rgba(31,45,29,0.98) 100%)",
            boxShadow:
              "0 0 0 1px rgba(232,245,223,0.22), 0 12px 32px rgba(25,28,24,0.30), 0 0 28px rgba(188,240,174,0.32)",
            color: "white",
          }}
          aria-label={isMobileMenuOpen ? "Fermer le menu missions" : "Ouvrir le menu missions"}
        >
          {isMobileMenuOpen ? (
            <X size={20} strokeWidth={2} />
          ) : (
            <>
              <ChevronLeft size={24} strokeWidth={2.6} className="animate-pulse" />
              <Briefcase size={16} strokeWidth={2} />
            </>
          )}
        </button>

        {/* Overlay mobile */}
        <div
          className={`fixed inset-0 z-[60] transition-all duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
          }}
        />

        {/* Menu mobile - Drawer depuis le bas */}
        <div
          ref={menuRef}
          className={`fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{
            background: "rgba(249,250,242,0.98)",
            backdropFilter: "blur(20px)",
            maxHeight: "min(82vh, 680px)",
            borderTop: "1px solid rgba(194,201,187,0.35)",
          }}
        >
          {/* Poignée "tirez-moi" */}
          <div className="flex justify-center pb-1 pt-3">
            <div
              className="w-12 h-1 rounded-full"
              style={{ background: "#c2c9bb" }}
            />
          </div>

          {/* Header du drawer */}
          <div className="flex items-center justify-between border-b border-[rgba(194,201,187,0.25)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#31452d] flex items-center justify-center">
                <Briefcase size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#191c18]">Missions</h2>
            </div>
            <span className="text-xs text-[#72796e]">
              {links.length} sections
            </span>
          </div>

          {/* Navigation - Scrollable */}
          <div
            className="overflow-y-auto p-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            style={{ maxHeight: "calc(min(82vh, 680px) - 86px)" }}
          >
            <div className="space-y-1">
              {links.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3
                      px-3 py-3
                      rounded-xl
                      transition-all duration-200
                      group
                      ${
                        active
                          ? "bg-[#31452d] text-white shadow-md"
                          : "hover:bg-[rgba(49,69,45,0.08)] text-[#191c18]"
                      }
                    `}
                  >
                    <div
                      className={`
                        p-1.5 rounded-lg transition-all duration-200
                        ${active ? "bg-white/20" : "bg-[rgba(0,0,0,0.05)]"}
                      `}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        className={active ? "text-white" : "text-[#72796e]"}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>

                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                    )}
                  </Link>
                );
              })}
            </div>

          </div>
        </div>
      </>
    );
  }

  // Version tablette et desktop
  return (
    <>
      {/* Bouton hamburger pour tablette */}
      {isTablet && (
        <button
          ref={buttonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-20 right-4 z-50 flex items-center justify-center w-12 h-12 rounded-xl bg-white/95 backdrop-blur-md border border-white/30 shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {isMobileMenuOpen ? (
            <X size={20} className="text-[#191c18]" strokeWidth={1.8} />
          ) : (
            <Menu size={20} className="text-[#191c18]" strokeWidth={1.8} />
          )}
        </button>
      )}

      {/* Overlay tablette */}
      {isTablet && isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
          }}
        />
      )}

      {/* Menu tablette - Drawer depuis la droite */}
      {isTablet && (
        <div
          ref={menuRef}
          className={`fixed top-0 right-0 z-50 h-full w-80 shadow-2xl transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            background: "rgba(249,250,242,0.98)",
            backdropFilter: "blur(20px)",
            borderLeft: "1px solid rgba(194,201,187,0.2)",
          }}
        >
          {/* Header du drawer tablette */}
          <div className="flex items-center justify-between p-4 border-b border-[rgba(194,201,187,0.2)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#31452d] flex items-center justify-center">
                <Briefcase size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#191c18]">Missions</h2>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-all duration-200 active:scale-95"
            >
              <X size={20} className="text-[#72796e]" />
            </button>
          </div>

          {/* Navigation tablette */}
          <div className="p-3 overflow-y-auto h-[calc(100%-70px)]">
            <div className="space-y-1">
              {links.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3
                      px-3 py-2.5
                      rounded-xl
                      transition-all duration-200
                      group
                      ${
                        active
                          ? "bg-[#31452d] text-white shadow-md"
                          : "hover:bg-[rgba(49,69,45,0.08)] text-[#191c18]"
                      }
                    `}
                  >
                    <div
                      className={`
                        p-1.5 rounded-lg transition-all duration-200
                        ${active ? "bg-white/20" : "bg-[rgba(0,0,0,0.05)]"}
                      `}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        className={active ? "text-white" : "text-[#72796e]"}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>

                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Footer tablette */}
            <div className="mt-4 pt-3 border-t border-[rgba(194,201,187,0.2)]">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-[#72796e]">
                  {links.length} sections
                </span>
                <span className="text-xs text-[#72796e]">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu desktop - Version avec bouton "tirez-moi" à gauche */}
      {!isTablet && (
        <aside
          className={`
            hidden md:flex
            h-full
            flex-col
            transition-all duration-300
            ${isCollapsed ? "w-16" : "w-64"}
            relative
          `}
          style={{
            background: "rgba(249,250,242,0.95)",
            backdropFilter: "blur(12px)",
            borderRight: "1px solid rgba(194,201,187,0.2)",
          }}
        >
          {/* Header avec bouton collapse à gauche */}
          <div
            className={`
              flex items-center 
              ${isCollapsed ? "justify-center" : "justify-between"}
              px-2 py-3 
              border-b border-[rgba(194,201,187,0.2)]
            `}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#31452d] flex items-center justify-center">
                  <Briefcase size={14} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-[#191c18]">
                  Missions
                </span>
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
                flex items-center justify-center
                w-8 h-8
                rounded-lg
                transition-all duration-200
                hover:bg-[rgba(0,0,0,0.05)]
                active:scale-95
                ${isCollapsed ? "mx-auto" : ""}
              `}
              style={{ color: "#72796e" }}
              title={isCollapsed ? "Développer" : "Réduire"}
            >
              {isCollapsed ? (
                <ChevronRight size={18} strokeWidth={2} />
              ) : (
                <ChevronLeft size={18} strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Navigation desktop */}
          <div className="flex-1 space-y-0.5 py-2">
            {links.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative
                    flex items-center
                    ${isCollapsed ? "justify-center" : "justify-start gap-3 px-3"}
                    py-2.5
                    rounded-xl
                    transition-all duration-200
                    mx-1.5
                    ${
                      active
                        ? "bg-[#31452d] text-white shadow-md"
                        : "hover:bg-[rgba(49,69,45,0.08)] text-[#191c18]"
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className={`
                      ${active ? "text-white" : "text-[#72796e]"}
                      ${isCollapsed ? "" : "flex-shrink-0"}
                    `}
                  />

                  {!isCollapsed && (
                    <span className="text-sm font-medium flex-1 text-left">
                      {item.label}
                    </span>
                  )}

                  {active && !isCollapsed && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                  )}

                  {/* Tooltip desktop */}
                  {isCollapsed && (
                    <span
                      className="
                        absolute left-full ml-3
                        px-2.5 py-1.5
                        rounded-lg
                        text-xs
                        font-medium
                        whitespace-nowrap
                        bg-[#191c18] text-white
                        opacity-0 group-hover:opacity-100
                        pointer-events-none
                        transition-all duration-200
                        shadow-lg
                      "
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </aside>
      )}
    </>
  );
}
