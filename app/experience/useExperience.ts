"use client";

import { useSyncExternalStore } from "react";
import { TIER_EVENT, ensureTier, readTier, type Tier } from "@/app/experience/experience";

function subscribe(onStoreChange: () => void) {
  ensureTier();
  window.addEventListener(TIER_EVENT, onStoreChange);
  return () => window.removeEventListener(TIER_EVENT, onStoreChange);
}

/**
 * Gama del dispositivo: "basic" (clásica sin animaciones), "nice" (clásica) o "best" (3D completo).
 * En el prerender siempre es "basic".
 */
export function useTier(): Tier {
  return useSyncExternalStore(subscribe, readTier, () => "basic");
}
