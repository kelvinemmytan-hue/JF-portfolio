import type { MetadataRoute } from "next";
import { abs, ordered, today } from "@/lib/content";

export const dynamic = "force-static";

/** sitemap.xml: the home page and one entry per project page. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [abs(), ...ordered.map((p) => abs(`projects/${p.slug}/`))].map((url) => ({ url, lastModified: today }));
}
