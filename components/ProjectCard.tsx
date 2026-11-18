import Link from "next/link";
import type { ProjectCardData } from "@/lib/types";
import { pad2 } from "@/lib/paths";
import { Ext, Metrics, Shot, StackLine } from "./ui";

type Props = { project: ProjectCardData; hidden?: boolean; liveLabel: string; detailsLabel: string };

/** Card: screenshot + short explanation. Clicking the image or title opens the live site. */
export default function ProjectCard({ project: p, hidden, liveLabel, detailsLabel }: Props) {
  const details = `/projects/${p.slug}/`;
  const shot = <Shot slug={p.slug} name={p.name} tagline={p.tagline} hasShot={p.hasShot} />;
  return (
    <article className={`project-card reveal${p.featured ? " project-featured" : ""}`} data-cat={p.category} hidden={hidden}>
      {p.url ? (
        <a className="project-shot" href={p.url} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true">
          {shot}
        </a>
      ) : (
        <Link className="project-shot" href={details} tabIndex={-1} aria-hidden="true">
          {shot}
        </Link>
      )}
      <div className="project-body">
        <p className="art-number mono">
          {pad2(p.index + 1)} / {p.categoryShort.toUpperCase()}
        </p>
        <StackLine stack={p.stack} />
        <h3>
          {p.url ? (
            <Ext href={p.url}>
              {p.name}
              <span className="visually-hidden"> (opens live site)</span>
            </Ext>
          ) : (
            <Link href={details}>{p.name}</Link>
          )}
        </h3>
        <p className="muted">{p.overview}</p>
        {p.role && (
          <p className="project-role mono">
            ROLE · <span>{p.role}</span>
          </p>
        )}
        <Metrics metrics={p.metrics} />
        <div className="project-actions">
          {p.url && (
            <Ext href={p.url} className="project-link project-demo">
              {liveLabel} <span aria-hidden="true">↗</span>
            </Ext>
          )}
          <Link className="project-link" href={details}>
            {detailsLabel}
            <span className="visually-hidden">: {p.name}</span> <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
