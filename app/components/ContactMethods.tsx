"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/app/i18n/LanguageProvider";

type ContactMethod = "email" | "phone";

const removeAnimationMs = 220;
const contactMethodOrder: ContactMethod[] = ["phone", "email"];

const contactMethods: Record<
  ContactMethod,
  {
    labelKey: string;
    inputMode?: "email" | "tel";
    placeholderKey: string;
    type: "email" | "tel";
  }
> = {
  email: {
    inputMode: "email",
    labelKey: "contact.methods.email",
    placeholderKey: "contact.methods.emailPlaceholder",
    type: "email",
  },
  phone: {
    inputMode: "tel",
    labelKey: "contact.methods.phone",
    placeholderKey: "contact.methods.phonePlaceholder",
    type: "tel",
  },
};

export function ContactMethods() {
  const { t } = useTranslation();
  const [selectedMethods, setSelectedMethods] = useState<ContactMethod[]>([]);
  const [removingMethods, setRemovingMethods] = useState<ContactMethod[]>([]);
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [showContactError, setShowContactError] = useState(false);

  useEffect(() => {
    const showRequiredContact = () => setShowContactError(true);
    const resetContactMethods = () => {
      setSelectedMethods([]);
      setRemovingMethods([]);
      setIsChooserOpen(false);
      setShowContactError(false);
    };

    window.addEventListener("mexcodex-contact-required", showRequiredContact);
    window.addEventListener("mexcodex-contact-reset", resetContactMethods);

    return () => {
      window.removeEventListener("mexcodex-contact-required", showRequiredContact);
      window.removeEventListener("mexcodex-contact-reset", resetContactMethods);
    };
  }, []);

  const addMethod = (method: ContactMethod) => {
    setShowContactError(false);
    setRemovingMethods((currentMethods) => currentMethods.filter((item) => item !== method));
    setSelectedMethods((currentMethods) =>
      currentMethods.includes(method) ? currentMethods : [...currentMethods, method],
    );
    setIsChooserOpen(false);
  };

  const removeMethod = (method: ContactMethod) => {
    setRemovingMethods((currentMethods) =>
      currentMethods.includes(method) ? currentMethods : [...currentMethods, method],
    );

    window.setTimeout(() => {
      setSelectedMethods((currentMethods) => currentMethods.filter((item) => item !== method));
      setRemovingMethods((currentMethods) => currentMethods.filter((item) => item !== method));
    }, removeAnimationMs);
  };

  const availableMethods = contactMethodOrder.filter((method) => !selectedMethods.includes(method));

  return (
    <div
      className={`contact-methods${showContactError ? " contact-methods-error" : ""}`}
      aria-label={t("contact.methods.aria")}
    >
      <div className="form-label contact-methods-label">{t("contact.methods.label")}</div>

      {selectedMethods.map((method) => {
        const methodConfig = contactMethods[method];
        const methodLabel = t(methodConfig.labelKey);
        const inputId = `contact-${method}`;
        const isRemoving = removingMethods.includes(method);

        return (
          <div className={`contact-method-row${isRemoving ? " contact-method-row-removing" : ""}`} key={method}>
            <div className="form-group contact-method-field">
              <label className="form-label" htmlFor={inputId}>
                {methodLabel}
              </label>
              <input
                id={inputId}
                name={method}
                type={methodConfig.type}
                inputMode={methodConfig.inputMode}
                className="form-input"
                placeholder={t(methodConfig.placeholderKey)}
                onChange={(event) => {
                  if (event.target.value.trim()) setShowContactError(false);
                }}
              />
            </div>
            <button
              type="button"
              className="contact-method-remove"
              onClick={() => removeMethod(method)}
              disabled={isRemoving}
              aria-label={t("contact.methods.remove", { method: methodLabel.toLowerCase() })}
              title={t("contact.methods.remove", { method: methodLabel.toLowerCase() })}
            >
              x
            </button>
          </div>
        );
      })}

      {availableMethods.length > 0 ? (
        <div className={`contact-method-actions${isChooserOpen ? " contact-method-actions-open" : ""}`}>
          {isChooserOpen ? (
            availableMethods.map((method) => (
              <button
                type="button"
                className="contact-method-option contact-method-pop"
                key={method}
                onClick={() => addMethod(method)}
              >
                {t(contactMethods[method].labelKey)}
              </button>
            ))
          ) : (
            <button
              type="button"
              className="contact-method-add"
              onClick={() => setIsChooserOpen(true)}
              aria-expanded={isChooserOpen}
            >
              {t("contact.methods.add")}
            </button>
          )}
        </div>
      ) : null}

      {showContactError ? (
        <p className="contact-method-error" role="alert">
          {t("contact.methods.error")}
        </p>
      ) : null}
    </div>
  );
}
