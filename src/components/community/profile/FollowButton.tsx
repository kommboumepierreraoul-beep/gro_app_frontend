"use client";
import { useFollow } from "@/hooks/community/useFollow";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export function FollowButton({
  userId,
  isFollowing,
  size = "md",
  variant = "default",
}: FollowButtonProps) {
  const { toggle, isLoading } = useFollow(userId, false);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  };

  const variantClasses = {
    default: isFollowing
      ? "bg-[#f3f4ed] text-[#42493e] hover:bg-[#e7e9e1] border border-[#c2c9bb]/40"
      : "bg-[#154212] text-[#bcf0ae] hover:bg-[#2d5a27] shadow-sm hover:shadow-md",
    outline: isFollowing
      ? "border-2 border-[#c2c9bb] text-[#42493e] hover:border-[#ba1a1a] hover:text-[#ba1a1a] hover:bg-[#fee2e2]/10"
      : "border-2 border-[#154212] text-[#154212] hover:bg-[#154212] hover:text-[#bcf0ae] transition-all duration-200",
    ghost: isFollowing
      ? "text-[#42493e] hover:bg-[#f3f4ed] hover:text-[#ba1a1a]"
      : "text-[#154212] hover:bg-[rgba(21,66,18,0.06)] hover:text-[#2d5a27]",
  };

  const handleClick = () => {
    toggle.mutate();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-2
        rounded-xl font-semibold transition-all duration-200
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isFollowing ? "hover:scale-[1.02]" : "hover:scale-[1.02]"}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Chargement...</span>
        </>
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" strokeWidth={2} />
          <span>Abonné</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" strokeWidth={2} />
          <span>Suivre</span>
        </>
      )}
    </button>
  );
}
