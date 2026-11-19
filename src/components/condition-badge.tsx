import { cn } from "@/lib/utils";
import { conditionLabel } from "@/lib/labels";

const TONES: Record<string, string> = {
  baik: "bg-good-light text-good",
  rusak_ringan: "bg-minor-light text-minor",
  rusak_sedang: "bg-moderate-light text-moderate",
  rusak_berat: "bg-severe-light text-severe",
};

const UNKNOWN_TONE = "bg-muted text-muted-foreground";

/** The condition of a structure, canal or report. The wording carries the meaning; colour only supports it. */
export function ConditionBadge({ condition, className }: { condition: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold whitespace-nowrap",
        (condition && TONES[condition]) || UNKNOWN_TONE,
        className,
      )}
    >
      {conditionLabel(condition)}
    </span>
  );
}

/** A neutral marker for a data flag such as "jauh dari saluran". */
export function FlagBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border border-input bg-card px-2 text-xs font-medium whitespace-nowrap text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
