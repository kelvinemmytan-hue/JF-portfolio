import type { MetadataRoute } from "next";
import { defaultColors, site } from "@/lib/content";
import { asset } from "@/lib/paths";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    start_url: asset("/"),
    display: "browser",
    background_color: defaultColors["--bg"],
    theme_color: defaultColors["--bg"],
    icons: [{ src: asset("/favicon.svg"), sizes: "any", type: "image/svg+xml" }],
  };
}
