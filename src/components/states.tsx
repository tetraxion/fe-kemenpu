import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/api";

export function LoadingRows({ rows = 6, label }: { rows?: number; label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-2.5">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function ErrorState({ title, error, onRetry }: { title: string; error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-severe/30 bg-severe-light p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-severe">{title}</p>
        <p className="text-[13px] leading-normal text-foreground">{errorMessage(error)}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="lg" className="bg-card" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-dashed border-input bg-card p-6 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {note ? <p className="text-[13px] leading-normal text-muted-foreground">{note}</p> : null}
    </div>
  );
}
