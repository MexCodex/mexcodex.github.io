"use client";

import Link from "next/link";
import { HeroCanvas } from "@/app/components/HeroCanvas";
import { ContactMethods } from "@/app/components/ContactMethods";
import { ContactSubmitActions } from "@/app/components/ContactSubmitActions";
import { SiteInteractions } from "@/app/components/SiteInteractions";
import Navbar from "@/app/components/Navigation";
import navLinks from "@/app/data/nav_links.json";
import pricingModules from "@/app/data/pricing_modules.json";
import projects from "@/app/data/projects.json";
import services from "@/app/data/services.json";
import stats from "@/app/data/stats.json";
import { useTranslation } from "@/app/i18n/LanguageProvider";
import { translateLocalized, translateLocalizedArray } from "@/app/i18n/translations";

const serviceIcons = {
  web: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </>
  ),
  mobile: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </>
  ),
  "custom-software": (
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  ),
  integrations: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  support: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  updates: <path d="M18 20V10M12 20V4M6 20v-6" />,
};

const pricingFeatureKeys = [
  "pricing.feature.presentation",
  "pricing.feature.design",
  "pricing.feature.products",
  "pricing.feature.availability",
  "pricing.feature.subdomain",
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 14 14" stroke="currentColor" fill="none">
      <path d="M1 7h12M7 1l6 6-6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span className="feat-check" aria-hidden="true">
      <svg viewBox="0 0 9 9" strokeWidth="2" strokeLinecap="round">
        <polyline points="1,4.5 3.5,7 8,2" />
      </svg>
    </span>
  );
}

function ContactIcon({ type }: { type: "mail" | "phone" | "pin" }) {
  const paths = {
    mail: (
      <>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </>
    ),
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.81 19.79 19.79 0 0 1 0 1.14 2 2 0 0 1 2.18 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.91 8.91a16 16 0 0 0 6.08 6.08l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
    pin: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  };

  return (
    <span className="contact-item-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">{paths[type]}</svg>
    </span>
  );
}

export function HomeContent() {
  const { language, t } = useTranslation();
  const localizedNavLinks = navLinks.map((link) => ({
    ...link,
    label: translateLocalized(link.label, language),
  }));

  return (
    <>
      <SiteInteractions />

      <Navbar navLinks={localizedNavLinks} />

      <main>
        <section id="hero">
          <HeroCanvas />
          <div className="hero-content">
            <div className="hero-label">{t("hero.label")}</div>
            <h1 className="hero-title">
              {t("hero.titlePrefix")}
              <span className="accent">{t("hero.titleAccent")}</span>
            </h1>
            <p className="hero-subtitle">{t("hero.subtitle")}</p>
            <div className="hero-btns">
              <a href="#portfolio" className="btn-primary">
                {t("hero.primaryCta")}
              </a>
              <a href="#contact" className="btn-outline">
                {t("hero.secondaryCta")}
              </a>
            </div>
          </div>
          <div className="hero-scroll">
            <div className="scroll-line" />
            <span>{t("hero.scroll")}</span>
          </div>
        </section>

        <section id="about">
          <div className="section-tag">{t("about.tag")}</div>
          <h2 className="section-title">
            {t("about.titleLine1")}
            <br />
            {t("about.titleLine2Prefix")} <span className="highlight">{t("about.titleHighlight")}</span>
          </h2>
          <div className="divider" />
          <div className="about-grid">
            <div className="about-text reveal">
              <p>{t("about.paragraph1")}</p>
              <p>{t("about.paragraph2")}</p>
              <p>{t("about.paragraph3")}</p>
            </div>
            <div className="about-stats reveal reveal-delay-2">
              {stats.map((stat) => {
                const label = translateLocalized(stat.label, language);

                return (
                  <div className="stat-card" key={stat.value}>
                    <div className="stat-num">{stat.value}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="portfolio">
          <div className="section-tag">{t("portfolio.tag")}</div>
          <h2 className="section-title">
            {t("portfolio.titleLine1")}
            <br />
            <span className="highlight">{t("portfolio.titleHighlight")}</span> {t("portfolio.titleSuffix")}
          </h2>
          <div className="divider" />
          <div className="portfolio-grid">
            {projects.map((project, index) => {
              const title = translateLocalized(project.title, language);

              return (
                <article className={`project-card reveal reveal-delay-${Math.min(index, 3)}`} key={project.gradient}>
                  <div className="project-preview" style={{ background: project.gradient }}>
                    <span>{translateLocalized(project.kind, language)}</span>
                  </div>
                  <div className="project-content">
                    <div className="project-topline">
                      <h3>{title}</h3>
                    </div>
                    <p className="project-summary">{translateLocalized(project.summary, language)}</p>
                    <ul className="project-list">
                      {translateLocalizedArray(project.points, language).map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <div className="tag-row">
                      {project.tags.map((tag) => (
                        <span className="tag-pill" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="project-links">
                      <a href={project.ctaHref} target="_blank" className="btn-project">
                        {t("portfolio.projectCta")}
                        <ArrowIcon />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="pricing">
          <div className="section-tag">{t("pricing.tag")}</div>
          <h2 className="section-title">
            {t("pricing.titlePrefix")} <span className="highlight">{t("pricing.titleHighlight")}</span>
          </h2>
          <div className="divider" />
          <div className="pricing-grid">
            <div className="pricing-card reveal reveal-delay-0  featured" key="Pro">
              <div className="featured-badge">{t("pricing.badge")}</div>
              <div className="plan-name">{t("pricing.planName")}</div>
              <div className="plan-price">
                <sup>$</sup>
                349
              </div>
              <div className="plan-period">{t("pricing.period")}</div>
              <ul className="plan-features">
                {pricingFeatureKeys.map((featureKey) => (
                  <li key={featureKey}>
                    <CheckIcon />
                    {t(featureKey)}
                  </li>
                ))}
              </ul>
              <button className="btn-plan btn-plan-solid" type="button">
                {t("pricing.quoteCta")}
              </button>
            </div>

            <div className="pricing-details reveal reveal-delay-1">
              <div className="pricing-details-copy">
                <span className="pricing-details-kicker">{t("pricing.detailsKicker")}</span>
                <h3>{t("pricing.detailsTitle")}</h3>
                <p>{t("pricing.detailsParagraph1")}</p>
                <p>{t("pricing.detailsParagraph2")}</p>
              </div>

              <div className="pricing-modules">
                {pricingModules.map((module) => (
                  <article className="pricing-module-card" key={module.id}>
                    <div>
                      <span className="pricing-module-tag">{translateLocalized(module.category, language)}</span>
                      <h4>{translateLocalized(module.title, language)}</h4>
                      <p>{translateLocalized(module.description, language)}</p>
                    </div>
                    {module.price === "?" ? (
                      <button
                        className="btn-project pricing-module-quote"
                        type="button"
                        onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                      >
                        {t("pricing.quoteCta")}
                      </button>
                    ) : (
                      <div className="pricing-module-price">
                        <span>+</span>${module.price}
                        <span>{t("pricing.moduleMonthlySuffix")}</span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="services">
          <div className="section-tag">{t("services.tag")}</div>
          <h2 className="section-title">
            {t("services.titleLine1")}
            <br />
            {t("services.titleLine2Prefix")} <span className="highlight">{t("services.titleHighlight")}</span>
          </h2>
          <div className="divider" />
          <div className="services-grid">
            {services.map((service, index) => {
              const serviceName = translateLocalized(service.name, language);

              return (
                <div className={`service-card reveal reveal-delay-${Math.min(index, 3)}`} key={service.icon}>
                  <div className="service-icon">
                    <svg viewBox="0 0 24 24">{serviceIcons[service.icon as keyof typeof serviceIcons]}</svg>
                  </div>
                  <div className="service-name">{serviceName}</div>
                  <p className="service-desc">{translateLocalized(service.description, language)}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer id="contact">
        <div className="contact-grid">
          <div className="contact-left">
            <div className="section-tag">{t("contact.tag")}</div>
            <h2 className="section-title">
              {t("contact.titleLine1")}
              <br />
              <span className="highlight">{t("contact.titleHighlight")}</span> {t("contact.titleSuffix")}
            </h2>
            <div className="divider" />
            <p className="contact-desc">{t("contact.description")}</p>
            <p className="contact-desc-tyc">
              <Link href="/terminos-y-condiciones">{t("contact.terms")}</Link>
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <ContactIcon type="mail" />
                contacto.mexcodex@gmail.com
              </div>
              <div className="contact-item">
                <ContactIcon type="phone" />
                <a
                  href={`https://wa.me/522225176319?text=${encodeURIComponent(t("contact.whatsappDefaultMessage"))}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  +52 (222) 517-6319
                </a>
              </div>
              <div className="contact-item">
                <ContactIcon type="pin" />
                {t("contact.location")}
              </div>
            </div>
          </div>

          <form id="contact-form" className="contact-form" noValidate>
            <div className="form-row">
              <div className="form-group" data-required-message={t("contact.form.required")}>
                <label className="form-label" htmlFor="name">
                  {t("contact.form.nameLabel")}
                </label>
                <input
                  id="name"
                  name="clientName"
                  type="text"
                  className="form-input"
                  placeholder={t("contact.form.namePlaceholder")}
                  required
                />
              </div>
              <div className="form-group" data-required-message={t("contact.form.required")}>
                <label className="form-label" htmlFor="company">
                  {t("contact.form.businessLabel")}
                </label>
                <input
                  id="company"
                  name="businessName"
                  type="text"
                  className="form-input"
                  placeholder={t("contact.form.businessPlaceholder")}
                  required
                />
              </div>
            </div>
            <input className="contact-honeypot" name="website" type="text" tabIndex={-1} autoComplete="off" />
            <ContactMethods />
            <div className="form-group" data-required-message={t("contact.form.required")}>
              <label className="form-label" htmlFor="message">
                {t("contact.form.messageLabel")}
              </label>
              <textarea
                id="message"
                name="projectNeeds"
                className="form-textarea"
                placeholder={t("contact.form.messagePlaceholder")}
                required
              />
            </div>
            <ContactSubmitActions formId="contact-form" />
          </form>
        </div>

        <div className="footer-bar">
          <div className="footer-logo">
            mex<span>codex</span>
          </div>
          <div className="footer-meta">
            <Link href="/terminos-y-condiciones" className="footer-terms-link">
              {t("footer.terms")}
            </Link>
            <p className="footer-copy">{t("footer.copy", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
