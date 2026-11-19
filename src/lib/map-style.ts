import type { AssetKind, Condition } from "@/lib/types";

// The map never relies on colour alone: canal condition also changes the dash
// pattern, canal level the line width, and structure type the symbol shape.

export const CONDITION_COLORS: Record<Condition, string> = {
  baik: "var(--map-good)",
  rusak_ringan: "var(--map-minor)",
  rusak_sedang: "var(--map-moderate)",
  rusak_berat: "var(--map-severe)",
};

export const UNKNOWN_COLOR = "var(--map-unknown)";

/** Hex values of the same colours, for Leaflet paths (SVG attributes cannot read CSS variables). */
export const CONDITION_HEX: Record<Condition, string> = {
  baik: "#2e8b57",
  rusak_ringan: "#d9a514",
  rusak_sedang: "#e0701b",
  rusak_berat: "#c8323a",
};

export const UNKNOWN_HEX = "#7d93a1";
export const PLOT_HEX = "#5b8fb0";
export const IMPACT_HEX = "#d6336c";

export const CONDITION_DASH: Record<Condition, string | undefined> = {
  baik: undefined,
  rusak_ringan: "14 7",
  rusak_sedang: "7 7",
  rusak_berat: "2 7",
};

export const LEVEL_WEIGHT: Record<string, number> = {
  primer: 6,
  sekunder: 3.5,
};

export function conditionHex(condition: string | null): string {
  return condition && condition in CONDITION_HEX ? CONDITION_HEX[condition as Condition] : UNKNOWN_HEX;
}

export function conditionDash(condition: string | null): string | undefined {
  return condition && condition in CONDITION_DASH ? CONDITION_DASH[condition as Condition] : undefined;
}

export function levelWeight(level: string | null): number {
  return (level && LEVEL_WEIGHT[level]) || 3.5;
}

// One shape per structure type, drawn in a 24 x 24 box.
const KIND_SHAPES: Record<AssetKind, string> = {
  bendung: '<rect x="4" y="4" width="16" height="16" rx="1.5"/>',
  bangunan_bagi: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12Z"/>',
  bangunan_sadap: '<circle cx="12" cy="12" r="8"/>',
  bangunan_bagi_sadap: '<path d="M12 3 21.5 20h-19Z"/>',
  bangunan_pelengkap: '<path d="M12 2.5 21 9.2 17.6 20.5H6.4L3 9.2Z"/>',
};

const UNKNOWN_SHAPE = '<path d="M7 3h10l4 9-4 9H7l-4-9Z"/>';

/** The symbol of a structure type as an SVG string, filled with the given colour. */
export function kindSymbol(kind: string | null, fill: string, size = 22): string {
  const shape = kind && kind in KIND_SHAPES ? KIND_SHAPES[kind as AssetKind] : UNKNOWN_SHAPE;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" ` +
    `fill="${fill}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" aria-hidden="true" focusable="false">` +
    `<g paint-order="stroke">${shape}</g>` +
    `<g fill="none" stroke="#173348" stroke-width="0.9">${shape}</g></svg>`
  );
}
