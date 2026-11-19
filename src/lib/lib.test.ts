import { describe, expect, it } from "vitest";

import { escapeHtml, formatDate, formatDecimal } from "@/lib/format";
import { categoryLabel, conditionLabel, kindLabel } from "@/lib/labels";
import { conditionDash, conditionHex, kindSymbol, levelWeight } from "@/lib/map-style";
import { pivotRecap, share } from "@/lib/recap";

describe("format", () => {
  it("writes decimals the Indonesian way", () => {
    expect(formatDecimal(1874.05)).toBe("1.874,05");
    expect(formatDecimal(3.4)).toBe("3,40");
  });

  it("formats an ISO date and leaves anything else as written", () => {
    expect(formatDate("2026-08-14")).toBe("14 Agu 2026");
    expect(formatDate("14/08/2026")).toBe("14/08/2026");
    expect(formatDate(null)).toBe("Tanpa tanggal");
  });

  it("escapes text that goes into map popups", () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">&`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;",
    );
  });
});

describe("labels", () => {
  it("names known values", () => {
    expect(conditionLabel("rusak_berat")).toBe("Rusak berat");
    expect(kindLabel("bangunan_bagi_sadap")).toBe("Bangunan bagi-sadap");
    expect(categoryLabel("koordinat_utm_dikonversi")).toBe("Koordinat UTM dikonversi");
  });

  it("still gives a readable name to a value it does not know", () => {
    expect(conditionLabel(null)).toBe("Belum diketahui");
    expect(conditionLabel("hancur")).toBe("Belum diketahui");
    expect(kindLabel(null)).toBe("Jenis tidak dikenal");
    expect(categoryLabel("kategori_baru_sekali")).toBe("Kategori baru sekali");
  });
});

describe("map style", () => {
  it("separates conditions by dash pattern as well as colour", () => {
    const dashes = ["baik", "rusak_ringan", "rusak_sedang", "rusak_berat"].map(conditionDash);
    expect(new Set(dashes).size).toBe(4);
    const colours = ["baik", "rusak_ringan", "rusak_sedang", "rusak_berat"].map(conditionHex);
    expect(new Set(colours).size).toBe(4);
  });

  it("draws primary canals wider than secondary ones", () => {
    expect(levelWeight("primer")).toBeGreaterThan(levelWeight("sekunder"));
    expect(levelWeight(null)).toBe(levelWeight("sekunder"));
  });

  it("falls back to a neutral colour and shape for unknown values", () => {
    expect(conditionHex(null)).toBe(conditionHex("tidak_dikenal"));
    expect(kindSymbol("menara", "#000000")).toContain("<svg");
    expect(kindSymbol("bendung", "#000000")).not.toBe(kindSymbol("bangunan_sadap", "#000000"));
  });
});

describe("pivotRecap", () => {
  const entries = [
    { tingkat: "sekunder", kondisi: "baik" as const, panjang_km: 12.21 },
    { tingkat: "primer", kondisi: "baik" as const, panjang_km: 6.03 },
    { tingkat: "primer", kondisi: "rusak_berat" as const, panjang_km: 1.19 },
    { tingkat: "sekunder", kondisi: "rusak_ringan" as const, panjang_km: 5.96 },
  ];

  it("puts one row per level with primary first", () => {
    const table = pivotRecap(entries);
    expect(table.rows.map((row) => row.level)).toEqual(["primer", "sekunder"]);
    expect(table.rows[0].byCondition.rusak_berat).toBeCloseTo(1.19);
    expect(table.rows[0].byCondition.rusak_ringan).toBe(0);
    expect(table.rows[0].total).toBeCloseTo(7.22);
  });

  it("sums every level into the totals row", () => {
    const table = pivotRecap(entries);
    expect(table.totals.byCondition.baik).toBeCloseTo(18.24);
    expect(table.totals.total).toBeCloseTo(25.39);
  });

  it("handles an empty recap", () => {
    const table = pivotRecap([]);
    expect(table.rows).toEqual([]);
    expect(table.totals.total).toBe(0);
    expect(share(0, table.totals.total)).toBe(0);
  });
});
