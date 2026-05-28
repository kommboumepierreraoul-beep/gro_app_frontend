"use client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface TimeAgoProps {
  date: string;
  className?: string;
}

export function TimeAgo({ date, className = "" }: TimeAgoProps) {
  const formatted = formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <time
      dateTime={date}
      className={`text-xs text-gray-400 ${className}`}
      title={date}
    >
      {formatted}
    </time>
  );
}
