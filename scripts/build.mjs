// Builds the static site into dist/ from content/*.json and assets/.
//   node scripts/build.mjs
// Every text, link, color and image comes from content/; nothing personal is written here.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, "content", f), "utf8"));
const site = read("site.json");
const S = read("sections.json");
const experience = read("experience.json");
const skills = read("skills.json");
const icons = read("skill-icons.json");
const themeData = read("themes.json");
const { categories, projects } = read("projects.json");
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });

const BASE = site.siteUrl.replace(/\/+$/, "");
const abs = (p = "") => `${BASE}/${p.replace(/^\/+/, "")}`;
const VERSION = Date.now().toString(36); // cache-busting for CSS/JS
const YEAR = new Date().getFullYear();
const today = new Date().toISOString().slice(0, 10);

// ---------- helpers ----------
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fill = (s = "") => String(s).replace(/\{years\}/g, site.yearsOfExperience).replace(/\{city\}/g, site.location.city).replace(/\{country\}/g, site.location.country);
const t = (s) => esc(fill(s));
const cat = (id) => categories.find((c) => c.id === id) ?? { name: id, short: id };
const hasShot = (p) => fs.existsSync(path.join(root, "assets/projects", `${p.slug}.jpg`));
const hostname = (u) => new URL(u).hostname.replace(/^www\./, "");
const ext = (href, label, cls = "") => `<a href="${esc(href)}" target="_blank" rel="noopener"${cls ? ` class="${cls}"` : ""}>${label}</a>`;
const ldJson = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
const ordered = categories.flatMap((c) => projects.filter((p) => p.category === c.id).sort((a, b) => b.featured - a.featured));
const num = (i) => String(i + 1).padStart(2, "0");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const twoLines = ([first, last]) => `${t(first)}<br><span class="gradient-text">${t(last)}</span>`;
const [firstName, ...restName] = site.name.split(" ");
const lastName = restName.pop();
const middle = restName.join(" ");

// ---------- contacts ----------
const C = site.contact;
const phoneDigits = (C.whatsapp || "").replace(/\D/g, "");
const links = {
  email: C.email && `mailto:${C.email}`,
  whatsapp: phoneDigits && `https://wa.me/${phoneDigits}`,
  telegram: C.telegram && `https://t.me/${C.telegram.replace(/^@/, "")}`,
  linkedin: C.linkedin,
};
const ICON = {
  email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M3 5h18v14H3zM3 6l9 7 9-7"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.88.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.58-.35zM12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.98 1-3.63-.24-.37a9.82 9.82 0 0 1-1.5-5.23c0-5.42 4.41-9.84 9.84-9.84a9.8 9.8 0 0 1 6.96 2.88 9.78 9.78 0 0 1 2.88 6.96c0 5.43-4.42 9.84-9.84 9.84zm8.38-18.22A11.77 11.77 0 0 0 12.05.1C5.5.1.17 5.43.17 11.98c0 2.1.55 4.14 1.59 5.94L.07 24l6.3-1.65a11.85 11.85 0 0 0 5.68 1.45h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.16-3.48-8.4z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.78 15.27 9.4 20.6c.54 0 .78-.23 1.06-.51l2.55-2.44 5.28 3.87c.97.53 1.65.25 1.91-.89l3.46-16.23c.31-1.43-.52-1.99-1.46-1.64L1.85 10.6c-1.39.54-1.37 1.32-.24 1.67l5.2 1.62L18.9 6.3c.57-.38 1.09-.17.66.21z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
};
const contactCards = [
  links.whatsapp && { id: "whatsapp", label: "WhatsApp", value: C.whatsapp, href: links.whatsapp },
  links.telegram && { id: "telegram", label: "Telegram", value: `@${C.telegram.replace(/^@/, "")}`, href: links.telegram },
  links.linkedin && { id: "linkedin", label: "LinkedIn", value: site.name, href: links.linkedin },
  links.email && { id: "email", label: "Email", value: C.email, href: links.email },
].filter(Boolean);
const card = (c) => {
  const inner = `${ICON[c.id]}<span class="social-text"><strong>${esc(c.label)}</strong><small>${esc(c.value)}</small></span><span class="social-arrow" aria-hidden="true">↗</span>`;
  return c.id === "email" ? `<a class="social-card social-${c.id}" href="${esc(c.href)}">${inner}</a>` : ext(c.href, inner, `social-card social-${c.id}`);
};

// ---------- themes ----------
const themeIds = Object.keys(themeData.themes);
const defaultTheme = themeIds.includes(themeData.default) ? themeData.default : themeIds[0];
const dflt = themeData.themes[defaultTheme].colors;
const themeList = themeIds.map((id) => ({ id, name: themeData.themes[id].name, bg: themeData.themes[id].colors["--bg"] }));
const themesCss =
  `/* Generated by scripts/build.mjs from content/themes.json — edit that file instead. */\n` +
  themeIds
    .map((id) => {
      const sel = id === defaultTheme ? `:root, :root[data-theme="${id}"]` : `:root[data-theme="${id}"]`;
      return `${sel} {\n${Object.entries(themeData.themes[id].colors).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`;
    })
    .join("\n\n") +
  "\n";
// Runs before the first paint: applies the saved theme so the page never flashes the wrong colors.
// ?theme=<id> in the link also picks (and remembers) a theme.
const bootScript = `(function(){var d=document.documentElement,t=null,q=location.search.match(/[?&]theme=([\\w-]+)/);try{t=q?q[1]:localStorage.getItem("theme");if(q)localStorage.setItem("theme",t)}catch(e){t=q&&q[1]}if(${JSON.stringify(themeIds)}.indexOf(t)<0)t=${JSON.stringify(defaultTheme)};d.setAttribute("data-theme",t);d.classList.add("js")})()`;

// ---------- structured data ----------
const person = {
  "@type": "Person",
  "@id": abs("#person"),
  name: site.name,
  jobTitle: site.jobTitle,
  description: fill(site.seo.description),
  url: abs(),
  ...(C.email && { email: `mailto:${C.email}` }),
  ...(phoneDigits && { telephone: `+${phoneDigits}` }),
  address: { "@type": "PostalAddress", addressLocality: site.location.city, addressCountry: site.location.countryCode },
  alumniOf: site.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
  knowsAbout: [...site.seo.keywords, ...skills.flatMap((g) => g.items).slice(0, 30)],
  knowsLanguage: site.languages,
  sameAs: [links.linkedin, links.telegram].filter(Boolean),
};

// ---------- layout ----------
function page({ file, title, description, image, imageAlt, type = "website", body, ld = [], noindex = false, depth = 0, rootPaths = false, home = false }) {
  const up = rootPaths ? "/" : "../".repeat(depth);
  const canonical = abs(file.replace(/index\.html$/, ""));
  const ogImage = image ? abs(image) : abs("assets/og-image.jpg");
  const homeHref = home ? "#top" : up || "./";
  const nav = (hash) => (home ? `#${hash}` : `${up}#${hash}`);
  const brand = (extra = "") => `<a class="brand" href="${homeHref}"${extra}><span class="brand-mark" aria-hidden="true">${esc(site.initials[0])}<span>.</span></span><span class="brand-name">${esc(site.name)}</span></a>`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(site.name)}">
${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
${noindex ? "" : `<link rel="canonical" href="${canonical}">`}
${site.seo.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(site.seo.googleSiteVerification)}">` : ""}
${site.seo.bingSiteVerification ? `<meta name="msvalidate.01" content="${esc(site.seo.bingSiteVerification)}">` : ""}
<meta name="theme-color" content="${dflt["--bg"]}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:alt" content="${esc(imageAlt || title)}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage}">
<script>${bootScript}</script>
<link rel="icon" href="${up}favicon.svg" type="image/svg+xml">
<link rel="manifest" href="${up}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap"></noscript>
${home && S.hero.images[0] ? `<link rel="preload" as="image" href="${esc(S.hero.images[0])}" fetchpriority="high">` : ""}
<link rel="stylesheet" href="${up}assets/themes.css?v=${VERSION}">
<link rel="stylesheet" href="${up}assets/styles.css?v=${VERSION}">
${ld.map(ldJson).join("\n")}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="bg-aurora" aria-hidden="true"><span></span><span></span><span></span></div>
<canvas class="bg-canvas" aria-hidden="true"></canvas>
<header class="site-header">
  <nav class="nav shell" aria-label="Main">
    ${brand(` aria-label="${esc(site.name)} — home"`)}
    <ul class="nav-links" id="nav-links">
      <li><a href="${nav("about")}">About</a></li>
      <li><a href="${nav("experience")}">Experience</a></li>
      <li><a href="${nav("projects")}">Projects</a></li>
      <li><a href="${nav("skills")}">Skills</a></li>
      <li><a href="${nav("education")}">Education</a></li>
      <li><a class="nav-cta" href="${nav("contact")}">Contact</a></li>
    </ul>
    <button class="theme-toggle" type="button" data-themes='${esc(JSON.stringify(themeList))}' aria-label="Change color theme"><span class="theme-swatch" aria-hidden="true"></span><span class="theme-name">${esc(themeData.themes[defaultTheme].name)}</span></button>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-links"><span class="visually-hidden">Menu</span><span class="menu-bars" aria-hidden="true"></span></button>
  </nav>
  <div class="scroll-progress" aria-hidden="true"></div>
</header>
<main id="main">
${body}
</main>
<footer class="footer shell">
  ${brand()}
  <p class="footer-copy mono">© ${YEAR} ${esc(site.name.toUpperCase())} · ${esc(site.jobTitle.toUpperCase())}</p>
  <p class="footer-links mono">${contactCards.map((c) => (c.id === "email" ? `<a href="${esc(c.href)}">EMAIL</a>` : ext(c.href, `${esc(c.label.toUpperCase())} ↗`))).join("")}<a href="${homeHref}">BACK TO TOP ↑</a></p>
</footer>
<script src="${up}assets/main.js?v=${VERSION}" defer></script>
</body>
</html>
`;
  const out = path.join(dist, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html.replace(/\n{2,}/g, "\n"));
}

// ---------- pieces ----------
const stackLine = (list, max = 4) => (list.length ? `<p class="project-type mono">${list.slice(0, max).map(esc).join(" · ")}</p>` : "");
const stackTags = (list, label = "") => (list.length ? `<ul class="job-stack mono"${label ? ` data-label="${esc(label)}"` : ""}>${list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "");
const checks = (items) => `<ul class="check-list">${items.map((i) => `<li>${t(i)}</li>`).join("")}</ul>`;
const metrics = (p) => (p.metrics?.length ? `<ul class="project-metrics">${p.metrics.map((m) => `<li><strong class="mono">${esc(m.value)}</strong>${esc(m.label)}</li>`).join("")}</ul>` : "");

function shot(p, { up = "", eager = false } = {}) {
  const alt = `${p.name} — ${p.tagline} (website screenshot)`;
  return hasShot(p)
    ? `<img src="${up}assets/projects/${p.slug}.jpg" alt="${esc(alt)}" width="960" height="600" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
    : `<span class="shot-placeholder" role="img" aria-label="${esc(p.name)}"><span>${esc(p.name)}</span></span>`;
}

function projectCard(p, i) {
  const live = p.url ? { href: p.url, attrs: ' target="_blank" rel="noopener"' } : { href: `projects/${p.slug}/`, attrs: "" };
  return `<article class="project-card reveal${p.featured ? " project-featured" : ""}" data-cat="${p.category}">
  <a class="project-shot" href="${esc(live.href)}"${live.attrs} tabindex="-1" aria-hidden="true">${shot(p)}</a>
  <div class="project-body">
    <p class="art-number mono">${num(i)} / ${esc(cat(p.category).short.toUpperCase())}</p>
    ${stackLine(p.stack)}
    <h3><a href="${esc(live.href)}"${live.attrs}>${esc(p.name)}${p.url ? '<span class="visually-hidden"> (opens live site)</span>' : ""}</a></h3>
    <p class="muted">${esc(p.overview)}</p>
    ${p.role ? `<p class="project-role mono">ROLE · <span>${esc(p.role)}</span></p>` : ""}
    ${metrics(p)}
    <div class="project-actions">
      ${p.url ? ext(p.url, `${esc(S.projects.liveButton)} <span aria-hidden="true">↗</span>`, "project-link project-demo") : ""}
      <a class="project-link" href="projects/${p.slug}/">${esc(S.projects.detailsButton)}<span class="visually-hidden">: ${esc(p.name)}</span> <span aria-hidden="true">→</span></a>
    </div>
  </div>
</article>`;
}

let sectionNo = 0;
const sectionHead = (sec, extra = "") => {
  const n = String(++sectionNo).padStart(2, "0");
  return `<div class="section-heading"><p class="mono section-kicker">// ${n}. ${esc(sec.kicker)}</p><h2 id="${slug(sec.kicker)}-title">${twoLines(sec.title)}</h2>${extra}</div>`;
};
const aside = (lines) => `<p class="muted section-aside">${lines.map(t).join("<br>")}</p>`;
const tabs = (group, label, items) =>
  `<div class="filter-tabs" data-filter-group="${group}" role="group" aria-label="${esc(label)}"><button type="button" class="filter-tab is-active" data-filter="all" aria-pressed="true">All</button>${items
    .map(([id, name]) => `<button type="button" class="filter-tab" data-filter="${id}" aria-pressed="false">${esc(name)}</button>`)
    .join("")}</div>`;

// ---------- home ----------
const featured = ordered.filter((p) => p.featured);
const more = ordered.filter((p) => !p.featured);
const jobsOldestFirst = [...experience].reverse();
const [firstImage, ...otherImages] = S.hero.images;

const homeBody = `
<section class="hero shell" id="top" aria-labelledby="hero-title">
  <div class="hero-image" aria-hidden="true">
    <div class="hero-slide is-active"${firstImage ? ` style="background-image:url('${esc(firstImage)}')"` : ""}></div>
    ${otherImages.map((src) => `<div class="hero-slide" data-bg="${esc(src)}"></div>`).join("\n    ")}
  </div>
  <div class="hero-copy">
    <p class="mono intro">${t(S.hero.kicker)}</p>
    <h1 id="hero-title">${esc(firstName)} ${esc(middle)}<br><span>${esc(lastName)}.</span></h1>
    <p class="hero-role">${esc(site.jobTitle)}</p>
    <p class="hero-description">${t(site.intro)}</p>
    <div class="hero-actions">
      <a class="button button-primary" href="#projects">${t(S.hero.primaryButton)} <span aria-hidden="true">↘</span></a>
      <a class="button button-quiet" href="#contact">${t(S.hero.secondaryButton)} <span aria-hidden="true">↗</span></a>
    </div>
    <p class="hero-meta"><span><span class="pin" aria-hidden="true">⌖</span>${esc(site.location.city)}, ${esc(site.location.country)}</span><span class="mono">${t(S.hero.availability)}</span></p>
  </div>
  <a class="scroll-cue mono" href="#about"><span aria-hidden="true">↓</span> ${t(S.hero.scrollCue)}</a>
</section>

<section class="section shell split about-section" id="about" aria-labelledby="${slug(S.about.kicker)}-title">
  ${sectionHead(S.about)}
  <div class="about-content reveal">
    <p class="about-lead">${t(site.about[0])}</p>
    ${site.about.slice(1).map((p) => `<p class="muted">${t(p)}</p>`).join("")}
    <dl class="about-facts">
      ${S.about.facts.map((f) => `<div class="fact"><span class="fact-icon" aria-hidden="true">${esc(f.icon)}</span><div><dt>${t(f.label)}</dt><dd>${t(f.value)}</dd></div></div>`).join("\n      ")}
    </dl>
    ${S.about.quote ? `<blockquote>${t(S.about.quote)}</blockquote>` : ""}
  </div>
</section>

<section class="section shell split experience-section" id="experience" aria-labelledby="${slug(S.experience.kicker)}-title">
  ${sectionHead(S.experience)}
  <div class="pipeline-column">
    <ol class="pipeline reveal" aria-label="Career path, oldest to newest">
      ${jobsOldestFirst
        .map(
          (j, i) =>
            `${i ? '<li class="pipe-link" aria-hidden="true"></li>' : ""}<li><a class="pipe-stage" href="#job-${experience.indexOf(j) + 1}"><span class="pipe-icon" aria-hidden="true">✓</span><span class="pipe-name">${esc(j.company)}</span><span class="pipe-meta mono">${esc(j.period.replace(/\d{2}\//g, "").replace(" – ", " → "))}</span></a></li>`,
        )
        .join("")}
    </ol>
    <ol class="timeline">
    ${experience
      .map(
        (j, i) => `<li class="job reveal" id="job-${i + 1}">
      <p class="job-log mono">$ job ${experience.length - i}/${experience.length} · passed</p>
      <p class="job-period mono">${esc(j.period)} · ${esc(j.location.toUpperCase())}</p>
      <h3>${esc(j.role)}</h3>
      <p class="job-company">${ext(j.url, esc(j.company))}</p>
      <p class="job-overview muted">${esc(j.overview)}</p>
      ${checks(j.achievements)}
      ${stackTags(j.stack, S.experience.stackLabel)}
    </li>`,
      )
      .join("\n")}
    </ol>
  </div>
</section>

<section class="section shell projects-section" id="projects" aria-labelledby="${slug(S.projects.kicker)}-title">
  <div class="section-topline">
    ${sectionHead(S.projects)}
    ${aside(S.projects.aside)}
  </div>
  ${tabs("projects", "Filter projects by category", categories.filter((c) => projects.some((p) => p.category === c.id)).map((c) => [c.id, c.short]))}
  <p class="projects-group-title mono">${t(S.projects.featuredLabel)}</p>
  <div class="projects-grid" data-filter-target="projects">
    ${featured.map((p) => projectCard(p, ordered.indexOf(p))).join("\n")}
  </div>
  <p class="projects-group-title mono">${t(S.projects.moreLabel)}</p>
  <div class="projects-grid projects-compact" data-filter-target="projects">
    ${more.map((p) => projectCard(p, ordered.indexOf(p))).join("\n")}
  </div>
</section>

<section class="section shell skills-section" id="skills" aria-labelledby="${slug(S.skills.kicker)}-title">
  <div class="section-topline">
    ${sectionHead(S.skills)}
    ${aside(S.skills.aside)}
  </div>
  ${tabs("skills", "Filter skills by area", skills.map((g) => [slug(g.group), g.group]))}
  <ul class="skills-grid" data-filter-target="skills">
  ${skills
    .flatMap((g) =>
      g.items.map(
        (s) =>
          `<li class="skill-chip reveal" data-cat="${slug(g.group)}"><img class="skill-icon" src="assets/skills/${icons.skills[s] || icons.groups[g.group] || "code"}.svg" alt="" width="26" height="26" loading="lazy"><strong>${esc(s)}</strong><span class="mono">${esc(g.group.toUpperCase())}</span></li>`,
      ),
    )
    .join("\n")}
  </ul>
</section>

<section class="section shell split education-section" id="education" aria-labelledby="${slug(S.education.kicker)}-title">
  ${sectionHead(S.education)}
  <ul class="education-list reveal">
    ${site.education
      .map(
        (e) =>
          `<li><span class="edu-logo mono" aria-hidden="true">${esc(e.school.split(" ").map((w) => w[0]).join(""))}</span><span class="edu-text"><strong>${esc(e.degree)}</strong><span>${esc(e.school)} · ${esc(e.location)} · ${esc(e.period)}</span></span></li>`,
      )
      .join("")}
  </ul>
</section>

<section class="contact-section" id="contact" aria-labelledby="${slug(S.contact.kicker)}-title">
  <div class="contact-glow" aria-hidden="true"></div>
  <div class="shell contact-inner">
    <div class="contact-heading reveal">
      <p class="mono section-kicker">// ${String(++sectionNo).padStart(2, "0")}. ${esc(S.contact.kicker)}</p>
      <h2 id="${slug(S.contact.kicker)}-title">${t(S.contact.title[0])} <span class="gradient-text">${t(S.contact.title[1])}</span></h2>
      <p class="muted">${t(S.contact.text)}</p>
    </div>
    <div class="contact-actions reveal">
      ${links.whatsapp ? ext(links.whatsapp, `${ICON.whatsapp}Chat on WhatsApp`, "button button-whatsapp contact-button") : ""}
      ${links.email ? `<a class="button button-primary contact-button" href="${esc(links.email)}">${ICON.email}Send an email</a>` : ""}
    </div>
    <div class="contact-social reveal">
      ${contactCards.map(card).join("\n      ")}
    </div>
  </div>
</section>`;

page({
  file: "index.html",
  home: true,
  title: site.seo.title,
  description: fill(site.seo.description),
  imageAlt: `${site.name} — ${site.jobTitle}`,
  type: "profile",
  body: homeBody,
  ld: [
    {
      "@context": "https://schema.org",
      "@graph": [
        person,
        { "@type": "WebSite", "@id": abs("#website"), url: abs(), name: site.name, inLanguage: "en", publisher: { "@id": abs("#person") } },
        { "@type": "ProfilePage", "@id": abs("#profile"), url: abs(), name: site.seo.title, mainEntity: { "@id": abs("#person") }, isPartOf: { "@id": abs("#website") }, dateModified: today },
        { "@type": "ItemList", name: "Projects", itemListElement: ordered.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`projects/${p.slug}/`), name: p.name })) },
      ],
    },
  ],
});

// ---------- project pages ----------
ordered.forEach((p, i) => {
  const prev = ordered[(i - 1 + ordered.length) % ordered.length];
  const next = ordered[(i + 1) % ordered.length];
  const up = "../../";
  const meta = [["Category", cat(p.category).name], ["Type", p.type], p.company && ["Company", p.company], p.role && ["My role", p.role], p.period && ["Period", p.period]].filter(Boolean);
  let n = 0;
  const block = (title, html) => (html ? `<section class="detail-block reveal"><p class="mono section-kicker">// ${String(++n).padStart(2, "0")}</p><h2>${title}</h2>${html}</section>` : "");
  const body = `
<article class="shell detail">
  <nav class="breadcrumb mono" aria-label="Breadcrumb"><ol><li><a href="${up}">HOME</a></li><li><a href="${up}#projects">PROJECTS</a></li><li aria-current="page">${esc(p.name.toUpperCase())}</li></ol></nav>
  <header class="detail-head">
    <p class="mono intro">// ${num(i)} / ${esc(cat(p.category).short.toUpperCase())}</p>
    <h1>${esc(p.name)}<span class="gradient-text">.</span></h1>
    <p class="hero-role">${esc(p.tagline)}</p>
    ${stackLine(p.stack, 8)}
    <div class="hero-actions">${p.url ? ext(p.url, `Visit live site <span aria-hidden="true">↗</span>`, "button button-primary") : ""}<a class="button button-quiet" href="${up}#projects">All projects <span aria-hidden="true">←</span></a></div>
  </header>
  <figure class="detail-shot">${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${shot(p, { up, eager: true })}</a>` : shot(p, { up, eager: true })}${p.url ? `<figcaption class="mono"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>${esc(hostname(p.url))}</figcaption>` : ""}</figure>
  <div class="detail-grid">
    <div class="detail-main">
      ${block("Product overview", `<p class="muted">${esc(p.overview)}</p>`)}
      ${block("Business problem", p.problem && `<p class="muted">${esc(p.problem)}</p>`)}
      ${block("My responsibilities", p.contributions && checks(p.contributions))}
      ${block("Technical implementation", p.technical && checks(p.technical))}
      ${block("Key features", p.features && checks(p.features))}
      ${block("Results and impact", (p.metrics || p.impact) && `${metrics(p)}${p.impact ? checks(p.impact) : ""}`)}
    </div>
    <aside class="detail-side">
      <dl class="side-card">${meta.map(([k, v]) => `<div><dt class="mono">${k.toUpperCase()}</dt><dd>${esc(v)}</dd></div>`).join("")}${p.url ? `<div><dt class="mono">WEBSITE</dt><dd>${ext(p.url, `${esc(hostname(p.url))} ↗`)}</dd></div>` : ""}</dl>
      ${p.stack.length ? `<div class="side-card"><p class="mono section-kicker">TECH STACK</p>${stackTags(p.stack)}</div>` : ""}
      <div class="side-card side-cta"><p class="mono section-kicker">NEED SOMETHING SIMILAR?</p><a class="button button-primary" href="${up}#contact">Let's talk <span aria-hidden="true">↗</span></a></div>
    </aside>
  </div>
  <nav class="pager" aria-label="More projects">
    <a href="${up}projects/${prev.slug}/"><span class="mono">← PREVIOUS</span>${esc(prev.name)}</a>
    <a href="${up}projects/${next.slug}/"><span class="mono">NEXT →</span>${esc(next.name)}</a>
  </nav>
</article>`;
  const description = `${p.name}: ${p.overview}`.slice(0, 158).replace(/\s+\S*$/, "") + "…";
  const work = {
    "@type": "CreativeWork",
    name: p.name,
    description: p.overview,
    genre: cat(p.category).name,
    keywords: p.stack.join(", "),
    ...(p.url && { url: p.url }),
    ...(hasShot(p) && { image: abs(`assets/projects/${p.slug}.jpg`) }),
    // Authorship is only claimed when the role is confirmed.
    ...(p.role && { contributor: { "@id": abs("#person") } }),
  };
  page({
    file: `projects/${p.slug}/index.html`,
    depth: 2,
    // Google shows ~60 characters: keep the tagline only when it fits.
    title: [`${p.name} — ${p.tagline} | ${site.name}`, `${p.name} | ${site.name}`].find((x) => x.length <= 62) || p.name,
    description,
    image: hasShot(p) ? `assets/projects/${p.slug}.jpg` : null,
    imageAlt: `${p.name} website screenshot`,
    type: "article",
    body,
    ld: [
      {
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebPage", "@id": abs(`projects/${p.slug}/`), url: abs(`projects/${p.slug}/`), name: p.name, about: work, author: { "@id": abs("#person") }, dateModified: today, inLanguage: "en" },
          person,
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: abs() },
              { "@type": "ListItem", position: 2, name: "Projects", item: abs("#projects") },
              { "@type": "ListItem", position: 3, name: p.name, item: abs(`projects/${p.slug}/`) },
            ],
          },
        ],
      },
    ],
  });
});

// ---------- 404 ----------
page({
  file: "404.html",
  title: `Page not found | ${site.name}`,
  description: S.notFound.text,
  noindex: true,
  rootPaths: true,
  body: `<section class="hero shell hero-small"><div class="hero-copy"><p class="mono intro">// 404</p><h1>${t(S.notFound.title[0])}<br><span>${t(S.notFound.title[1])}</span></h1><p class="hero-description">${t(S.notFound.text)}</p><div class="hero-actions"><a class="button button-primary" href="/">Go home <span aria-hidden="true">↗</span></a><a class="button button-quiet" href="/#projects">See projects <span aria-hidden="true">↘</span></a></div></div></section>`,
});

// ---------- sitemap, robots, manifest ----------
const urls = [abs(), ...ordered.map((p) => abs(`projects/${p.slug}/`))];
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`,
);
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${abs("sitemap.xml")}\n`);
fs.writeFileSync(
  path.join(dist, "site.webmanifest"),
  JSON.stringify({ name: site.name, short_name: site.shortName, start_url: "/", display: "browser", background_color: dflt["--bg"], theme_color: dflt["--bg"], icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }] }, null, 2),
);

// ---------- static files ----------
fs.cpSync(path.join(root, "assets"), path.join(dist, "assets"), { recursive: true });
fs.writeFileSync(path.join(dist, "assets/themes.css"), themesCss);
// Favicon from the initial and the default theme's colors.
fs.writeFileSync(
  path.join(dist, "favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${esc(site.name)}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dflt["--accent-text"]}"/><stop offset="1" stop-color="${dflt["--accent-2"]}"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="16" fill="${dflt["--surface"]}" stroke="url(#g)" stroke-width="3"/><text x="27" y="44" text-anchor="middle" font-family="Manrope, Segoe UI, Arial, sans-serif" font-size="32" font-weight="800" fill="#ffffff">${esc(site.initials[0])}</text><circle cx="44" cy="41" r="4.5" fill="${dflt["--accent"]}"/></svg>\n`,
);

const missing = ordered.filter((p) => p.url && !hasShot(p)).map((p) => p.slug);
console.log(`Built ${urls.length} pages into dist/ (site URL: ${BASE}, themes: ${themeIds.join(", ")})`);
if (missing.length) console.log(`No screenshot yet: ${missing.join(", ")}`);
if (BASE.includes("example.com")) console.log("⚠ siteUrl is still a placeholder: set it in content/site.json before publishing.");
