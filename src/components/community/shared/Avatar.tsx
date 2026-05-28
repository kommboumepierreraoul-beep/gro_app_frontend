"use client";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  firstname?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 96 };
const textSizes = {
  xs: "text-xs",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-2xl",
};

export function Avatar({
  src,
  firstname = "?",
  size = "md",
  className = "",
}: AvatarProps) {
  const px = sizes[size];
  const initial = firstname.charAt(0).toUpperCase();

  if (src) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
        style={{ width: px, height: px }}
      >
        <Image src={src} alt={firstname} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold ${textSizes[size]} ${className}`}
      style={{ width: px, height: px }}
    >
      {initial}
    </div>
  );
}
