"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  firstname?: string;
  lastname?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
  ringColor?: string;
}

const sizes = {
  xs: { px: 24, text: "text-xs", icon: 12 },
  sm: { px: 32, text: "text-xs", icon: 14 },
  md: { px: 40, text: "text-sm", icon: 16 },
  lg: { px: 56, text: "text-base", icon: 20 },
  xl: { px: 96, text: "text-2xl", icon: 32 },
};

const gradientColors = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-600",
  "from-purple-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-indigo-500 to-blue-600",
  "from-green-500 to-emerald-600",
  "from-sky-500 to-blue-600",
];

/**
 * Génère une couleur de gradient cohérente basée sur le prénom
 */
function getGradientByFirstname(firstname: string): string {
  const index = firstname.length % gradientColors.length;
  return gradientColors[index];
}

/**
 * Construit une URL d'avatar complète
 */
function buildAvatarUrl(avatarPath?: string | null): string | undefined {
  if (!avatarPath) return undefined;

  // URLs externes ou absolues
  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }

  // URLs relatives
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
  
  return `${apiUrl}${cleanPath}`;
}

export function Avatar({
  src,
  firstname = "?",
  lastname,
  size = "md",
  className = "",
  ring = false,
  ringColor = "emerald",
}: AvatarProps) {
  const [error, setError] = useState(false);
  const { px, text, icon } = sizes[size];
  
  const displayName = firstname || "?";
  const initial = displayName.charAt(0).toUpperCase();
  const gradient = getGradientByFirstname(displayName);
  
  // Construction de l'URL complète
  const fullUrl = buildAvatarUrl(src);
  
  // Anneau de surbrillance
  const ringClasses = ring ? `ring-2 ring-${ringColor}-500/50 ring-offset-2 ring-offset-white` : "";

  // Fallback sans image
  if (!fullUrl || error) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 text-white font-semibold shadow-sm transition-all duration-200 hover:scale-105 ${text} ${ringClasses} ${className}`}
        style={{ width: px, height: px }}
        title={lastname ? `${displayName} ${lastname}` : displayName}
      >
        {initial}
      </div>
    );
  }

  // Avatar avec image
  return (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 shadow-sm transition-all duration-200 hover:scale-105 ${ringClasses} ${className}`}
      style={{ width: px, height: px }}
      title={lastname ? `${displayName} ${lastname}` : displayName}
    >
      <Image
        src={fullUrl}
        alt={displayName}
        fill
        className="object-cover"
        unoptimized
        onError={() => setError(true)}
      />
    </div>
  );
}

// Version alternative avec icône (pour les avatars vides)
export function EmptyAvatar({
  size = "md",
  className = "",
  ring = false,
  ringColor = "emerald",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
  ringColor?: string;
}) {
  const { px, icon: iconSize } = sizes[size];
  const ringClasses = ring ? `ring-2 ring-${ringColor}-500/50 ring-offset-2 ring-offset-white` : "";
  
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400 ${ringClasses} ${className}`}
      style={{ width: px, height: px }}
    >
      <User size={iconSize} strokeWidth={1.5} />
    </div>
  );
}