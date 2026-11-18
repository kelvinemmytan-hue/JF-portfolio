type Props = { label: string; options: { id: string; name: string }[]; active: string; onChange: (id: string) => void };

/** Row of filter buttons ("All" + one per option). */
export default function FilterTabs({ label, options, active, onChange }: Props) {
  return (
    <div className="filter-tabs" role="group" aria-label={label}>
      {[{ id: "all", name: "All" }, ...options].map((option) => (
        <button key={option.id} type="button" className={`filter-tab${active === option.id ? " is-active" : ""}`} aria-pressed={active === option.id} onClick={() => onChange(option.id)}>
          {option.name}
        </button>
      ))}
    </div>
  );
}
