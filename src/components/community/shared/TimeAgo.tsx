"use client";

import { useI18n } from "@/i18n/LanguageProvider";
import { formatDateTime, formatRelativeTime } from "@/lib/i18n-date";

interface TimeAgoProps {
  date: string;
  className?: string;
}

export function TimeAgo({ date, className = "" }: TimeAgoProps) {
  const { locale } = useI18n();
  const formatted = formatRelativeTime(date, locale);

  return (
    <time
      dateTime={date}
      className={`text-xs text-gray-400 ${className}`}
      title={formatDateTime(date, locale)}
    >
      {formatted}
    </time>
  );
}
