import { describe, expect, it } from "vitest";

import { filterAssets } from "@/lib/asset-filter";
import type { Asset } from "@/lib/types";

function asset(overrides: Partial<Asset>): Asset {
  return {
    kode_aset: "KW-0001",
    nomenklatur: "B.KW.0",
    jenis: "bendung",
    nama_saluran: "Primer Kali Wening",
    kondisi: "baik",
    tgl_kondisi: "2026-01-01",
    lon: 110.4,
    lat: -7.6,
    tanda: [],
    ...overrides,
  };
}

const assets = [
  asset({}),
  asset({ kode_aset: "KW-0012", nomenklatur: "B.KW.3", jenis: "bangunan_bagi_sadap", kondisi: "rusak_sedang" }),
  asset({ kode_aset: "KW-0030", nomenklatur: null, jenis: "bangunan_sadap", kondisi: "rusak_berat", nama_saluran: "Sekunder Tegal Sari" }),
];

describe("filterAssets", () => {
  it("returns everything for an empty filter", () => {
    expect(filterAssets(assets, { search: "", kind: "", condition: "" })).toHaveLength(3);
  });

  it("searches code, nomenclature and canal name without regard to case", () => {
    expect(filterAssets(assets, { search: "b.kw.3", kind: "", condition: "" }).map((a) => a.kode_aset)).toEqual(["KW-0012"]);
    expect(filterAssets(assets, { search: " tegal ", kind: "", condition: "" }).map((a) => a.kode_aset)).toEqual(["KW-0030"]);
    expect(filterAssets(assets, { search: "0001", kind: "", condition: "" }).map((a) => a.kode_aset)).toEqual(["KW-0001"]);
  });

  it("combines type and condition", () => {
    expect(filterAssets(assets, { search: "", kind: "bangunan_sadap", condition: "rusak_berat" })).toHaveLength(1);
    expect(filterAssets(assets, { search: "", kind: "bangunan_sadap", condition: "baik" })).toHaveLength(0);
  });
});
