"use client";

import { useEffect, useRef } from "react";
import { createFrameWatchdog } from "@/app/experience/frameWatchdog";

// Un punto en coordenadas polares del disco: [ángulo en radianes, radio de 0 a 1]
type Polar = [number, number];
type Ring = {
  lines: Polar[][];
  depth: number; // separación del anillo respecto al plano del disco
  speed: number; // giro por cuadro (el signo da el sentido)
  weight: number; // qué tanto resalta
};

const TAU = Math.PI * 2;
const CAMERA = 3.4;

function circle(radius: number, steps = 120): Polar[] {
  return Array.from({ length: steps + 1 }, (_, i) => [(i / steps) * TAU, radius] as Polar);
}

function arc(from: number, to: number, radius: number, steps = 4): Polar[] {
  return Array.from({ length: steps + 1 }, (_, i) => [from + ((to - from) * i) / steps, radius] as Polar);
}

// Greca escalonada: el motivo se repite en cada celda del anillo
function fretRing(inner: number, outer: number, cells: number): Polar[][] {
  const lines: Polar[][] = [circle(inner), circle(outer)];
  const span = TAU / cells;
  const at = (cell: number, a: number, r: number): Polar => [cell * span + a * span, inner + (outer - inner) * r];

  for (let cell = 0; cell < cells; cell += 1) {
    lines.push([
      at(cell, 0.08, 0),
      at(cell, 0.08, 0.78),
      ...arc(cell * span + 0.08 * span, cell * span + 0.8 * span, inner + (outer - inner) * 0.78, 3),
      at(cell, 0.8, 0.3),
      ...arc(cell * span + 0.8 * span, cell * span + 0.36 * span, inner + (outer - inner) * 0.3, 2),
      at(cell, 0.36, 0.54),
      at(cell, 0.58, 0.54),
    ]);
  }
  return lines;
}

// Casillas: divisiones radiales con una marca en cada una
function cellRing(inner: number, outer: number, cells: number): Polar[][] {
  const lines: Polar[][] = [circle(inner), circle(outer)];
  const span = TAU / cells;
  const middle = (inner + outer) / 2;

  for (let cell = 0; cell < cells; cell += 1) {
    lines.push([
      [cell * span, inner],
      [cell * span, outer],
    ]);
    lines.push(arc(cell * span + span * 0.3, cell * span + span * 0.7, middle, 2));
  }
  return lines;
}

// Rayos: puntas grandes en los ocho rumbos y puntas chicas entre ellas
function rayRing(inner: number, outer: number): Polar[][] {
  const lines: Polar[][] = [];
  for (let i = 0; i < 16; i += 1) {
    const center = (i / 16) * TAU;
    const half = i % 2 === 0 ? 0.16 : 0.09;
    const tip = i % 2 === 0 ? outer : inner + (outer - inner) * 0.55;
    lines.push([
      [center - half, inner],
      [center, tip],
      [center + half, inner],
    ]);
  }
  return lines;
}

function tickRing(inner: number, outer: number, ticks: number): Polar[][] {
  const lines: Polar[][] = [circle(outer)];
  for (let i = 0; i < ticks; i += 1) {
    const angle = (i / ticks) * TAU;
    lines.push([
      [angle, i % 4 === 0 ? inner : inner + (outer - inner) * 0.5],
      [angle, outer],
    ]);
  }
  return lines;
}

function buildRings(): Ring[] {
  return [
    { lines: [circle(0.2), circle(0.24)], depth: 0.2, speed: 0.004, weight: 1 },
    { lines: cellRing(0.3, 0.42, 20), depth: 0.12, speed: -0.0022, weight: 0.9 },
    { lines: rayRing(0.44, 0.62), depth: 0.04, speed: 0.0012, weight: 1 },
    { lines: fretRing(0.64, 0.78, 24), depth: -0.05, speed: -0.0009, weight: 0.85 },
    { lines: cellRing(0.8, 0.88, 52), depth: -0.12, speed: 0.0007, weight: 0.6 },
    { lines: tickRing(0.9, 0.97, 104), depth: -0.2, speed: -0.0004, weight: 0.5 },
  ];
}

/**
 * Hero del diseño 3D (gama alta): un calendario de anillos concéntricos, cada uno a su
 * propia profundidad y girando a su ritmo, como un mecanismo. Es un diseño abstracto
 * (grecas, casillas y rayos), no la copia de una pieza real. Se dibuja en canvas 2D con
 * proyección en perspectiva, se inclina con el cursor por --px / --py y un vigilante
 * baja el equipo a la página clásica si no lo mueve con fluidez.
 */
export function HeroSceneCalendar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const hero = canvas?.closest<HTMLElement>("#hero");
    if (!canvas || !context || !hero) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 800px)").matches;
    const rings = buildRings();
    const angles = rings.map((_, i) => i * 0.4);
    const watchdog = createFrameWatchdog();

    let width = 0;
    let height = 0;
    let unit = 1;
    let pitch = 0.62;
    let yaw = 0;
    let sweep = 0;
    let frame = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2);
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      unit = compact ? Math.min(width * 0.78, height * 0.5) : Math.min(width * 0.44, height * 0.78);
    };

    const draw = (time: number) => {
      if (!reducedMotion && watchdog.tick(time)) return;

      context.clearRect(0, 0, width, height);

      const px = parseFloat(hero.style.getPropertyValue("--px")) || 0;
      const py = parseFloat(hero.style.getPropertyValue("--py")) || 0;
      pitch += (0.62 + py * 0.22 - pitch) * 0.05;
      yaw += (px * 0.34 - yaw) * 0.05;
      if (!reducedMotion) sweep = (sweep + 0.006) % TAU;

      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const centerX = width / 2;
      const centerY = height * (compact ? 0.5 : 0.54);

      context.lineJoin = "round";
      context.lineCap = "round";

      rings.forEach((ring, index) => {
        if (!reducedMotion) angles[index] += ring.speed;
        const turn = angles[index];

        for (const line of ring.lines) {
          let litTotal = 0;
          let depthTotal = 0;

          context.beginPath();
          line.forEach(([angle, radius], i) => {
            const a = angle + turn;
            const x = Math.cos(a) * radius;
            const y = Math.sin(a) * radius;
            // el disco se recuesta (pitch) y gira hacia el cursor (yaw)
            const y1 = y * cosPitch - ring.depth * sinPitch;
            const z1 = ring.depth * cosPitch + y * sinPitch;
            const x2 = x * cosYaw + z1 * sinYaw;
            const z2 = z1 * cosYaw - x * sinYaw;
            const scale = (CAMERA / (CAMERA - z2)) * unit;
            const sx = centerX + x2 * scale;
            const sy = centerY - y1 * scale;
            if (i === 0) context.moveTo(sx, sy);
            else context.lineTo(sx, sy);

            // El barrido es un haz que gira como la manecilla de un radar
            let gap = Math.abs(((a - sweep) % TAU) + TAU) % TAU;
            if (gap > Math.PI) gap = TAU - gap;
            litTotal += Math.max(0, 1 - gap / 0.3);
            depthTotal += z2;
          });

          // Quieto (reducir movimiento) no hay haz: se vería como una mancha fija
          const lit = reducedMotion || line.length > 20 ? 0 : litTotal / line.length;
          const near = 0.55 + 0.45 * Math.max(0, Math.min(1, depthTotal / line.length + 0.5));
          const alpha = Math.min(1, ring.weight * near * 0.5 + lit * 0.55);
          context.strokeStyle = lit > 0.08 ? `rgba(224, 226, 204, ${alpha})` : `rgba(92, 143, 103, ${alpha})`;
          context.lineWidth = 1 + lit * 0.8;
          context.stroke();
        }
      });

      if (running && !reducedMotion) frame = requestAnimationFrame(draw);
    };

    // Pausa la animación cuando el hero sale de pantalla
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        watchdog.reset();
        frame = requestAnimationFrame(draw);
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(frame);
      }
    });

    const layout = new ResizeObserver(() => {
      resize();
      if (reducedMotion) draw(0);
    });

    resize();
    frame = requestAnimationFrame(draw);
    visibility.observe(canvas);
    layout.observe(hero);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      visibility.disconnect();
      layout.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} id="hero-canvas" aria-hidden="true" />;
}
