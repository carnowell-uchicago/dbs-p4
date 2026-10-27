// Loading placeholder: a dim block with a slow shimmer (motion only if the user allows it).
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block rounded-(--dk-r-sm) bg-(--dk-raised) motion-safe:animate-pulse ${className}`}
    />
  );
}
