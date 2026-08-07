"use client";

import Link from "next/link";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useTranslation } from "@/app/i18n/LanguageProvider";

export function NotFoundContent() {
  const { t } = useTranslation();

  return (
    <main className="not-found-page">
      <header className="not-found-header">
        <Link href="/" className="nav-logo" aria-label={t("nav.logoAria")}>
          mex<span>codex</span>
        </Link>

        <div className="not-found-controls" aria-label={t("notFound.preferencesAria")}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="not-found-grid" aria-hidden="true" />
      <div className="not-found-glow" aria-hidden="true" />

      <section className="not-found-content">
        <div className="not-found-code" aria-hidden="true">
          <span>4</span>
          <span className="not-found-zero">
            <span className="not-found-zero-mark">&lt;/&gt;</span>
          </span>
          <span>4</span>
        </div>

        <p className="not-found-kicker">
          <span />
          {t("notFound.kicker")}
        </p>
        <h1>{t("notFound.title")}</h1>
        <p className="not-found-description">{t("notFound.description")}</p>
      </section>

      <p className="not-found-status" aria-hidden="true">
        <span>ERR_PAGE_NOT_FOUND</span>
        <span>MXC—404</span>
      </p>
    </main>
  );
}
