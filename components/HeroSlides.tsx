"use client";

import { useEffect, useState } from "react";

/** Hero background: the first image shows at once; the others load after the page and cross-fade every 7 s. */
export default function HeroSlides({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [loadRest, setLoadRest] = useState(false);

  useEffect(() => {
    if (images.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      setLoadRest(true);
      timer = setInterval(() => {
        if (!document.hidden) setActive((i) => (i + 1) % images.length);
      }, 7000);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (timer) clearInterval(timer);
    };
  }, [images.length]);

  return (
    <div className="hero-image" aria-hidden="true">
      {images.map((src, i) => (
        <div key={src} className={`hero-slide${i === active ? " is-active" : ""}`} style={i === 0 || loadRest ? { backgroundImage: `url("${src}")` } : undefined} />
      ))}
    </div>
  );
}
