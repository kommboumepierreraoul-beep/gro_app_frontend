// components/announcements/AnnouncementCategoryBadge.tsx
import {
  Briefcase,
  CalendarDays,
  Newspaper,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";

const categoryConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bg: string }
> = {
  job: {
    icon: <Briefcase className="w-4 h-4" />,
    label: "Offre d'emploi",
    color: "#2d5a27",
    bg: "rgba(45,90,39,0.12)",
  },
  event: {
    icon: <CalendarDays className="w-4 h-4" />,
    label: "Événement",
    color: "#805533",
    bg: "rgba(128,85,51,0.12)",
  },
  news: {
    icon: <Newspaper className="w-4 h-4" />,
    label: "Actualité",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.12)",
  },
  training: {
    icon: <GraduationCap className="w-4 h-4" />,
    label: "Formation",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.12)",
  },
  other: {
    icon: <MoreHorizontal className="w-4 h-4" />,
    label: "Autre",
    color: "#72796e",
    bg: "rgba(114,121,110,0.12)",
  },
};

interface AnnouncementCategoryBadgeProps {
  category: string;
}

export function AnnouncementCategoryBadge({
  category,
}: AnnouncementCategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig.other;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
      style={{ background: config.bg }}
    >
      <span style={{ color: config.color }}>{config.icon}</span>
      <span className="text-xs font-semibold" style={{ color: config.color }}>
        {config.label}
      </span>
    </div>
  );
}
