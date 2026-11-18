"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Page-wide effects that only add classes / CSS variables to existing elements:
 * - ".reveal" elements fade in when they scroll into view
 * - project cards and skill chips get a light that follows the mouse
 * Without JavaScript (or with "reduce motion") everything is simply visible.
 */
export default function Effects() {
  const pathname = usePathname();

  // Reveal on scroll; runs again after each navigation because the page content is new.
  useEffect(() => {
    const items = [...document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")];
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => {
      // Small stagger between neighbours.
      const siblings = [...(el.parentElement?.children ?? [])].filter((c) => c.classList.contains("reveal"));
      el.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(el) % 6, 5) * 70}ms`);
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  // Light that follows the mouse on cards.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".project-card, .skill-chip");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
