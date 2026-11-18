import { S, fill, site, slugify } from "@/lib/content";
import { SectionHeading } from "../ui";

export default function Education({ n }: { n: string }) {
  const titleId = `${slugify(S.education.kicker)}-title`;
  return (
    <section className="section shell split education-section" id="education" aria-labelledby={titleId}>
      <SectionHeading n={n} kicker={S.education.kicker} title={S.education.title.map(fill)} id={titleId} />
      <ul className="education-list reveal">
        {site.education.map((edu) => (
          <li key={edu.school + edu.degree}>
            <span className="edu-logo mono" aria-hidden="true">
              {edu.school
                .split(" ")
                .map((word) => word[0])
                .join("")}
            </span>
            <span className="edu-text">
              <strong>{edu.degree}</strong>
              <span>
                {edu.school} · {edu.location} · {edu.period}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
