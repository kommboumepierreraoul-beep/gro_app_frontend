/* eslint-disable react/no-unescaped-entities */
import { Plus } from "lucide-react";

interface Props {
  onCreateClick: () => void;
}

export default function EmptyMissions({ onCreateClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-[#eaf3de] rounded-full flex items-center justify-center mb-6">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#154212"
          strokeWidth="1.5"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      </div>
      <h3 className="font-[Plus_Jakarta_Sans] text-xl font-semibold text-[#191c18] mb-2">
        Aucune mission pour l'instant
      </h3>
      <p className="text-[#42493e] text-sm max-w-sm mb-6">
        Soyez le premier à publier une mission dans votre communauté !
      </p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 bg-[#154212] text-white font-semibold text-xs tracking-widest uppercase py-3 px-6 rounded-xl shadow-lg hover:bg-[#2d5a27] hover:shadow-xl transition-all active:scale-95"
      >
        <Plus size={16} /> Publier une mission
      </button>
    </div>
  );
}
