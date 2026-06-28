"use client";

import {
  FileText,
  Users,
  UserPlus,
  Heart,
  Share2,
  MessageCircle,
  TrendingUp,
  Award,
  CheckCircle,
} from "lucide-react";

interface ProfileStatsProps {
  stats: {
    posts: number;
    followers: number;
    following: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
  className?: string;
}

export default function ProfileStats({
  stats,
  className = "",
}: ProfileStatsProps) {
  const statItems = [
    {
      label: "Publications",
      value: stats.posts || 0,
      icon: FileText,
      color: "#154212",
      bg: "rgba(21,66,18,0.08)",
    },
    {
      label: "Abonnés",
      value: stats.followers || 0,
      icon: Users,
      color: "#2d5a27",
      bg: "rgba(45,90,39,0.08)",
    },
    {
      label: "Abonnements",
      value: stats.following || 0,
      icon: UserPlus,
      color: "#805533",
      bg: "rgba(128,85,51,0.08)",
    },
    {
      label: "J'aime reçus",
      value: stats.likes || 0,
      icon: Heart,
      color: "#ba1a1a",
      bg: "rgba(186,26,26,0.08)",
    },
    {
      label: "Partages",
      value: stats.shares || 0,
      icon: Share2,
      color: "#3b6934",
      bg: "rgba(59,105,52,0.08)",
    },
    {
      label: "Commentaires",
      value: stats.comments || 0,
      icon: MessageCircle,
      color: "#72796e",
      bg: "rgba(114,121,110,0.08)",
    },
  ];

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/20 overflow-hidden hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-[#154212] rounded-full" />
          <h3 className="text-base font-bold text-[#191c18]">Statistiques</h3>
          <span className="ml-2 px-2 py-0.5 text-[9px] font-semibold bg-[#eaf3de] text-[#154212] rounded-full flex items-center gap-1">
            <TrendingUp size={10} strokeWidth={2.5} />
            Actif
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group p-3 rounded-xl bg-[#f9faf2] hover:bg-[#f3f4ed] transition-all duration-200 text-center hover:scale-[1.02] hover:shadow-sm"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-200 group-hover:scale-110"
                  style={{ background: item.bg }}
                >
                  <Icon
                    size={16}
                    strokeWidth={2}
                    style={{ color: item.color }}
                  />
                </div>
                <p className="text-lg font-bold text-[#191c18] group-hover:text-[#154212] transition-colors">
                  {item.value}
                </p>
                <p className="text-[10px] font-medium text-[#72796e] uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Badges d'activité */}
        <div className="mt-4 pt-4 border-t border-[#c2c9bb]/20 flex flex-wrap justify-center gap-3">
          <span className="px-3 py-1.5 text-xs font-medium bg-[#eaf3de] text-[#154212] rounded-full flex items-center gap-1.5">
            <Award size={12} strokeWidth={2} />
            Membre actif
          </span>
          <span className="px-3 py-1.5 text-xs font-medium bg-[#f3f4ed] text-[#42493e] rounded-full flex items-center gap-1.5">
            <CheckCircle size={12} strokeWidth={2} />
            Compte vérifié
          </span>
          {stats.posts > 10 && (
            <span className="px-3 py-1.5 text-xs font-medium bg-[#eaf3de] text-[#154212] rounded-full flex items-center gap-1.5">
              <TrendingUp size={12} strokeWidth={2} />
              Contributeur actif
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
