/** Small, honest marker for anything conceptual or not yet final. */
export function ConceptTag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`t-eyebrow !text-faint flex items-center gap-3 ${className}`}>
      <span aria-hidden className="inline-block size-[5px] rounded-full border border-[var(--c-satin-mist)]" />
      {children}
    </p>
  );
}
