import { MissionStatus } from "@/lib/missions/types";

const STATUS_CONFIG: Record<MissionStatus, { label: string; classes: string }> =
  {
    draft: { label: "Brouillon", classes: "bg-[#e2e3dc] text-[#42493e]" },
    published: { label: "Publiée", classes: "bg-[#eaf3de] text-[#154212]" },
    filled: { label: "Pourvue", classes: "bg-blue-50 text-blue-700" },
    in_progress: { label: "En cours", classes: "bg-amber-50 text-amber-700" },
    completed: { label: "Terminée", classes: "bg-[#f3f4ed] text-[#72796e]" },
    archived: { label: "Archivée", classes: "bg-[#f3f4ed] text-[#72796e]" },
    suspended: { label: "Suspendue", classes: "bg-orange-50 text-orange-700" },
    cancelled: { label: "Annulée", classes: "bg-red-50 text-red-600" },
  };

interface Props {
  status: MissionStatus;
  size?: "xs" | "sm";
}

export default function MissionStatusBadge({ status, size = "sm" }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const sizeClass =
    size === "xs" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1";
  return (
    <span
      className={`${config.classes} ${sizeClass} font-bold uppercase tracking-wide rounded-full`}
    >
      {config.label}
    </span>
  );
}
