"use client";

import dynamic from "next/dynamic";

// El selector de gama solo existe en desarrollo. Al compilar para producción esta condición
// es falsa de forma estática, así que su código ni siquiera se incluye en el sitio publicado.
const DevTierSwitch =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@/app/experience/DevTierSwitch").then((mod) => mod.DevTierSwitch), { ssr: false })
    : null;

export function DevTools() {
  return DevTierSwitch ? <DevTierSwitch /> : null;
}
