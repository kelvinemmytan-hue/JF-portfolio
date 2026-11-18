import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { abs, category, hasShot, ordered, person, shotPath, site, today } from "@/lib/content";
import { hostname, pad2 } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import { Checks, Ext, JsonLd, Metrics, Shot, StackLine, StackTags } from "@/components/ui";

type Params = { params: Promise<{ slug: string }> };

// One static page per project in content/projects.json; anything else is a 404.
export const dynamicParams = false;
export const generateStaticParams = () => ordered.map((p) => ({ slug: p.slug }));

const find = (slug: string) => ordered.find((p) => p.slug === slug);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = find((await params).slug);
  if (!p) return {};
  // Google shows about 60 characters: keep the tagline only when it fits.
  const title = [`${p.name} — ${p.tagline} | ${site.name}`, `${p.name} | ${site.name}`].find((t) => t.length <= 62) || p.name;
  const description = `${`${p.name}: ${p.overview}`.slice(0, 158).replace(/\s+\S*$/, "")}…`;
  return pageMetadata({
    title,
    description,
    path: `projects/${p.slug}/`,
    image: hasShot(p) ? shotPath(p) : undefined,
    imageAlt: `${p.name} website screenshot`,
    type: "article",
  });
}

export default async function ProjectPage({ params }: Params) {
  const p = find((await params).slug);
  if (!p) notFound();

  const i = ordered.indexOf(p);
  const prev = ordered[(i - 1 + ordered.length) % ordered.length];
  const next = ordered[(i + 1) % ordered.length];
  const cat = category(p.category);
  const shot = <Shot slug={p.slug} name={p.name} tagline={p.tagline} hasShot={hasShot(p)} eager />;
  const pageUrl = abs(`projects/${p.slug}/`);

  const facts = [
    ["Category", cat.name],
    ["Type", p.type],
    p.company && ["Company", p.company],
    p.role && ["My role", p.role],
    p.period && ["Period", p.period],
  ].filter(Boolean) as [string, string][];

  // Only the blocks that have content are shown, numbered in order.
  const blocks = [
    ["Product overview", <p className="muted" key="o">{p.overview}</p>],
    p.problem && ["Business problem", <p className="muted" key="p">{p.problem}</p>],
    p.contributions && ["My responsibilities", <Checks items={p.contributions} key="c" />],
    p.technical && ["Technical implementation", <Checks items={p.technical} key="t" />],
    p.features && ["Key features", <Checks items={p.features} key="f" />],
    (p.metrics || p.impact) && [
      "Results and impact",
      <Fragment key="r">
        <Metrics metrics={p.metrics} />
        {p.impact && <Checks items={p.impact} />}
      </Fragment>,
    ],
  ].filter(Boolean) as [string, React.ReactNode][];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: p.name,
        about: {
          "@type": "CreativeWork",
          name: p.name,
          description: p.overview,
          genre: cat.name,
          keywords: p.stack.join(", "),
          ...(p.url && { url: p.url }),
          ...(hasShot(p) && { image: abs(shotPath(p)) }),
          ...(p.role && { contributor: { "@id": abs("#person") } }),
        },
        author: { "@id": abs("#person") },
        dateModified: today,
        inLanguage: "en",
      },
      person,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: abs() },
          { "@type": "ListItem", position: 2, name: "Projects", item: abs("#projects") },
          { "@type": "ListItem", position: 3, name: p.name, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <article className="shell detail">
      <JsonLd data={structuredData} />
      <nav className="breadcrumb mono" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/">HOME</Link>
          </li>
          <li>
            <Link href="/#projects">PROJECTS</Link>
          </li>
          <li aria-current="page">{p.name.toUpperCase()}</li>
        </ol>
      </nav>

      <header className="detail-head">
        <p className="mono intro">
          // {pad2(i + 1)} / {cat.short.toUpperCase()}
        </p>
        <h1>
          {p.name}
          <span className="gradient-text">.</span>
        </h1>
        <p className="hero-role">{p.tagline}</p>
        <StackLine stack={p.stack} max={8} />
        <div className="hero-actions">
          {p.url && (
            <Ext href={p.url} className="button button-primary">
              Visit live site <span aria-hidden="true">↗</span>
            </Ext>
          )}
          <Link className="button button-quiet" href="/#projects">
            All projects <span aria-hidden="true">←</span>
          </Link>
        </div>
      </header>

      <figure className="detail-shot">
        {p.url ? <Ext href={p.url}>{shot}</Ext> : shot}
        {p.url && (
          <figcaption className="mono">
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {hostname(p.url)}
          </figcaption>
        )}
      </figure>

      <div className="detail-grid">
        <div className="detail-main">
          {blocks.map(([title, content], n) => (
            <section className="detail-block reveal" key={title}>
              <p className="mono section-kicker">// {pad2(n + 1)}</p>
              <h2>{title}</h2>
              {content}
            </section>
          ))}
        </div>
        <aside className="detail-side">
          <dl className="side-card">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="mono">{label.toUpperCase()}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            {p.url && (
              <div>
                <dt className="mono">WEBSITE</dt>
                <dd>
                  <Ext href={p.url}>{hostname(p.url)} ↗</Ext>
                </dd>
              </div>
            )}
          </dl>
          {p.stack.length > 0 && (
            <div className="side-card">
              <p className="mono section-kicker">TECH STACK</p>
              <StackTags stack={p.stack} />
            </div>
          )}
          <div className="side-card side-cta">
            <p className="mono section-kicker">NEED SOMETHING SIMILAR?</p>
            <Link className="button button-primary" href="/#contact">
              Let&apos;s talk <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </aside>
      </div>

      <nav className="pager" aria-label="More projects">
        <Link href={`/projects/${prev.slug}/`}>
          <span className="mono">← PREVIOUS</span>
          {prev.name}
        </Link>
        <Link href={`/projects/${next.slug}/`}>
          <span className="mono">NEXT →</span>
          {next.name}
        </Link>
      </nav>
    </article>
  );
}
