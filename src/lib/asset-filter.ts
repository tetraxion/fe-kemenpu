import type { Asset } from "@/lib/types";

export interface AssetFilter {
  search: string;
  kind: string;
  condition: string;
}

export const EMPTY_FILTER: AssetFilter = { search: "", kind: "", condition: "" };

/** Keeps the structures matching the type, the condition and the search text. */
export function filterAssets(assets: Asset[], filter: AssetFilter): Asset[] {
  const needle = filter.search.trim().toLowerCase();
  return assets.filter((asset) => {
    if (filter.kind && asset.jenis !== filter.kind) {
      return false;
    }
    if (filter.condition && asset.kondisi !== filter.condition) {
      return false;
    }
    if (!needle) {
      return true;
    }
    return [asset.kode_aset, asset.nomenklatur, asset.nama_saluran].some((value) => value?.toLowerCase().includes(needle));
  });
}
