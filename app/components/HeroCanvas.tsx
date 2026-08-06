"use client";

import { useEffect, useRef } from "react";

type Shape = {
  x: number;
  y: number;
  size: number;
  sides: number;
  color: string;
  alpha: number;
  rot: number;
  rotSpeed: number;
  vx: number;
  vy: number;
};

const palette = ["#2f7d4b", "#205736", "#5c8f67", "#88a182", "#102c1b"];

function createShape(width: number, height: number): Shape {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: 8 + Math.random() * 28,
    sides: [3, 4, 6][Math.floor(Math.random() * 3)],
    color: palette[Math.floor(Math.random() * palette.length)],
    alpha: 0.08 + Math.random() * 0.18,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.008,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
  };
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let shapes: Shape[] = [];
    const mouse = { x: -9999, y: -9999 };
    const hero = canvas.closest<HTMLElement>("#hero");

    const resetShape = (shape: Shape) => {
      Object.assign(shape, createShape(width, height));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = hero?.offsetHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      shapes = Array.from({ length: 55 }, () => createShape(width, height));
    };

    const drawShape = (shape: Shape) => {
      const dx = shape.x - mouse.x;
      const dy = shape.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pull = Math.max(0, 1 - dist / 200);
      const nx = shape.x + dx * pull * 0.4;
      const ny = shape.y + dy * pull * 0.4;

      context.save();
      context.translate(nx, ny);
      context.rotate(shape.rot);
      context.globalAlpha = shape.alpha + pull * 0.3;
      context.strokeStyle = shape.color;
      context.lineWidth = 1;
      context.beginPath();

      for (let i = 0; i < shape.sides; i += 1) {
        const angle = (i / shape.sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * shape.size;
        const py = Math.sin(angle) * shape.size;
        if (i === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }

      context.closePath();
      context.stroke();
      context.restore();
    };

    const updateShape = (shape: Shape) => {
      shape.x += shape.vx;
      shape.y += shape.vy;
      shape.rot += shape.rotSpeed;

      if (shape.x < -50 || shape.x > width + 50 || shape.y < -50 || shape.y > height + 50) {
        resetShape(shape);
      }
    };

    const loop = () => {
      context.clearRect(0, 0, width, height);
      shapes.forEach((shape) => {
        updateShape(shape);
        drawShape(shape);
      });
      animationFrame = requestAnimationFrame(loop);
    };

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    loop();
    window.addEventListener("resize", resize);
    hero?.addEventListener("mousemove", onMouseMove);
    hero?.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      hero?.removeEventListener("mousemove", onMouseMove);
      hero?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} id="hero-canvas" aria-hidden="true" />;
}
