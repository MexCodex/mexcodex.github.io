"use client";

import Link from "next/link";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useTranslation } from "@/app/i18n/LanguageProvider";
import terms from "@/app/data/terms.json";
import { translateLocalized } from "@/app/i18n/translations";

export function TermsContent() {
  const { language, t } = useTranslation();

  return (
    <div className="terms-page">
      <header className="terms-header">
        <Link href="/" className="nav-logo" aria-label={t("nav.logoAria")}>
          mex<span>codex</span>
        </Link>

        <div className="terms-controls" aria-label={t("notFound.preferencesAria")}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="terms-main">
        <header className="terms-hero">
          <div className="terms-hero-inner">
            <h1>{translateLocalized(terms.title, language)}</h1>
            <p>{translateLocalized(terms.intro, language)}</p>
            <div className="terms-meta">
              <span>{translateLocalized(terms.updated, language)}</span>
              <span>{translateLocalized(terms.readingTime, language)}</span>
            </div>
          </div>
        </header>

        <article className="terms-article">
          <div className="terms-body">
            {terms.sections.map((section, index) => (
              <section className="terms-section" key={section.id}>
                <span className="terms-section-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{translateLocalized(section.title, language)}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.es}>{translateLocalized(paragraph, language)}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>

      <footer className="terms-footer">
        <Link href="/">← {translateLocalized(terms.backHome, language)}</Link>
        <span>{t("footer.copy", { year: new Date().getFullYear() })}</span>
      </footer>
    </div>
  );
}
