"use client";

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; vx: number; vy: number; c: string };
const LINK = 130;

/** Animated particle network behind the page. Colors come from the theme (--particle-a / --particle-b). */
export default function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0;
    let h = 0;
    let dots: Dot[] = [];
    let colors: string[] = [];
    let mouse = { x: -9999, y: -9999 };
    let frameId = 0;

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors = [cs.getPropertyValue("--particle-a").trim() || "163, 230, 53", cs.getPropertyValue("--particle-b").trim() || "56, 189, 248"];
      dots.forEach((d, i) => (d.c = colors[i % 2]));
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, (w * h) / 22000));
      dots = Array.from({ length: count }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, c: colors[i % 2] }));
    };
    const onMove = (e: PointerEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };
    const frame = () => {
      if (!document.hidden) {
        ctx.clearRect(0, 0, w, h);
        for (const d of dots) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 0 || d.x > w) d.vx *= -1;
          if (d.y < 0 || d.y > h) d.vy *= -1;
          const md = Math.hypot(d.x - mouse.x, d.y - mouse.y);
          if (md < 160 && md > 0) {
            d.x += ((d.x - mouse.x) / md) * 0.6;
            d.y += ((d.y - mouse.y) / md) * 0.6;
          }
          ctx.fillStyle = `rgba(${d.c}, .7)`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        for (let a = 0; a < dots.length; a++) {
          for (let b = a + 1; b < dots.length; b++) {
            const dist = Math.hypot(dots[a].x - dots[b].x, dots[a].y - dots[b].y);
            if (dist > LINK) continue;
            ctx.strokeStyle = `rgba(${dots[a].c}, ${(1 - dist / LINK) * 0.22})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(dots[a].x, dots[a].y);
            ctx.lineTo(dots[b].x, dots[b].y);
            ctx.stroke();
          }
        }
      }
      frameId = requestAnimationFrame(frame);
    };

    readColors();
    resize();
    // Follow theme changes (the header button sets <html data-theme>).
    const themeWatcher = new MutationObserver(readColors);
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      themeWatcher.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas className="bg-canvas" aria-hidden="true" ref={ref} />;
}
