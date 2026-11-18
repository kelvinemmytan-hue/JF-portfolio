import Link from "next/link";

/** Logo mark + name; links to the top of the home page. */
export default function Brand({ name, initial, label }: { name: string; initial: string; label?: string }) {
  return (
    <Link className="brand" href="/#top" aria-label={label}>
      <span className="brand-mark" aria-hidden="true">
        {initial}
        <span>.</span>
      </span>
      <span className="brand-name">{name}</span>
    </Link>
  );
}
