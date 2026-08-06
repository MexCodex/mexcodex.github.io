"use client";

import { useSyncExternalStore } from "react";
import { useTranslation } from "@/app/i18n/LanguageProvider";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("mexcodex-theme", theme);
  window.dispatchEvent(new Event("mexcodex-theme-change"));
}

export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("mexcodex-theme-change", onStoreChange);
      return () => window.removeEventListener("mexcodex-theme-change", onStoreChange);
    },
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    () => "dark",
  );

  const nextTheme = theme === "light" ? "dark" : "light";
  const themeLabel = nextTheme === "dark" ? t("theme.switchToDark") : t("theme.switchToLight");

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => {
        const activeTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
        applyTheme(activeTheme === "dark" ? "light" : "dark");
      }}
      aria-label={themeLabel}
      title={themeLabel}
    >
      <svg className="theme-icon theme-icon-sun" aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
      </svg>
      <svg className="theme-icon theme-icon-moon" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />
      </svg>
    </button>
  );
}
