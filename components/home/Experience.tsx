import { Fragment } from "react";
import { S, experience, fill, slugify } from "@/lib/content";
import { Checks, Ext, SectionHeading, StackTags } from "../ui";

/** Experience shown as a CI/CD pipeline: one stage per job (oldest first), then a "job log" card for each. */
export default function Experience({ n }: { n: string }) {
  const titleId = `${slugify(S.experience.kicker)}-title`;
  const total = experience.length;
  const oldestFirst = [...experience].reverse();
  return (
    <section className="section shell split experience-section" id="experience" aria-labelledby={titleId}>
      <SectionHeading n={n} kicker={S.experience.kicker} title={S.experience.title.map(fill)} id={titleId} />
      <div className="pipeline-column">
        <ol className="pipeline reveal" aria-label="Career path, oldest to newest">
          {oldestFirst.map((job, i) => (
            <Fragment key={job.company}>
              {i > 0 && <li className="pipe-link" aria-hidden="true" />}
              <li>
                <a className="pipe-stage" href={`#job-${experience.indexOf(job) + 1}`}>
                  <span className="pipe-icon" aria-hidden="true">
                    ✓
                  </span>
                  <span className="pipe-name">{job.company}</span>
                  <span className="pipe-meta mono">{job.period.replace(/\d{2}\//g, "").replace(" – ", " → ")}</span>
                </a>
              </li>
            </Fragment>
          ))}
        </ol>
        <ol className="timeline">
          {experience.map((job, i) => (
            <li className="job reveal" id={`job-${i + 1}`} key={job.company}>
              <p className="job-log mono">
                $ job {total - i}/{total} · passed
              </p>
              <p className="job-period mono">
                {job.period} · {job.location.toUpperCase()}
              </p>
              <h3>{job.role}</h3>
              <p className="job-company">
                <Ext href={job.url}>{job.company}</Ext>
              </p>
              <p className="job-overview muted">{job.overview}</p>
              <Checks items={job.achievements} />
              <StackTags stack={job.stack} label={S.experience.stackLabel} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
