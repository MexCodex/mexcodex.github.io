"use client";

import { useEffect, useState } from "react";
import { getContactApiBaseUrl } from "@/app/config/contact";
import { useTranslation } from "@/app/i18n/LanguageProvider";

const whatsappNumber = "522225176319";
const requiredFields = ["clientName", "businessName", "projectNeeds"];
const contactFields = ["email", "phone"] as const;

type ContactType = (typeof contactFields)[number];

type ContactEntry = {
  type: ContactType;
  value: string;
};

type ContactPayload = {
  name: string;
  company: string;
  message: string;
  contacts: ContactEntry[];
  website: string | null;
};

type ContactSubmitActionsProps = {
  formId: string;
};

type ValidationResult =
  | {
      messageBody: string;
      payload: ContactPayload;
    }
  | null;

type BackendValidationDetail = {
  msg?: unknown;
};

function getFormField(form: HTMLFormElement, fieldName: string) {
  return form.elements.namedItem(fieldName) as HTMLInputElement | HTMLTextAreaElement | null;
}

function setFieldValidity(field: HTMLInputElement | HTMLTextAreaElement | null, isInvalid: boolean) {
  if (!field) return;
  if (isInvalid) {
    field.setAttribute("aria-invalid", "true");
    return;
  }

  field.removeAttribute("aria-invalid");
}

export function ContactSubmitActions({ formId }: ContactSubmitActionsProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const clearFieldError = (event: Event) => {
      const field = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (![...requiredFields, ...contactFields].includes(field.name) || !field.value.trim()) return;

      field.removeAttribute("aria-invalid");
      setSubmitError("");
    };

    form.addEventListener("input", clearFieldError);
    return () => form.removeEventListener("input", clearFieldError);
  }, [formId]);

  const getValidatedForm = (requiresContact: boolean): ValidationResult => {
    const form = document.getElementById(formId) as HTMLFormElement | null;

    if (!form) {
      setSubmitError(t("contact.submit.error"));
      return null;
    }

    const missingFields = requiredFields
      .map((fieldName) => getFormField(form, fieldName))
      .filter((field): field is HTMLInputElement | HTMLTextAreaElement => Boolean(field && !field.value.trim()));

    requiredFields.forEach((fieldName) => {
      const field = getFormField(form, fieldName);
      setFieldValidity(field, !field?.value.trim());
    });

    const availableContactFields = contactFields
      .map((fieldName) => getFormField(form, fieldName) as HTMLInputElement | null)
      .filter((field): field is HTMLInputElement => Boolean(field));
    const completedContactFields = availableContactFields.filter((field) => field.value.trim());
    const invalidContactFields = completedContactFields.filter((field) => {
      if (field.name === "phone") return field.value.trim().length < 3;
      return !field.validity.valid;
    });
    const isContactMissing = requiresContact && completedContactFields.length === 0;

    availableContactFields.forEach((field) => {
      const isInvalid =
        (isContactMissing && !field.value.trim()) ||
        (Boolean(field.value.trim()) && (field.name === "phone" ? field.value.trim().length < 3 : !field.validity.valid));

      setFieldValidity(field, isInvalid);
    });

    if (isContactMissing) {
      window.dispatchEvent(new Event("mexcodex-contact-required"));
    }

    if (missingFields.length > 0 || isContactMissing || invalidContactFields.length > 0) {
      setSubmitError(isContactMissing ? t("contact.methods.error") : t("contact.submit.validationError"));
      (missingFields[0] ?? invalidContactFields[0] ?? availableContactFields[0])?.focus();
      return null;
    }

    const formData = new FormData(form);
    const clientName = String(formData.get("clientName") ?? "").trim();
    const businessName = String(formData.get("businessName") ?? "").trim();
    const projectNeeds = String(formData.get("projectNeeds") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();
    const contacts = contactFields
      .map((fieldName) => {
        const value = String(formData.get(fieldName) ?? "").trim();
        return value ? { type: fieldName, value } : null;
      })
      .filter((contact): contact is ContactEntry => Boolean(contact));

    return {
      messageBody: [
        t("contact.message.greeting"),
        "",
        `${t("contact.message.clientName")}: ${clientName}`,
        `${t("contact.message.businessName")}: ${businessName}`,
        `${t("contact.message.projectNeeds")}: ${projectNeeds}`,
        ...contacts.map((contact) =>
          contact.type === "email"
            ? `${t("contact.message.email")}: ${contact.value}`
            : `${t("contact.message.phone")}: ${contact.value}`,
        ),
      ].join("\n"),
      payload: {
        name: clientName,
        company: businessName,
        message: projectNeeds,
        contacts,
        website: website || null,
      },
    };
  };

  const handleSubmitError = async (response: Response) => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    let errorMessage = response.status === 422 ? t("contact.submit.validationError") : t("contact.submit.error");

    if (response.status === 422) {
      try {
        const responseBody = (await response.json()) as { detail?: BackendValidationDetail[] };
        const details = Array.isArray(responseBody.detail) ? responseBody.detail : [];
        const messages = details.map((detail) => String(detail.msg ?? ""));
        const hasInvalidPhone = messages.some((message) => message.includes("Invalid phone contact value"));
        const hasInvalidEmail = messages.some((message) => message.includes("Invalid email contact value"));

        if (hasInvalidPhone) {
          const phoneField = form ? getFormField(form, "phone") : null;
          setFieldValidity(phoneField, true);
          phoneField?.focus();
          errorMessage = t("contact.submit.invalidPhone");
        } else if (hasInvalidEmail) {
          const emailField = form ? getFormField(form, "email") : null;
          setFieldValidity(emailField, true);
          emailField?.focus();
          errorMessage = t("contact.submit.invalidEmail");
        }
      } catch {
        errorMessage = t("contact.submit.validationError");
      }
    }

    setSubmitError(errorMessage);
  };

  const sendWhatsApp = () => {
    const result = getValidatedForm(false);
    if (!result) return;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(result.messageBody)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const submitRequest = async () => {
    if (isSubmitting) return;

    const result = getValidatedForm(true);
    if (!result) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`${getContactApiBaseUrl()}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.payload),
      });

      if (!response.ok) {
        await handleSubmitError(response);
        return;
      }

      const form = document.getElementById(formId) as HTMLFormElement | null;
      form?.reset();
      form?.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));
      window.dispatchEvent(new Event("mexcodex-contact-reset"));
      setShowSuccessModal(true);
    } catch {
      setSubmitError(t("contact.submit.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="contact-submit-actions">
        <button type="button" className="btn-submit btn-submit-whatsapp" onClick={sendWhatsApp}>
          {t("contact.submit.whatsapp")}
        </button>
        <button
          type="button"
          className="btn-submit btn-submit-email"
          onClick={submitRequest}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? t("contact.submit.sending") : t("contact.submit.email")}
        </button>
      </div>

      {submitError ? (
        <p className="contact-submit-error" role="alert">
          {submitError}
        </p>
      ) : null}

      {showSuccessModal ? (
        <div className="contact-success-backdrop" role="presentation">
          <div
            className="contact-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-success-title"
            aria-describedby="contact-success-message"
          >
            <h3 id="contact-success-title">{t("contact.submit.successTitle")}</h3>
            <p id="contact-success-message">{t("contact.submit.successMessage")}</p>
            <button type="button" className="btn-submit" onClick={() => setShowSuccessModal(false)}>
              {t("contact.submit.successClose")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
