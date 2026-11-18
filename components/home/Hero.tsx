import { preload } from "react-dom";
import { S, fill, firstNames, lastName, site } from "@/lib/content";
import HeroSlides from "../HeroSlides";

export default function Hero() {
  const images = S.hero.images;
  // The first background image is the largest thing on screen: start loading it early.
  if (images[0]) preload(images[0], { as: "image", fetchPriority: "high" });
  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <HeroSlides images={images} />
      <div className="hero-copy">
        <p className="mono intro">{fill(S.hero.kicker)}</p>
        <h1 id="hero-title">
          {firstNames}
          <br />
          <span>{lastName}.</span>
        </h1>
        <p className="hero-role">{site.jobTitle}</p>
        <p className="hero-description">{fill(site.intro)}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#projects">
            {fill(S.hero.primaryButton)} <span aria-hidden="true">↘</span>
          </a>
          <a className="button button-quiet" href="#contact">
            {fill(S.hero.secondaryButton)} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="hero-meta">
          <span>
            <span className="pin" aria-hidden="true">
              ⌖
            </span>
            {site.location.city}, {site.location.country}
          </span>
          <span className="mono">{fill(S.hero.availability)}</span>
        </p>
      </div>
      <a className="scroll-cue mono" href="#about">
        <span aria-hidden="true">↓</span> {fill(S.hero.scrollCue)}
      </a>
    </section>
  );
}
