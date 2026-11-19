"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useId, useState } from "react";

import { CONDITIONS, CONDITION_LABELS, KINDS, KIND_LABELS } from "@/lib/labels";
import { CONDITION_DASH, CONDITION_HEX, IMPACT_HEX, PLOT_HEX, UNKNOWN_HEX, kindSymbol } from "@/lib/map-style";

function LineSample({ color, dash, weight }: { color: string; dash?: string; weight: number }) {
  return (
    <svg width="34" height="12" viewBox="0 0 34 12" aria-hidden="true" className="shrink-0">
      <line x1="1" y1="6" x2="33" y2="6" stroke={color} strokeWidth={weight} strokeDasharray={dash} />
    </svg>
  );
}

function AreaSample({ color, opacity }: { color: string; opacity: number }) {
  return (
    <svg width="34" height="14" viewBox="0 0 34 14" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="32" height="12" rx="2" fill={color} fillOpacity={opacity} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    // Not headings: the legend sits before the page title in the document, and
    // headings here would put it ahead of that title in the outline.
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-brand">{title}</p>
      <ul aria-label={title} className="flex flex-col gap-1.5">
        {children}
      </ul>
    </div>
  );
}

function Row({ sample, label }: { sample: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-xs leading-tight text-foreground">
      {sample}
      <span>{label}</span>
    </li>
  );
}

/** Explains every colour, dash pattern, line width and symbol used on the map. */
export function MapLegend() {
  // Open on a wide screen. On a phone it would cover most of the map, so it
  // starts folded there. This component only renders in the browser, after
  // the map layers have loaded, so reading the viewport here is safe.
  const [open, setOpen] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const panelId = useId();

  return (
    <section
      aria-label="Legenda peta"
      className="absolute bottom-3 left-3 z-[500] flex max-h-[calc(100%-7.5rem)] w-56 max-w-[calc(100%-1.5rem)] flex-col rounded-lg border border-border bg-card shadow-md"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full shrink-0 items-center justify-between gap-2 rounded-lg px-3 text-[13px] font-semibold text-brand hover:bg-muted active:bg-brand-light lg:min-h-10"
      >
        Legenda
        {open ? <ChevronDown aria-hidden="true" className="size-4" /> : <ChevronUp aria-hidden="true" className="size-4" />}
      </button>
      <div id={panelId} hidden={!open} className="scrollbar-thin flex flex-col gap-3.5 overflow-y-auto px-3 pt-1 pb-3">
        <Group title="Kondisi saluran dan bangunan">
          {CONDITIONS.map((condition) => (
            <Row
              key={condition}
              label={CONDITION_LABELS[condition]}
              sample={<LineSample color={CONDITION_HEX[condition]} dash={CONDITION_DASH[condition]} weight={4} />}
            />
          ))}
        </Group>
        <Group title="Tingkat saluran">
          <Row label="Primer (garis tebal)" sample={<LineSample color={UNKNOWN_HEX} weight={6} />} />
          <Row label="Sekunder (garis tipis)" sample={<LineSample color={UNKNOWN_HEX} weight={3} />} />
        </Group>
        <Group title="Jenis bangunan">
          {KINDS.map((kind) => (
            <Row
              key={kind}
              label={KIND_LABELS[kind]}
              sample={
                <span
                  className="flex w-[34px] shrink-0 justify-center"
                  dangerouslySetInnerHTML={{ __html: kindSymbol(kind, UNKNOWN_HEX, 18) }}
                />
              }
            />
          ))}
        </Group>
        <Group title="Petak tersier">
          <Row label="Petak" sample={<AreaSample color={PLOT_HEX} opacity={0.18} />} />
          <Row label="Petak terdampak" sample={<AreaSample color={IMPACT_HEX} opacity={0.45} />} />
        </Group>
      </div>
    </section>
  );
}
