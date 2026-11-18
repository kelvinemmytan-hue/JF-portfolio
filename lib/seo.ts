import type { Metadata } from "next";
import { abs, site } from "./content";

type PageSeo = {
  title: string;
  description: string;
  /** Path on the site, e.g. "projects/hebbia-matrix/". Empty for the home page. */
  path?: string;
  /** Path of the share image inside public/. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "profile" | "article";
};

/** Title, description, canonical URL and link-preview tags for one page. */
export function pageMetadata({ title, description, path = "", image = "/assets/og-image.jpg", imageAlt, type = "website" }: PageSeo): Metadata {
  const url = abs(path);
  const images = [{ url: abs(image), alt: imageAlt || title }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type, siteName: site.name, title, description, url, images, locale: "en_US" },
    twitter: { card: "summary_large_image", title, description, images: [abs(image)] },
  };
}
