// Server-only: loads content/*.json and derives everything the pages need.
// Every text, link, color and image comes from content/; nothing personal is written in the components.
import fs from "node:fs";
import path from "node:path";
import siteJson from "@/content/site.json";
import sectionsJson from "@/content/sections.json";
import experienceJson from "@/content/experience.json";
import skillsJson from "@/content/skills.json";
import iconsJson from "@/content/skill-icons.json";
import themesJson from "@/content/themes.json";
import projectsJson from "@/content/projects.json";
import type { Category, ContactCard, Project, ProjectCardData, SkillChip, ThemeInfo } from "./types";

export const site = siteJson;
export const S = sectionsJson;
export const experience = experienceJson;
export const skills = skillsJson;
export const categories = projectsJson.categories as Category[];
export const projects = projectsJson.projects as unknown as Project[];

// ---------- URLs ----------
export const BASE = site.siteUrl.replace(/\/+$/, "");
/** Absolute URL on the published site. */
export const abs = (p = "") => `${BASE}/${p.replace(/^\/+/, "")}`;
export const today = new Date().toISOString().slice(0, 10);

// ---------- text helpers ----------
/** Fills {years}, {city} and {country} in content strings. */
export const fill = (s = "") =>
  String(s)
    .replace(/\{years\}/g, String(site.yearsOfExperience))
    .replace(/\{city\}/g, site.location.city)
    .replace(/\{country\}/g, site.location.country);
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const nameParts = site.name.split(" ");
export const lastName = nameParts[nameParts.length - 1];
export const firstNames = nameParts.slice(0, -1).join(" ");

// ---------- projects ----------
export const category = (id: string): Category => categories.find((c) => c.id === id) ?? { id, name: id, short: id };
/** Category order, featured first inside each category. */
export const ordered: Project[] = categories.flatMap((c) =>
  projects.filter((p) => p.category === c.id).sort((a, b) => Number(b.featured) - Number(a.featured)),
);
export const hasShot = (p: Project) => fs.existsSync(path.join(process.cwd(), "public/assets/projects", `${p.slug}.jpg`));
export const shotPath = (p: Project) => `/assets/projects/${p.slug}.jpg`;

export const cardData = (p: Project): ProjectCardData => ({
  slug: p.slug,
  name: p.name,
  tagline: p.tagline,
  category: p.category,
  featured: p.featured,
  url: p.url,
  overview: p.overview,
  role: p.role,
  metrics: p.metrics,
  stack: p.stack,
  index: ordered.indexOf(p),
  categoryShort: category(p.category).short,
  hasShot: hasShot(p),
});

// ---------- skills ----------
const icons = iconsJson as { skills: Record<string, string>; groups: Record<string, string> };
export const skillChips: SkillChip[] = skills.flatMap((g) =>
  g.items.map((name) => ({ name, icon: icons.skills[name] || icons.groups[g.group] || "code", group: g.group, groupId: slugify(g.group) })),
);

// ---------- contacts ----------
const C = site.contact;
const phoneDigits = (C.whatsapp || "").replace(/\D/g, "");
const telegramUser = (C.telegram || "").replace(/^@/, "");
export const links = {
  email: C.email ? `mailto:${C.email}` : "",
  whatsapp: phoneDigits ? `https://wa.me/${phoneDigits}` : "",
  telegram: telegramUser ? `https://t.me/${telegramUser}` : "",
  linkedin: C.linkedin || "",
};
export const contactCards: ContactCard[] = (
  [
    links.whatsapp && { id: "whatsapp", label: "WhatsApp", value: C.whatsapp, href: links.whatsapp },
    links.telegram && { id: "telegram", label: "Telegram", value: `@${telegramUser}`, href: links.telegram },
    links.linkedin && { id: "linkedin", label: "LinkedIn", value: site.name, href: links.linkedin },
    links.email && { id: "email", label: "Email", value: C.email, href: links.email },
  ] as (ContactCard | "")[]
).filter((c): c is ContactCard => Boolean(c));

// ---------- themes ----------
const themeData = themesJson as unknown as { default: string; themes: Record<string, { name: string; colors: Record<string, string> }> };
export const themeIds = Object.keys(themeData.themes);
export const defaultTheme = themeIds.includes(themeData.default) ? themeData.default : themeIds[0];
export const defaultColors = themeData.themes[defaultTheme].colors;
export const themeList: ThemeInfo[] = themeIds.map((id) => ({ id, name: themeData.themes[id].name, bg: themeData.themes[id].colors["--bg"] }));
/** CSS variables of every theme; the default one also applies when no theme is set. */
export const themesCss = themeIds
  .map((id) => {
    const selector = id === defaultTheme ? `:root,:root[data-theme="${id}"]` : `:root[data-theme="${id}"]`;
    return `${selector}{${Object.entries(themeData.themes[id].colors).map(([k, v]) => `${k}:${v}`).join(";")}}`;
  })
  .join("\n");
/** Runs before the first paint: applies the saved (or ?theme=) theme so the page never flashes the wrong colors. */
export const themeBootScript = `(function(){var d=document.documentElement,t=null,q=location.search.match(/[?&]theme=([\\w-]+)/);try{t=q?q[1]:localStorage.getItem("theme");if(q)localStorage.setItem("theme",t)}catch(e){t=q&&q[1]}if(${JSON.stringify(themeIds)}.indexOf(t)<0)t=${JSON.stringify(defaultTheme)};d.setAttribute("data-theme",t);d.classList.add("js")})()`;

// ---------- structured data ----------
export const person = {
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
