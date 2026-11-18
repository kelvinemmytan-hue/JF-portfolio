"use client";

import { useState } from "react";
import type { ProjectCardData } from "@/lib/types";
import FilterTabs from "./FilterTabs";
import ProjectCard from "./ProjectCard";

type Props = {
  categories: { id: string; name: string }[];
  featured: ProjectCardData[];
  more: ProjectCardData[];
  labels: { featured: string; more: string; live: string; details: string };
};

/** Category filter + the two project grids. Every card stays in the HTML (hidden, not removed) so search engines see all of them. */
export default function ProjectsBrowser({ categories, featured, more, labels }: Props) {
  const [filter, setFilter] = useState("all");
  const isHidden = (p: ProjectCardData) => filter !== "all" && p.category !== filter;

  const group = (title: string, items: ProjectCardData[], compact: boolean) => (
    <>
      <p className="projects-group-title mono" hidden={items.every(isHidden)}>
        {title}
      </p>
      <div className={`projects-grid${compact ? " projects-compact" : ""}`}>
        {items.map((p) => (
          <ProjectCard key={p.slug} project={p} hidden={isHidden(p)} liveLabel={labels.live} detailsLabel={labels.details} />
        ))}
      </div>
    </>
  );

  return (
    <>
      <FilterTabs label="Filter projects by category" options={categories} active={filter} onChange={setFilter} />
      {group(labels.featured, featured, false)}
      {group(labels.more, more, true)}
    </>
  );
}
