// Small presentational pieces shared by the home page and the project pages.
import { Fragment } from "react";
import type { Metric } from "@/lib/types";
import { asset } from "@/lib/paths";

/** Link that opens in a new tab. */
export function Ext({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  );
}

/** A heading whose second line uses the theme gradient. */
export function TwoLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines[0]}
      <br />
      <span className="gradient-text">{lines[1]}</span>
    </>
  );
}

export function SectionHeading({ n, kicker, title, id }: { n: string; kicker: string; title: string[]; id: string }) {
  return (
    <div className="section-heading">
      <p className="mono section-kicker">
        // {n}. {kicker}
      </p>
      <h2 id={id}>
        <TwoLines lines={title} />
      </h2>
    </div>
  );
}

export function Aside({ lines }: { lines: string[] }) {
  return (
    <p className="muted section-aside">
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </p>
  );
}

export function Checks({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function StackLine({ stack, max = 4 }: { stack: string[]; max?: number }) {
  if (!stack.length) return null;
  return <p className="project-type mono">{stack.slice(0, max).join(" · ")}</p>;
}

export function StackTags({ stack, label }: { stack: string[]; label?: string }) {
  if (!stack.length) return null;
  return (
    <ul className="job-stack mono" data-label={label}>
      {stack.map((tech) => (
        <li key={tech}>{tech}</li>
      ))}
    </ul>
  );
}

export function Metrics({ metrics }: { metrics?: Metric[] }) {
  if (!metrics?.length) return null;
  return (
    <ul className="project-metrics">
      {metrics.map((m) => (
        <li key={m.label}>
          <strong className="mono">{m.value}</strong>
          {m.label}
        </li>
      ))}
    </ul>
  );
}

/** Project screenshot, or a styled placeholder when there is none. */
export function Shot({ slug, name, tagline, hasShot, eager = false }: { slug: string; name: string; tagline: string; hasShot: boolean; eager?: boolean }) {
  if (!hasShot) {
    return (
      <span className="shot-placeholder" role="img" aria-label={name}>
        <span>{name}</span>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export: plain <img> with fixed size
    <img
      src={asset(`/assets/projects/${slug}.jpg`)}
      alt={`${name} — ${tagline} (website screenshot)`}
      width={960}
      height={600}
      decoding="async"
      {...(eager ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
    />
  );
}

/** Structured data for search engines. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
