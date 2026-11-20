import type { AssetKind, Condition } from "@/lib/types";

export const CONDITIONS: Condition[] = ["baik", "rusak_ringan", "rusak_sedang", "rusak_berat"];

export const CONDITION_LABELS: Record<Condition, string> = {
  baik: "Baik",
  rusak_ringan: "Rusak ringan",
  rusak_sedang: "Rusak sedang",
  rusak_berat: "Rusak berat",
};

export const KINDS: AssetKind[] = [
  "bendung",
  "bangunan_bagi",
  "bangunan_sadap",
  "bangunan_bagi_sadap",
  "bangunan_pelengkap",
];

export const KIND_LABELS: Record<AssetKind, string> = {
  bendung: "Bendung",
  bangunan_bagi: "Bangunan bagi",
  bangunan_sadap: "Bangunan sadap",
  bangunan_bagi_sadap: "Bangunan bagi-sadap",
  bangunan_pelengkap: "Bangunan pelengkap",
};

export const LEVEL_LABELS: Record<string, string> = {
  primer: "Primer",
  sekunder: "Sekunder",
};

export const FLAG_NOTES: Record<string, { label: string; note: string }> = {
  koordinat_tidak_valid: {
    label: "Koordinat tidak valid",
    note: "Koordinat kosong, 0,0, atau lebih dari 2 km dari saluran. Bangunan disimpan tanpa posisi di peta.",
  },
  jauh_dari_saluran: {
    label: "Jauh dari saluran",
    note: "Lebih dari 50 m dari saluran mana pun, sehingga tidak ikut dalam analisis dampak.",
  },
  luas_tidak_wajar: {
    label: "Luas tidak wajar",
    note: "Luas baku berselisih lebih dari 20% dari luas geometri. Dipakai luas geometri.",
  },
  tanpa_sadap: {
    label: "Tanpa sadap",
    note: "Tidak ada bangunan sadap yang cocok dalam 200 m. Petak tidak ikut dihitung.",
  },
};

/** In the order the assignment lists them. */
export const REQUIRED_CATEGORIES = [
  "koordinat_utm_dikonversi",
  "koordinat_tertukar_dibetulkan",
  "koordinat_tidak_valid",
  "jauh_dari_saluran",
  "aset_ganda",
  "ruas_ganda",
  "petak_ganda",
  "geometri_diperbaiki",
  "luas_tidak_wajar",
  "laporan_ganda",
  "laporan_tanpa_aset",
];

const CATEGORY_LABELS: Record<string, string> = {
  koordinat_utm_dikonversi: "Koordinat UTM dikonversi",
  koordinat_tertukar_dibetulkan: "Koordinat tertukar dibetulkan",
  koordinat_tidak_valid: "Koordinat tidak valid",
  jauh_dari_saluran: "Jauh dari saluran",
  aset_ganda: "Aset ganda",
  ruas_ganda: "Ruas ganda",
  petak_ganda: "Petak ganda",
  geometri_diperbaiki: "Geometri diperbaiki",
  luas_tidak_wajar: "Luas tidak wajar",
  laporan_ganda: "Laporan ganda",
  laporan_tanpa_aset: "Laporan tanpa aset",
  angka_koma_desimal: "Angka dengan koma desimal",
  kondisi_diseragamkan: "Kondisi diseragamkan",
  nomenklatur_diseragamkan: "Nomenklatur diseragamkan",
  tanggal_diseragamkan: "Tanggal diseragamkan",
  luas_m2_dikonversi: "Luas m² dikonversi",
  laporan_dicocokkan_dari_jarak: "Laporan dicocokkan dari jarak",
  petak_sadap_dari_jarak: "Sadap petak dicari dari jarak",
  tanpa_sadap: "Petak tanpa sadap",
  berkas_tidak_terbaca: "Berkas tidak terbaca",
};

export function categoryLabel(category: string): string {
  const known = CATEGORY_LABELS[category];
  if (known) {
    return known;
  }
  const words = category.replaceAll("_", " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : category;
}

export function conditionLabel(condition: string | null): string {
  return condition && condition in CONDITION_LABELS ? CONDITION_LABELS[condition as Condition] : "Belum diketahui";
}

export function kindLabel(kind: string | null): string {
  return kind && kind in KIND_LABELS ? KIND_LABELS[kind as AssetKind] : "Jenis tidak dikenal";
}

export function levelLabel(level: string | null): string {
  if (!level || level === "tidak_diketahui") {
    return "Tingkat tidak dikenal";
  }
  return LEVEL_LABELS[level] ?? level;
}
