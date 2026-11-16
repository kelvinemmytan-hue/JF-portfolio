# Juan Francis Manongdo — Portfolio

A fast, static, SEO-first portfolio. No framework, no backend, no AI features.
Design: dark green + lime theme with tech-blue accents (Manrope + DM Mono), animated particle background,
CI/CD-style experience pipeline, filterable project and skill grids. Colors live at the top of `assets/styles.css`.
All content lives in `content/`; a small Node script builds plain HTML pages into `dist/`.

## Edit content

| File | What it holds |
|---|---|
| `content/site.json` | Name, intro, about, contacts (email, WhatsApp, Telegram, LinkedIn), **site URL**, SEO title/description/keywords, Google/Bing verification codes, education |
| `content/sections.json` | Every section heading, label, button text and the hero background images. `{years}`, `{city}`, `{country}` are filled in automatically |
| `content/themes.json` | The two color themes (Amazon, Editorial) and which one loads first. Visitors switch with the header button; `?theme=editorial` in a link opens that theme |
| `content/skill-icons.json` | Which logo each skill shows |
| `content/experience.json` | Jobs (role, company, period, achievements, stack) |
| `content/skills.json` | Skill groups |
| `content/projects.json` | Categories and projects. `role: null` hides the role until you confirm it |
| `assets/projects/<slug>.jpg` | Project screenshots (960×600). Replace any file to use your own image |

Then rebuild:

```bash
node scripts/build.mjs
```

## Run locally

```bash
node scripts/build.mjs
python -m http.server 8080 --directory dist
```

Open http://localhost:8080

## Screenshots and share image

```bash
node scripts/screenshots.mjs                  # capture missing project screenshots from their live URLs
node scripts/screenshots.mjs roads-audio      # re-capture one project
node scripts/screenshots.mjs --og             # rebuild assets/og-image.jpg from scripts/og-card.html
```

Uses your installed Chrome (or Edge) with a temporary profile.

## What gets generated (dist/)

- `index.html` — home: intro, about, projects by category, experience, skills, education, contact
- `projects/<slug>/index.html` — one page per project (overview, problem, responsibilities, features, impact, stack)
- `404.html`, `sitemap.xml`, `robots.txt`, `site.webmanifest`

## SEO built in

- Unique `<title>` and meta description on every page, canonical URLs
- Open Graph and Twitter cards (share image + project screenshots)
- Structured data: `Person`, `WebSite`, `ProfilePage`, `ItemList`, `BreadcrumbList`
- One `<h1>` per page, semantic sections, alt text on every image, lazy-loaded images with fixed sizes
- System fonts and ~1 KB of JavaScript, for fast loading (Core Web Vitals)
- `sitemap.xml` + `robots.txt`

## Before publishing

1. Set `siteUrl` in `content/site.json` to the real address, then rebuild.
2. Deploy the `dist/` folder (Netlify, Vercel, Cloudflare Pages or GitHub Pages).
3. Add the site to Google Search Console, paste the verification code into `seo.googleSiteVerification`, rebuild, deploy, and submit `sitemap.xml`.
