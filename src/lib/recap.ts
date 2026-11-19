import { CONDITIONS } from "@/lib/labels";
import type { CanalRecap, Condition } from "@/lib/types";

export interface RecapRow {
  level: string;
  byCondition: Record<Condition, number>;
  total: number;
}

export interface RecapTable {
  rows: RecapRow[];
  totals: RecapRow;
}

const LEVEL_ORDER = ["primer", "sekunder"];

function emptyRow(level: string): RecapRow {
  return { level, byCondition: { baik: 0, rusak_ringan: 0, rusak_sedang: 0, rusak_berat: 0 }, total: 0 };
}

/**
 * Turns the flat list of the API (one entry per level and condition) into one
 * row per level with a column per condition, plus a totals row.
 */
export function pivotRecap(entries: CanalRecap[]): RecapTable {
  const rows = new Map<string, RecapRow>();
  const totals = emptyRow("total");

  for (const entry of entries) {
    if (!CONDITIONS.includes(entry.kondisi)) {
      continue;
    }
    let row = rows.get(entry.tingkat);
    if (!row) {
      row = emptyRow(entry.tingkat);
      rows.set(entry.tingkat, row);
    }
    row.byCondition[entry.kondisi] += entry.panjang_km;
    row.total += entry.panjang_km;
    totals.byCondition[entry.kondisi] += entry.panjang_km;
    totals.total += entry.panjang_km;
  }

  const rank = (level: string) => {
    const index = LEVEL_ORDER.indexOf(level);
    return index === -1 ? LEVEL_ORDER.length : index;
  };
  const ordered = [...rows.values()].sort((a, b) => rank(a.level) - rank(b.level) || a.level.localeCompare(b.level));
  return { rows: ordered, totals };
}

/** Share of a part in a whole as a percentage, 0 when the whole is 0. */
export function share(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}
