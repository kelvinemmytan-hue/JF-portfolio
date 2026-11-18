import { contactCards, site } from "@/lib/content";
import Brand from "./Brand";
import { Ext } from "./ui";

export default function Footer() {
  return (
    <footer className="footer shell">
      <Brand name={site.name} initial={site.initials[0]} />
      <p className="footer-copy mono">
        © {new Date().getFullYear()} {site.name.toUpperCase()} · {site.jobTitle.toUpperCase()}
      </p>
      <p className="footer-links mono">
        {contactCards.map((c) =>
          c.id === "email" ? (
            <a key={c.id} href={c.href}>
              EMAIL
            </a>
          ) : (
            <Ext key={c.id} href={c.href}>
              {c.label.toUpperCase()} ↗
            </Ext>
          ),
        )}
        <a href="#top">BACK TO TOP ↑</a>
      </p>
    </footer>
  );
}
