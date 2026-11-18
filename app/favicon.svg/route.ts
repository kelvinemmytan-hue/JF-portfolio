import { defaultColors, site } from "@/lib/content";

export const dynamic = "force-static";

/** favicon.svg, drawn from the initial and the default theme's colors (written to a file at build time). */
export function GET() {
  const c = defaultColors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${site.name}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c["--accent-text"]}"/><stop offset="1" stop-color="${c["--accent-2"]}"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="16" fill="${c["--surface"]}" stroke="url(#g)" stroke-width="3"/><text x="27" y="44" text-anchor="middle" font-family="Manrope, Segoe UI, Arial, sans-serif" font-size="32" font-weight="800" fill="#ffffff">${site.initials[0]}</text><circle cx="44" cy="41" r="4.5" fill="${c["--accent"]}"/></svg>\n`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
}
