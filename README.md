# Juan Francis Manongdo — Portfolio

An SEO-first portfolio built with **Next.js (React) and TypeScript**, exported as a fully static site:
every page is plain HTML at build time, so search engines see all the content. No backend, no AI features.

Design: dark green + lime theme with tech-blue accents (Manrope + DM Mono), animated particle background,
CI/CD-style experience pipeline, filterable project and skill grids, and a second "Editorial" theme.

## Commands

```bash
npm install        # once
npm run dev        # preview at http://localhost:3000 with live reload
npm run build      # build the static site into out/
npm run preview    # serve out/ at http://localhost:8080
```

## Edit content

All content lives in `content/`. Nothing personal is written in the components.

| File | What it holds |
|---|---|
| `content/site.json` | Name, intro, about, contacts (email, WhatsApp, Telegram, LinkedIn), **site URL**, SEO title/description/keywords, Google/Bing verification codes, education |
| `content/sections.json` | Every section heading, label, button text and the hero background images. `{years}`, `{city}`, `{country}` are filled in automatically |
| `content/experience.json` | Jobs (role, company, period, achievements, stack) |
| `content/skills.json` | Skill groups |
| `content/skill-icons.json` | Which logo each skill shows |
| `content/projects.json` | Categories and projects (role, responsibilities, features, metrics, stack) |
| `content/themes.json` | The two color themes (Amazon, Editorial) and which one loads first. Visitors switch with the header button; `?theme=editorial` in a link opens that theme |
| `public/assets/projects/<slug>.jpg` | Project screenshots (960×600). Replace any file to use your own image |

After editing, `npm run dev` shows the change at once; `npm run build` rebuilds the site.

## Project structure

```
app/
  layout.tsx              Shared page shell: fonts, theme colors, header, footer, background
  page.tsx                Home page
  projects/[slug]/page.tsx  One page per project (generated for every project in content/)
  not-found.tsx           404 page
  sitemap.ts · robots.ts · manifest.ts · favicon.svg/route.ts   Generated SEO files
  globals.css             All styling (colors come from content/themes.json)
components/
  home/                   Hero, About, Experience, Education, Contact sections
  Header.tsx              Navigation, theme switcher, mobile menu, reading progress   (interactive)
  ProjectsBrowser.tsx     Category filter + project grids                             (interactive)
  SkillsBrowser.tsx       Skill filter + grid                                         (interactive)
  ParticleCanvas.tsx · HeroSlides.tsx · Effects.tsx   Background, slideshow, scroll reveal (interactive)
  ProjectCard.tsx · Footer.tsx · Brand.tsx · Icons.tsx · FilterTabs.tsx · ui.tsx
lib/
  content.ts              Loads content/*.json and derives links, themes, structured data (server only)
  seo.ts                  Title, description, canonical URL and link-preview tags per page
  paths.ts · types.ts
scripts/
  screenshots.mjs         Captures project screenshots and the share image
  postbuild.mjs           Fixes prefetch file names in the static export (runs inside npm run build)
```

## Screenshots and share image

```bash
npm run screenshots                 # capture missing project screenshots from their live URLs
npm run screenshots -- roads-audio  # re-capture one project
npm run og                          # rebuild public/assets/og-image.jpg from scripts/og-card.html
```

Uses your installed Chrome (or Edge) with a temporary profile.

## SEO built in

- Every page is pre-rendered HTML with a unique `<title>`, meta description and canonical URL
- Open Graph and Twitter cards (share image + project screenshots)
- Structured data: `Person`, `WebSite`, `ProfilePage`, `ItemList`, `BreadcrumbList`
- One `<h1>` per page, semantic sections, alt text on every image, lazy-loaded images with fixed sizes
- Fonts are served from the site itself (no request to Google) and preloaded
- `sitemap.xml`, `robots.txt` and a web manifest are generated

## Before publishing

1. Set `siteUrl` in `content/site.json` to the real address, then `npm run build`.
   On Vercel this is automatic: production builds use the project's production domain (custom domain if one
   is added, otherwise the `*.vercel.app` one). Set a `SITE_URL` environment variable to override it.
2. Deploy the `out/` folder (Netlify, Vercel, Cloudflare Pages or GitHub Pages).
   If the site will live in a sub-folder (for example `username.github.io/JF-portfolio`), build with
   `NEXT_PUBLIC_BASE_PATH=/JF-portfolio`.
3. Add the site to Google Search Console, paste the verification code into `seo.googleSiteVerification`,
   rebuild, deploy, and submit `sitemap.xml`.
