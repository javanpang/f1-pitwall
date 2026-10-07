const SIZES = {
  sm: {
    bars: ["w-3", "w-2", "w-1"],
    bar: "h-0.5",
    gap: "gap-0.5",
    text: "text-sm",
  },
  lg: {
    bars: ["w-6", "w-4", "w-2"],
    bar: "h-0.75",
    gap: "gap-0.75",
    text: "text-xl",
  },
} as const;

/**
 * Logo component that displays the PitWall logo with customizable size
 */
export default function Logo({ size = "lg" }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div className="flex items-center gap-1">
      <div className={`flex flex-col items-end ${s.gap}`} aria-hidden="true">
        {s.bars.map((w) => (
          <div key={w} className={`${s.bar} ${w} bg-accent`} />
        ))}
      </div>
      <span className={`${s.text} font-bold tracking-widest uppercase`}>
        PIT<span className="text-accent">WALL</span>
      </span>
    </div>
  );
}
