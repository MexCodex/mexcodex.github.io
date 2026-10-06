"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/app/components/BrandLogo";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useTranslation } from "@/app/i18n/LanguageProvider";

type NavLink = {
  href: string;
  label: string;
};

type NavbarProps = {
  navLinks: NavLink[];
};

export default function Navbar({ navLinks }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`site-nav${isMenuOpen ? " site-nav-menu-open" : ""}`} aria-label={t("nav.aria")}>
      <a href="#" className="nav-logo" aria-label={t("nav.logoAria")} onClick={closeMenu}>
        <BrandLogo />
      </a>

      <button
        type="button"
        className="nav-menu-toggle"
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        aria-label={isMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      <button
        type="button"
        className="nav-menu-backdrop"
        aria-label={t("nav.closeMenu")}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={closeMenu}
      />

      <ul id="primary-navigation" className={`nav-links${isMenuOpen ? " nav-links-open" : ""}`}>
        {navLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href} onClick={closeMenu}>{link.label}</a>
          </li>
        ))}

        <li>
          <a href="#contact" className="nav-cta" onClick={closeMenu}>
            {t("nav.contact")}
          </a>
        </li>

        <li className="language-toggle-item">
          <LanguageToggle />
        </li>

        <li className="theme-toggle-item">
          <span className="theme-toggle-label">{t("nav.theme")}</span>
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
}
