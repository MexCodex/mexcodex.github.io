"use client";

import { useEffect } from "react";

const MAX_TILT = 8; // grados

/**
 * Interacciones del diseño 3D. Solo se monta en gama alta (<html data-tier="best">).
 *  - Con mouse: las tarjetas con [data-tilt] se inclinan hacia el cursor y la zona de
 *    paralaje (el hero, o el elemento con [data-parallax] en las otras páginas) recibe
 *    --px / --py, de -1 a 1.
 *  - En pantallas táctiles: el paralaje del hero sigue la inclinación del teléfono
 *    cuando el navegador la entrega sin pedir permiso.
 */
export function Experience3D() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hero = document.querySelector<HTMLElement>("#hero, [data-parallax]");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    if (finePointer) {
      let active: HTMLElement | null = null;
      let frame = 0;
      let lastX = 0;
      let lastY = 0;

      const release = (el: HTMLElement) => {
        el.classList.remove("is-tilting");
        el.style.removeProperty("--rx");
        el.style.removeProperty("--ry");
        el.style.removeProperty("--mx");
        el.style.removeProperty("--my");
        el.style.removeProperty("--lift");
      };

      const apply = () => {
        frame = 0;

        if (hero) {
          const rect = hero.getBoundingClientRect();
          if (rect.bottom > 0) {
            const px = ((lastX - rect.left) / rect.width) * 2 - 1;
            const py = ((lastY - rect.top) / rect.height) * 2 - 1;
            hero.style.setProperty("--px", px.toFixed(3));
            hero.style.setProperty("--py", Math.max(-1, Math.min(1, py)).toFixed(3));
          }
        }

        const target =
          document.elementFromPoint(lastX, lastY)?.closest<HTMLElement>("[data-tilt]") ?? null;
        if (active && active !== target) release(active);
        active = target;
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const x = (lastX - rect.left) / rect.width;
        const y = (lastY - rect.top) / rect.height;
        // Las tarjetas grandes se inclinan menos para que el texto siga siendo legible.
        const strength = MAX_TILT * Math.min(1, 380 / Math.max(rect.width, rect.height));

        target.classList.add("is-tilting");
        target.style.setProperty("--rx", `${((0.5 - y) * 2 * strength).toFixed(2)}deg`);
        target.style.setProperty("--ry", `${((x - 0.5) * 2 * strength).toFixed(2)}deg`);
        target.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        target.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
        target.style.setProperty("--lift", "1");
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        lastX = event.clientX;
        lastY = event.clientY;
        if (!frame) frame = requestAnimationFrame(apply);
      };

      const onLeave = () => {
        if (active) release(active);
        active = null;
        hero?.style.setProperty("--px", "0");
        hero?.style.setProperty("--py", "0");
      };

      document.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        document.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        if (active) release(active);
      });
    } else if (hero) {
      let frame = 0;
      let px = 0;
      let py = 0;

      const onOrientation = (event: DeviceOrientationEvent) => {
        if (event.gamma == null || event.beta == null) return;
        px = Math.max(-1, Math.min(1, event.gamma / 30));
        py = Math.max(-1, Math.min(1, (event.beta - 45) / 30));
        if (!frame) {
          frame = requestAnimationFrame(() => {
            frame = 0;
            hero.style.setProperty("--px", px.toFixed(3));
            hero.style.setProperty("--py", py.toFixed(3));
          });
        }
      };

      window.addEventListener("deviceorientation", onOrientation);
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener("deviceorientation", onOrientation);
      });
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      hero?.style.removeProperty("--px");
      hero?.style.removeProperty("--py");
    };
  }, []);

  return null;
}
