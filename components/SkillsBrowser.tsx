"use client";

import { useState } from "react";
import type { SkillChip } from "@/lib/types";
import { asset } from "@/lib/paths";
import FilterTabs from "./FilterTabs";

/** Skill tiles with a filter per skill group. */
export default function SkillsBrowser({ groups, chips }: { groups: { id: string; name: string }[]; chips: SkillChip[] }) {
  const [filter, setFilter] = useState("all");
  return (
    <>
      <FilterTabs label="Filter skills by area" options={groups} active={filter} onChange={setFilter} />
      <ul className="skills-grid">
        {chips.map((chip) => (
          <li key={`${chip.groupId}-${chip.name}`} className="skill-chip reveal" data-cat={chip.groupId} hidden={filter !== "all" && chip.groupId !== filter}>
            {/* eslint-disable-next-line @next/next/no-img-element -- small decorative SVG */}
            <img className="skill-icon" src={asset(`/assets/skills/${chip.icon}.svg`)} alt="" width={26} height={26} loading="lazy" />
            <strong>{chip.name}</strong>
            <span className="mono">{chip.group.toUpperCase()}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
