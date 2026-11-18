import type { Metadata } from "next";
import Link from "next/link";
import { S, fill, site } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({ title: `Page not found | ${site.name}`, description: S.notFound.text, path: "404.html" }),
  robots: { index: false },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <section className="hero shell hero-small">
      <div className="hero-copy">
        <p className="mono intro">// 404</p>
        <h1>
          {fill(S.notFound.title[0])}
          <br />
          <span>{fill(S.notFound.title[1])}</span>
        </h1>
        <p className="hero-description">{fill(S.notFound.text)}</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/">
            Go home <span aria-hidden="true">↗</span>
          </Link>
          <Link className="button button-quiet" href="/#projects">
            See projects <span aria-hidden="true">↘</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
