import { S, fill, site, slugify } from "@/lib/content";
import { SectionHeading } from "../ui";

export default function About({ n }: { n: string }) {
  const titleId = `${slugify(S.about.kicker)}-title`;
  const [lead, ...rest] = site.about;
  return (
    <section className="section shell split about-section" id="about" aria-labelledby={titleId}>
      <SectionHeading n={n} kicker={S.about.kicker} title={S.about.title.map(fill)} id={titleId} />
      <div className="about-content reveal">
        <p className="about-lead">{fill(lead)}</p>
        {rest.map((paragraph) => (
          <p className="muted" key={paragraph}>
            {fill(paragraph)}
          </p>
        ))}
        <dl className="about-facts">
          {S.about.facts.map((fact) => (
            <div className="fact" key={fact.label}>
              <span className="fact-icon" aria-hidden="true">
                {fact.icon}
              </span>
              <div>
                <dt>{fill(fact.label)}</dt>
                <dd>{fill(fact.value)}</dd>
              </div>
            </div>
          ))}
        </dl>
        {S.about.quote && <blockquote>{fill(S.about.quote)}</blockquote>}
      </div>
    </section>
  );
}
