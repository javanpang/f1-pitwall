import type { ReactNode } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface DataPanelProps<T> {
  label: string;
  title?: string;
  state: AsyncState<T>;
  isEmpty?: (data: T) => boolean;
  emptyMessage?: string;
  className?: string;
  children: (data: T) => ReactNode;
}

export function DataPanel<T>({
  label,
  title,
  state: { data, loading, error },
  isEmpty,
  emptyMessage = "No data available.",
  className = "",
  children,
}: DataPanelProps<T>) {
  let content: ReactNode;

  if (loading && !data) {
    content = (
      <div
        role="status"
        aria-label={`Loading ${label}`}
        className="size-full min-h-24 animate-pulse bg-carbon-300"
      />
    );
  } else if (!data) {
    content = (
      <p
        role="alert"
        className="p-4 font-mono text-xs tracking-widest text-live uppercase"
      >
        Feed error - {error ?? "No data"}
      </p>
    );
  } else if (isEmpty?.(data)) {
    content = (
      <p className="p-4 font-mono text-sm text-muted">{emptyMessage}</p>
    );
  } else {
    content = (
      <>
        {error && (
          <p role="alert" className="font-mono text-xs text-live uppercase">
            Feed interrupted - showing last known data
          </p>
        )}
        {children(data)}
      </>
    );
  }

  return (
    <section
      aria-label={label}
      className={`flex min-h-0 flex-col border border-accent/20 bg-carbon-200 ${className}`}
    >
      {title && (
        <h2 className="shrink-0 border-b border-carbon-300 px-1 py-1 font-mono text-[10px] font-medium tracking-widest text-muted uppercase">
          {title}
        </h2>
      )}
      {content}
    </section>
  );
}
