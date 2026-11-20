import { cn } from "@/lib/utils";

export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex w-full flex-col gap-6 p-4 sm:p-8", className)}>{children}</div>;
}

export function TableFrame({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-lg border border-border bg-card">{children}</div>;
}

export const HEAD_CELL = "h-11 bg-muted px-3 text-xs font-semibold text-muted-foreground";
export const BODY_CELL = "px-3 py-3 text-[13px]";
