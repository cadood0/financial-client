export function LayoutLoading({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="bg-muted/40 flex h-dvh flex-col items-center justify-center gap-3">
      <div
        className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent"
        aria-hidden
      />
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
