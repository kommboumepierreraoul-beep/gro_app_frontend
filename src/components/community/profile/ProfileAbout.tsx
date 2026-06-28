/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CommunityUser } from "@/types/community.types";
import {
  Briefcase,
  MapPin,
  Link2,
  Calendar,
  Mail,
  Phone,
  Building,
  Award,
  CheckCircle,
  Users,
  Star,
} from "lucide-react";

interface ProfileAboutProps {
  profile: CommunityUser;
}

export default function ProfileAbout({ profile }: ProfileAboutProps) {
  const aboutItems = [
    {
      icon: Briefcase,
      label: "Titre professionnel",
      value: (profile as any).headline || "Non renseigné",
      color: "#154212",
    },
    {
      icon: Building,
      label: "Entreprise / Organisation",
      value: (profile as any).company || "Non renseignée",
      color: "#2d5a27",
    },
    {
      icon: MapPin,
      label: "Localisation",
      value: (profile as any).location || "Non renseignée",
      color: "#805533",
    },
    {
      icon: Link2,
      label: "Site web",
      value: (profile as any).website || "Non renseigné",
      color: "#3b6934",
      isLink: true,
    },
    {
      icon: Mail,
      label: "Email",
      value: (profile as any).email || "Non renseigné",
      color: "#72796e",
      isLink: true,
    },
    {
      icon: Calendar,
      label: "Membre depuis",
      value: profile.created_at
        ? new Date(profile.created_at).toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })
        : "Non renseigné",
      color: "#72796e",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/20 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-[#154212] rounded-full" />
          <h3 className="text-base font-bold text-[#191c18]">À propos</h3>
          {(profile as any).is_verified && (
            <span className="ml-2 px-2 py-0.5 text-[9px] font-bold bg-[#eaf3de] text-[#154212] rounded-full flex items-center gap-1">
              <CheckCircle size={10} strokeWidth={2.5} />
              Vérifié
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {aboutItems.map((item, index) => {
            const Icon = item.icon;
            const isLink = item.isLink && item.value !== "Non renseigné";

            return (
              <div
                key={index}
                className="group p-3 rounded-xl bg-[#f9faf2] hover:bg-[#f3f4ed] transition-colors duration-200"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <Icon
                      size={14}
                      strokeWidth={2}
                      style={{ color: item.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#72796e]">
                      {item.label}
                    </p>
                    {isLink ? (
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#2d5a27] hover:text-[#154212] hover:underline transition-colors truncate block"
                      >
                        {item.value.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-[#191c18] truncate">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges supplémentaires */}
        <div className="mt-4 pt-4 border-t border-[#c2c9bb]/20">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Membre actif", icon: Award },
              { label: "Compte vérifié", icon: CheckCircle },
              { label: "Contributeur", icon: Star },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <span
                  key={badge.label}
                  className="px-3 py-1.5 text-xs font-medium bg-[#f3f4ed] text-[#42493e] rounded-full flex items-center gap-1.5"
                >
                  <Icon size={12} strokeWidth={2} className="text-[#72796e]" />
                  {badge.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
