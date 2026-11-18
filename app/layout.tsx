import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { BASE, defaultColors, defaultTheme, fill, site, themeBootScript, themeList, themesCss } from "@/lib/content";
import { asset } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import Effects from "@/components/Effects";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ParticleCanvas from "@/components/ParticleCanvas";
import "./globals.css";

// Fonts come from npm packages and are served from this site: no request to Google, and builds work offline.
// adjustFontFallback is off so symbols the fonts lack (✓ → ↗ …) fall back to the system fonts listed in globals.css.
const manrope = localFont({
  src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
  adjustFontFallback: false,
});
const dmMono = localFont({
  src: [
    { path: "../node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../node_modules/@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-dm-mono",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(`${BASE}/`),
  ...pageMetadata({ title: site.seo.title, description: fill(site.seo.description) }),
  authors: [{ name: site.name }],
  robots: { index: true, follow: true, "max-image-preview": "large" },
  icons: { icon: { url: asset("/favicon.svg"), type: "image/svg+xml" } },
  verification: {
    ...(site.seo.googleSiteVerification && { google: site.seo.googleSiteVerification }),
    ...(site.seo.bingSiteVerification && { other: { "msvalidate.01": site.seo.bingSiteVerification } }),
  },
};

export const viewport: Viewport = { themeColor: defaultColors["--bg"] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the script below sets data-theme and the "js" class before React starts.
    <html lang="en" className={`${manrope.variable} ${dmMono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <style dangerouslySetInnerHTML={{ __html: themesCss }} />
      </head>
      <body id="top">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="bg-aurora" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <ParticleCanvas />
        <Header name={site.name} initial={site.initials[0]} themes={themeList} defaultTheme={defaultTheme} />
        <main id="main">{children}</main>
        <Footer />
        <Effects />
      </body>
    </html>
  );
}
