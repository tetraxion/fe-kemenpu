// Property names follow the API contract, so they stay in Indonesian.

export type Condition = "baik" | "rusak_ringan" | "rusak_sedang" | "rusak_berat";

export type AssetKind =
  | "bendung"
  | "bangunan_bagi"
  | "bangunan_sadap"
  | "bangunan_bagi_sadap"
  | "bangunan_pelengkap";

export type HealthStatus = "memuat" | "siap" | "gagal";

export interface Health {
  status: HealthStatus;
}

export interface Asset {
  kode_aset: string;
  nomenklatur: string | null;
  jenis: AssetKind | null;
  nama_saluran: string | null;
  kondisi: Condition | null;
  tgl_kondisi: string | null;
  lon: number | null;
  lat: number | null;
  tanda: string[];
}

export interface AssetList {
  jumlah: number;
  data: Asset[];
}

export interface Report {
  id_laporan: string;
  tanggal: string | null;
  petugas: string | null;
  nomenklatur: string | null;
  jenis_kerusakan: string | null;
  kondisi: Condition | null;
  lat: number | null;
  lon: number | null;
  status: string;
  keterangan: string | null;
}

export interface AssetDetail extends Asset {
  riwayat: Report[];
}

export interface Impact {
  kode_aset: string;
  jumlah_petak: number;
  luas_terdampak_ha: number;
  petak: { kode_petak: string; luas_ha: number }[];
}

export interface CanalRecap {
  tingkat: string;
  kondisi: Condition;
  panjang_km: number;
}

export interface Priority {
  peringkat: number;
  kode_aset: string;
  kondisi: Condition;
  luas_terdampak_ha: number;
  skor: number;
}

export interface CategoryCount {
  kategori: string;
  jumlah: number;
}

export interface Finding {
  sumber: string;
  pengenal: string;
  kategori: string;
  masalah: string;
  tindakan: string;
}

export interface FindingList {
  jumlah: number;
  data: Finding[];
}

export interface FollowUpSummary {
  ditambah: number;
  diubah: number;
  dibatalkan: number;
  tidak_berubah: number;
}

export interface CanalProperties {
  id_ruas: string;
  nama_saluran: string | null;
  tingkat: string | null;
  kondisi: Condition | null;
  panjang_m: number;
}

export interface PlotProperties {
  kode_petak: string;
  nama_petak: string | null;
  luas_ha: number;
  luas_baku_ha: number | null;
  luas_geometri_ha: number | null;
  nomenklatur_sadap: string | null;
  kode_aset_sadap: string | null;
  tanda: string[];
}

export type CanalCollection = GeoJSON.FeatureCollection<GeoJSON.LineString | GeoJSON.MultiLineString, CanalProperties>;
export type PlotCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, PlotProperties>;
