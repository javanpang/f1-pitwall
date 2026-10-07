interface Option<T> {
  value: T;
  label: string;
}

interface Props<T> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * SegmentedControl component that displays a group of buttons for selecting an option from a list.
 */
export default function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-sm border border-carbon-300 bg-carbon-200 p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded-sm px-3 py-1.5 font-mono text-xs font-bold tracking-wider uppercase tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
              active
                ? "bg-accent text-carbon-100"
                : "text-muted hover:bg-accent/5 hover:text-accent"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
