"use client";

import { useEffect } from "react";
import { useTranslation } from "@/app/i18n/LanguageProvider";

const whatsappNumber = "522225176319";
const contactEmail = "contacto.mexcodex@gmail.com";
const requiredFields = ["clientName", "businessName", "projectNeeds"];
const contactFields = ["email", "phone"];

type ContactSubmitActionsProps = {
  formId: string;
};

export function ContactSubmitActions({ formId }: ContactSubmitActionsProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const clearFieldError = (event: Event) => {
      const field = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (![...requiredFields, ...contactFields].includes(field.name) || !field.value.trim()) return;

      field.removeAttribute("aria-invalid");
    };

    form.addEventListener("input", clearFieldError);
    return () => form.removeEventListener("input", clearFieldError);
  }, [formId]);

  const getMessage = (requiresContact = false) => {
    const form = document.getElementById(formId) as HTMLFormElement | null;

    if (!form) {
      return null;
    }

    const missingFields = requiredFields
      .map((fieldName) => form.elements.namedItem(fieldName) as HTMLInputElement | HTMLTextAreaElement | null)
      .filter((field): field is HTMLInputElement | HTMLTextAreaElement => Boolean(field && !field.value.trim()));

    requiredFields.forEach((fieldName) => {
      const field = form.elements.namedItem(fieldName) as HTMLInputElement | HTMLTextAreaElement | null;
      field?.removeAttribute("aria-invalid");
    });

    const availableContactFields = contactFields
      .map((fieldName) => form.elements.namedItem(fieldName) as HTMLInputElement | null)
      .filter((field): field is HTMLInputElement => Boolean(field));
    const completedContactFields = availableContactFields.filter((field) => field.value.trim());
    const isContactMissing = requiresContact && completedContactFields.length === 0;

    missingFields.forEach((field) => field.setAttribute("aria-invalid", "true"));
    availableContactFields.forEach((field) => field.removeAttribute("aria-invalid"));

    if (isContactMissing) {
      availableContactFields.forEach((field) => field.setAttribute("aria-invalid", "true"));
      window.dispatchEvent(new Event("mexcodex-contact-required"));
    }

    if (missingFields.length > 0 || isContactMissing) {
      (missingFields[0] ?? availableContactFields[0])?.focus();
      return null;
    }

    const formData = new FormData(form);
    const clientName = String(formData.get("clientName") ?? "").trim();
    const businessName = String(formData.get("businessName") ?? "").trim();
    const projectNeeds = String(formData.get("projectNeeds") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    return {
      body: [
        t("contact.message.greeting"),
        "",
        `${t("contact.message.clientName")}: ${clientName}`,
        `${t("contact.message.businessName")}: ${businessName}`,
        `${t("contact.message.projectNeeds")}: ${projectNeeds}`,
        ...(email ? [`${t("contact.message.email")}: ${email}`] : []),
        ...(phone ? [`${t("contact.message.phone")}: ${phone}`] : []),
      ].join("\n"),
      businessName,
    };
  };

  const sendWhatsApp = () => {
    const message = getMessage();
    if (!message) return;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message.body)}`, "_blank", "noopener,noreferrer");
  };

  const sendEmail = () => {
    const message = getMessage(true);
    if (!message) return;

    const subject = encodeURIComponent(t("contact.emailSubject", { businessName: message.businessName }));
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${encodeURIComponent(message.body)}`;
  };

  return (
    <div className="contact-submit-actions">
      <button type="button" className="btn-submit btn-submit-whatsapp" onClick={sendWhatsApp}>
        {t("contact.submit.whatsapp")}
      </button>
      <button type="button" className="btn-submit btn-submit-email" onClick={sendEmail}>
        {t("contact.submit.email")}
      </button>
    </div>
  );
}
