export type Metric = { value: string; label: string };

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  featured: boolean;
  url: string | null;
  type: string;
  company?: string;
  role?: string | null;
  period?: string;
  overview: string;
  problem?: string;
  contributions?: string[];
  technical?: string[];
  features?: string[];
  impact?: string[];
  metrics?: Metric[];
  stack: string[];
};

export type Category = { id: string; name: string; short: string };

/** What a project card needs; prepared on the server and passed to the client filter. */
export type ProjectCardData = Pick<Project, "slug" | "name" | "tagline" | "category" | "featured" | "url" | "overview" | "role" | "metrics" | "stack"> & {
  index: number;
  categoryShort: string;
  hasShot: boolean;
};

export type SkillChip = { name: string; icon: string; group: string; groupId: string };

export type ThemeInfo = { id: string; name: string; bg: string };

export type ContactId = "email" | "whatsapp" | "telegram" | "linkedin";
export type ContactCard = { id: ContactId; label: string; value: string; href: string };
