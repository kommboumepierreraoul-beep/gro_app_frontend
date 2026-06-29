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

// Dégradés de vert plus variés
const gradientColors = [
  "from-green-400 to-emerald-600",
  "from-emerald-500 to-teal-600",
  "from-teal-500 to-green-600",
  "from-lime-500 to-green-600",
  "from-green-500 to-emerald-700",
  "from-emerald-600 to-green-500",
  "from-green-600 to-teal-500",
  "from-teal-600 to-emerald-500",
  "from-green-500 to-lime-600",
  "from-emerald-500 to-green-600",
  "from-green-400 to-emerald-500",
  "from-teal-400 to-green-500",
  "from-lime-400 to-emerald-500",
  "from-green-600 to-emerald-600",
  "from-emerald-700 to-teal-600",
];

// Couleurs de fond alternatives pour les avatars sans image
const solidColors = [
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-lime-600",
  "bg-green-600",
  "bg-emerald-600",
  "bg-teal-600",
  "bg-green-700",
];

/**
 * Génère une couleur de gradient cohérente basée sur le prénom
 */
function getGradientByFirstname(firstname: string): string {
  const index = firstname.length % gradientColors.length;
  return gradientColors[index];
}

/**
 * Génère une couleur unie cohérente basée sur le prénom
 */
function getSolidColorByFirstname(firstname: string): string {
  const index = firstname.length % solidColors.length;
  return solidColors[index];
}

/**
 * Construit une URL d'avatar complète
 */
function buildAvatarUrl(avatarPath?: string | null): string | undefined {
  if (!avatarPath) return undefined;

  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }

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
  const solidColor = getSolidColorByFirstname(displayName);

  const fullUrl = buildAvatarUrl(src);
  const ringClasses = ring
    ? `ring-2 ring-${ringColor}-500/50 ring-offset-2 ring-offset-white`
    : "";

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

// Version alternative avec icône
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
  const ringClasses = ring
    ? `ring-2 ring-${ringColor}-500/50 ring-offset-2 ring-offset-white`
    : "";

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center flex-shrink-0 text-green-600 ${ringClasses} ${className}`}
      style={{ width: px, height: px }}
    >
      <User size={iconSize} strokeWidth={1.5} />
    </div>
  );
}
