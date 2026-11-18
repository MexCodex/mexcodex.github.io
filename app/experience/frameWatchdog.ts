import { capToNice } from "@/app/experience/experience";

// Mismos umbrales que el vigilante del proyecto de lealtad.
// 20 fps y no 30: el modo de bajo consumo de iOS limita requestAnimationFrame a 30.
const WARMUP_MS = 3000;
const WINDOW_MS = 2000;
const MIN_FPS = 20;
const BAD_WINDOWS = 3;
const MAX_GAP_MS = 1000;

/**
 * Vigilante de fluidez de la escena del hero. Se llama una vez por cuadro con el tiempo de
 * requestAnimationFrame. Ignora el arranque, mide ventanas de 2 s y, tras 3 ventanas seguidas
 * por debajo de 20 fps, baja el equipo a "nice". Un hueco de más de 1 s (pestaña en segundo
 * plano, un congelón aislado) reinicia la ventana en vez de contar como lentitud.
 * Devuelve true cuando la escena debe dejar de animarse.
 */
export function createFrameWatchdog() {
  let lastTime = 0;
  let elapsed = 0;
  let windowMs = 0;
  let frames = 0;
  let bad = 0;

  return {
    /** Tras una pausa (hero fuera de pantalla) se empieza de nuevo, arranque incluido. */
    reset() {
      lastTime = elapsed = windowMs = frames = bad = 0;
    },
    tick(time: number): boolean {
      const delta = lastTime ? time - lastTime : 0;
      lastTime = time;
      if (!delta) return false;
      if (delta > MAX_GAP_MS) {
        windowMs = frames = 0;
        return false;
      }
      elapsed += delta;
      if (elapsed <= WARMUP_MS) return false;
      windowMs += delta;
      frames += 1;
      if (windowMs < WINDOW_MS) return false;
      const fps = (frames * 1000) / windowMs;
      windowMs = frames = 0;
      bad = fps < MIN_FPS ? bad + 1 : 0;
      if (bad < BAD_WINDOWS) return false;
      capToNice();
      return true;
    },
  };
}
