"use client";

import { Languages } from "lucide-react";

import { useI18n } from "@/i18n/LanguageProvider";

type LanguageToggleProps = {
  compact?: boolean;
  className?: string;
};

export function LanguageToggle({
  compact = false,
  className = "",
}: LanguageToggleProps) {
  const { locale, toggleLocale, t } = useI18n();
  const nextLocale = locale === "fr" ? "en" : "fr";
  const title =
    nextLocale === "fr"
      ? t("common.switchToFrench")
      : t("common.switchToEnglish");

  return (
    <button
      type="button"
      onClick={toggleLocale}
      title={title}
      aria-label={title}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#c2c9bb]/50 bg-white/80 px-3 text-sm font-bold text-[#42493e] shadow-sm transition hover:bg-[#eaf3de] hover:text-[#154212] ${className}`}
    >
      <Languages className="h-4 w-4" />
      <span className={compact ? "sr-only" : ""}>
        {locale.toUpperCase()}
      </span>
    </button>
  );
}
