"use client";

interface NotificationBadgeProps {
  count: number;
}

export default function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className="absolute top-0 right-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-bold px-1 border-2"
      style={{
        background: "#ba1a1a",
        color: "#ffffff",
        borderColor: "#f9faf2",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
