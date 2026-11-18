"use client";

import { DEV_TIER_KEY, type Tier } from "@/app/experience/experience";
import { useTier } from "@/app/experience/useExperience";

const options: Array<{ tier: Tier | null; label: string }> = [
  { tier: null, label: "Auto" },
  { tier: "basic", label: "Baja" },
  { tier: "nice", label: "Media" },
  { tier: "best", label: "Alta" },
];

/**
 * Solo en desarrollo: selector para ver la página como la vería cada gama. Guarda la
 * elección y recarga; "Auto" vuelve a la detección real. Lo carga DevTools.tsx únicamente
 * cuando NODE_ENV es "development", así que no llega al sitio publicado.
 */
export function DevTierSwitch() {
  const tier = useTier();
  const forced = typeof document !== "undefined" && "tierForced" in document.documentElement.dataset;

  const pick = (next: Tier | null) => {
    if (next) localStorage.setItem(DEV_TIER_KEY, next);
    else localStorage.removeItem(DEV_TIER_KEY);
    window.location.reload();
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9999,
        display: "flex",
        gap: 4,
        padding: 4,
        borderRadius: 8,
        background: "rgba(0, 0, 0, 0.82)",
        font: "600 11px ui-monospace, Menlo, Consolas, monospace",
      }}
    >
      {options.map((option) => {
        const active = option.tier === null ? !forced : forced && option.tier === tier;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => pick(option.tier)}
            title={option.tier === null ? `Detectada: ${tier}` : option.tier}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #444",
              background: active ? "#fff" : "transparent",
              color: active ? "#000" : "#ddd",
              cursor: "pointer",
            }}
          >
            {option.tier === null && !forced ? `Auto: ${tier}` : option.label}
          </button>
        );
      })}
    </div>
  );
}
