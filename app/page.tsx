import type { Metadata } from "next";
import { S, abs, cardData, categories, fill, ordered, person, projects, site, skillChips, skills, slugify, today } from "@/lib/content";
import { pad2 } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import About from "@/components/home/About";
import Contact from "@/components/home/Contact";
import Education from "@/components/home/Education";
import Experience from "@/components/home/Experience";
import Hero from "@/components/home/Hero";
import ProjectsBrowser from "@/components/ProjectsBrowser";
import SkillsBrowser from "@/components/SkillsBrowser";
import { Aside, JsonLd, SectionHeading } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: site.seo.title,
  description: fill(site.seo.description),
  imageAlt: `${site.name} — ${site.jobTitle}`,
  type: "profile",
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    person,
    { "@type": "WebSite", "@id": abs("#website"), url: abs(), name: site.name, inLanguage: "en", publisher: { "@id": abs("#person") } },
    { "@type": "ProfilePage", "@id": abs("#profile"), url: abs(), name: site.seo.title, mainEntity: { "@id": abs("#person") }, isPartOf: { "@id": abs("#website") }, dateModified: today },
    { "@type": "ItemList", name: "Projects", itemListElement: ordered.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`projects/${p.slug}/`), name: p.name })) },
  ],
};

export default function HomePage() {
  const cards = ordered.map(cardData);
  const projectsTitleId = `${slugify(S.projects.kicker)}-title`;
  const skillsTitleId = `${slugify(S.skills.kicker)}-title`;
  // Sections are numbered in the order they appear.
  let section = 0;
  const next = () => pad2(++section);

  return (
    <>
      <JsonLd data={structuredData} />
      <Hero />
      <About n={next()} />
      <Experience n={next()} />

      <section className="section shell projects-section" id="projects" aria-labelledby={projectsTitleId}>
        <div className="section-topline">
          <SectionHeading n={next()} kicker={S.projects.kicker} title={S.projects.title.map(fill)} id={projectsTitleId} />
          <Aside lines={S.projects.aside.map(fill)} />
        </div>
        <ProjectsBrowser
          categories={categories.filter((c) => projects.some((p) => p.category === c.id)).map((c) => ({ id: c.id, name: c.short }))}
          featured={cards.filter((p) => p.featured)}
          more={cards.filter((p) => !p.featured)}
          labels={{ featured: fill(S.projects.featuredLabel), more: fill(S.projects.moreLabel), live: S.projects.liveButton, details: S.projects.detailsButton }}
        />
      </section>

      <section className="section shell skills-section" id="skills" aria-labelledby={skillsTitleId}>
        <div className="section-topline">
          <SectionHeading n={next()} kicker={S.skills.kicker} title={S.skills.title.map(fill)} id={skillsTitleId} />
          <Aside lines={S.skills.aside.map(fill)} />
        </div>
        <SkillsBrowser groups={skills.map((g) => ({ id: slugify(g.group), name: g.group }))} chips={skillChips} />
      </section>

      <Education n={next()} />
      <Contact n={next()} />
    </>
  );
}
