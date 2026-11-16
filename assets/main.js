// Small enhancements; the site works fully without JavaScript.
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ----- Mobile menu -----
const toggle = document.querySelector(".menu-toggle");
const links = document.getElementById("nav-links");
if (toggle && links) {
  const setOpen = (open) => {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setOpen(!links.classList.contains("is-open")));
  links.addEventListener("click", (e) => e.target.closest("a") && setOpen(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
}

// ----- Theme switcher (the saved theme is applied in <head> before the first paint) -----
const themeBtn = document.querySelector(".theme-toggle");
if (themeBtn) {
  const themes = JSON.parse(themeBtn.dataset.themes || "[]");
  const html = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const show = (id) => {
    const i = themes.findIndex((x) => x.id === id);
    const next = themes[(i + 1) % themes.length];
    themeBtn.querySelector(".theme-name").textContent = themes[i]?.name ?? "";
    themeBtn.setAttribute("aria-label", `Color theme: ${themes[i]?.name}. Switch to ${next?.name}`);
    if (meta && themes[i]) meta.content = themes[i].bg;
  };
  show(html.dataset.theme);
  themeBtn.addEventListener("click", () => {
    const i = themes.findIndex((x) => x.id === html.dataset.theme);
    const id = themes[(i + 1) % themes.length].id;
    html.dataset.theme = id;
    try { localStorage.setItem("theme", id); } catch {}
    show(id);
    document.dispatchEvent(new CustomEvent("themechange"));
  });
}

// ----- Header shadow and reading progress -----
const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress");
let ticking = false;
const onScroll = () => {
  ticking = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  header?.classList.toggle("is-scrolled", scrollY > 8);
  if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
};
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

// ----- Reveal on scroll -----
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  revealItems.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(el) % 6, 5) * 70}ms`);
    io.observe(el);
  });
} else {
  revealItems.forEach((el) => el.classList.add("is-visible"));
}

// ----- Filter tabs (projects and skills) -----
document.querySelectorAll("[data-filter-group]").forEach((group) => {
  const name = group.dataset.filterGroup;
  const items = document.querySelectorAll(`[data-filter-target="${name}"] > [data-cat]`);
  group.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-filter]");
    if (!tab) return;
    group.querySelectorAll("[data-filter]").forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-pressed", String(active));
    });
    const f = tab.dataset.filter;
    items.forEach((item) => {
      item.hidden = f !== "all" && item.dataset.cat !== f;
      item.classList.add("is-visible");
    });
    // Hide a group title ("Featured", "More projects") when its grid has no visible items.
    document.querySelectorAll(`[data-filter-target="${name}"]`).forEach((grid) => {
      const title = grid.previousElementSibling;
      if (title?.classList.contains("projects-group-title")) title.hidden = ![...grid.children].some((c) => !c.hidden);
    });
  });
});

// ----- Light that follows the mouse on cards -----
document.addEventListener("pointermove", (e) => {
  const card = e.target.closest?.(".project-card, .skill-chip");
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
}, { passive: true });

// ----- Hero background slideshow -----
const slides = [...document.querySelectorAll(".hero-slide")];
if (slides.length > 1 && !reduceMotion) {
  addEventListener("load", () => {
    slides.forEach((s) => s.dataset.bg && (s.style.backgroundImage = `url("${s.dataset.bg}")`));
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 7000);
  });
}

// ----- Particle network background -----
const canvas = document.querySelector(".bg-canvas");
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext("2d");
  // Particle colors come from the theme (--particle-a / --particle-b).
  let colors;
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    colors = [cs.getPropertyValue("--particle-a").trim() || "163, 230, 53", cs.getPropertyValue("--particle-b").trim() || "56, 189, 248"];
    dots?.forEach((d, i) => (d.c = colors[i % 2]));
  };
  let w, h, dots, mouse = { x: -9999, y: -9999 };
  readColors();
  document.addEventListener("themechange", readColors);
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(70, (w * h) / 22000));
    dots = Array.from({ length: count }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, c: colors[i % 2] }));
  };
  resize();
  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => { mouse = { x: e.clientX, y: e.clientY }; }, { passive: true });
  const LINK = 130;
  const frame = () => {
    if (!document.hidden) {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        const md = Math.hypot(d.x - mouse.x, d.y - mouse.y);
        if (md < 160) { d.x += (d.x - mouse.x) / md * .6; d.y += (d.y - mouse.y) / md * .6; }
        ctx.fillStyle = `rgba(${d.c}, .7)`;
        ctx.beginPath(); ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2); ctx.fill();
      }
      for (let a = 0; a < dots.length; a++) {
        for (let b = a + 1; b < dots.length; b++) {
          const dist = Math.hypot(dots[a].x - dots[b].x, dots[a].y - dots[b].y);
          if (dist > LINK) continue;
          ctx.strokeStyle = `rgba(${dots[a].c}, ${(1 - dist / LINK) * .22})`;
          ctx.lineWidth = .6;
          ctx.beginPath(); ctx.moveTo(dots[a].x, dots[a].y); ctx.lineTo(dots[b].x, dots[b].y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
