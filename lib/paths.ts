// Safe to import from client components (no file-system access here).

/** Sub-folder the site is served from; empty for a domain root. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Path of a file in public/, e.g. asset("/assets/og-image.jpg"). */
export const asset = (p: string) => `${basePath}${p}`;

export const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, "");

export const pad2 = (n: number) => String(n).padStart(2, "0");
