import { formatDistanceToNow } from "date-fns";
import type { Locale } from "date-fns";
import { enUS, fr } from "date-fns/locale";

import type { AppLocale } from "@/i18n/translations";

const DATE_FNS_LOCALES = {
  fr,
  en: enUS,
} satisfies Record<AppLocale, Locale>;

export function getBrowserLocale(locale: AppLocale) {
  return locale === "en" ? "en-US" : "fr-FR";
}

export function getDateFnsLocale(locale: AppLocale) {
  return DATE_FNS_LOCALES[locale];
}

export function formatRelativeTime(
  dateValue: string | number | Date | null | undefined,
  locale: AppLocale,
) {
  if (!dateValue) {
    return locale === "en" ? "Unknown date" : "Date inconnue";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return locale === "en" ? "Unknown date" : "Date inconnue";
  }

  try {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: DATE_FNS_LOCALES[locale],
    });
  } catch {
    return locale === "en" ? "just now" : "a l'instant";
  }
}

export function formatDateTime(
  dateValue: string | number | Date | null | undefined,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleString(getBrowserLocale(locale), options);
}

export function formatDateOnly(
  dateValue: string | number | Date | null | undefined,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString(getBrowserLocale(locale), options);
}
