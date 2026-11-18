"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ThemeInfo } from "@/lib/types";
import Brand from "./Brand";

type Props = { name: string; initial: string; themes: ThemeInfo[]; defaultTheme: string };

const NAV = [
  ["about", "About"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["education", "Education"],
] as const;

export default function Header({ name, initial, themes, defaultTheme }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // The saved theme is applied in <head> before the first paint; pick it up here for the button label.
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || defaultTheme);
  }, [defaultTheme]);

  // Close the mobile menu after navigating, and with Escape.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Header shadow and reading-progress bar (written straight to the DOM: no re-render per scroll).
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      headerRef.current?.classList.toggle("is-scrolled", window.scrollY > 8);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const index = Math.max(0, themes.findIndex((t) => t.id === theme));
  const current = themes[index];
  const next = themes[(index + 1) % themes.length];

  const switchTheme = () => {
    document.documentElement.dataset.theme = next.id;
    try {
      localStorage.setItem("theme", next.id);
    } catch {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next.bg);
    setTheme(next.id);
  };

  return (
    <header className="site-header" ref={headerRef}>
      <nav className="nav shell" aria-label="Main">
        <Brand name={name} initial={initial} label={`${name} — home`} />
        <ul className={`nav-links${menuOpen ? " is-open" : ""}`} id="nav-links" onClick={(e) => (e.target as HTMLElement).closest("a") && setMenuOpen(false)}>
          {NAV.map(([id, label]) => (
            <li key={id}>
              <Link href={`/#${id}`}>{label}</Link>
            </li>
          ))}
          <li>
            <Link className="nav-cta" href="/#contact">
              Contact
            </Link>
          </li>
        </ul>
        <button className="theme-toggle" type="button" onClick={switchTheme} aria-label={`Color theme: ${current.name}. Switch to ${next.name}`}>
          <span className="theme-swatch" aria-hidden="true" />
          <span className="theme-name">{current.name}</span>
        </button>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="nav-links" onClick={() => setMenuOpen((open) => !open)}>
          <span className="visually-hidden">Menu</span>
          <span className="menu-bars" aria-hidden="true" />
        </button>
      </nav>
      <div className="scroll-progress" aria-hidden="true" ref={progressRef} />
    </header>
  );
}
