"use client";

import { useTranslation } from "@/app/i18n/LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation();
  const nextLanguage = language === "en" ? "es" : "en";

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      className="language-toggle"
      aria-label={t("language.switchTo")}
      title={t("language.switchTo")}
    >
      {nextLanguage.toUpperCase()}
    </button>
  );
}
