import { S, contactCards, fill, links, slugify } from "@/lib/content";
import ContactIcon from "../Icons";
import { Ext } from "../ui";

export default function Contact({ n }: { n: string }) {
  const titleId = `${slugify(S.contact.kicker)}-title`;
  return (
    <section className="contact-section" id="contact" aria-labelledby={titleId}>
      <div className="contact-glow" aria-hidden="true" />
      <div className="shell contact-inner">
        <div className="contact-heading reveal">
          <p className="mono section-kicker">
            // {n}. {S.contact.kicker}
          </p>
          <h2 id={titleId}>
            {fill(S.contact.title[0])} <span className="gradient-text">{fill(S.contact.title[1])}</span>
          </h2>
          <p className="muted">{fill(S.contact.text)}</p>
        </div>
        <div className="contact-actions reveal">
          {links.whatsapp && (
            <Ext href={links.whatsapp} className="button button-whatsapp contact-button">
              <ContactIcon id="whatsapp" />
              Chat on WhatsApp
            </Ext>
          )}
          {links.email && (
            <a className="button button-primary contact-button" href={links.email}>
              <ContactIcon id="email" />
              Send an email
            </a>
          )}
        </div>
        <div className="contact-social reveal">
          {contactCards.map((card) => {
            const inner = (
              <>
                <ContactIcon id={card.id} />
                <span className="social-text">
                  <strong>{card.label}</strong>
                  <small>{card.value}</small>
                </span>
                <span className="social-arrow" aria-hidden="true">
                  ↗
                </span>
              </>
            );
            const className = `social-card social-${card.id}`;
            return card.id === "email" ? (
              <a key={card.id} className={className} href={card.href}>
                {inner}
              </a>
            ) : (
              <Ext key={card.id} className={className} href={card.href}>
                {inner}
              </Ext>
            );
          })}
        </div>
      </div>
    </section>
  );
}
