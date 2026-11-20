import type {
  AssetDetail,
  AssetList,
  CanalCollection,
  CanalRecap,
  CategoryCount,
  FindingList,
  FollowUpSummary,
  Health,
  Impact,
  PlotCollection,
  Priority,
} from "@/lib/types";

// relative: the gateway or dev proxy serves the API on the same origin
const API_BASE = "/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// must match the server's upload field and size limit
const UPLOAD_FIELD = "berkas";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const NETWORK_MESSAGE = "Server tidak dapat dihubungi. Periksa apakah aplikasi masih berjalan.";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API_BASE + path, { ...init, headers: { Accept: "application/json", ...init?.headers } });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", NETWORK_MESSAGE);
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // non-JSON body: something other than the API answered
  }

  if (!response.ok) {
    const error = (body as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN_ERROR",
      error?.message ?? `Permintaan gagal dengan status ${response.status}.`,
    );
  }
  if (body === null) {
    throw new ApiError(response.status, "INVALID_RESPONSE", "Jawaban server tidak dapat dibaca.");
  }
  return body as T;
}

export const api = {
  health: () => request<Health>("/health"),
  assets: () => request<AssetList>("/aset"),
  asset: (code: string) => request<AssetDetail>(`/aset/${encodeURIComponent(code)}`),
  impact: (code: string) => request<Impact>(`/aset/${encodeURIComponent(code)}/dampak`),
  canalRecap: () => request<{ data: CanalRecap[] }>("/rekap/saluran"),
  priorities: (limit: number) => request<{ data: Priority[] }>(`/prioritas?limit=${limit}`),
  qualitySummary: () => request<{ data: CategoryCount[] }>("/kualitas-data"),
  findings: () => request<FindingList>("/kualitas-data/temuan"),
  canalMap: () => request<CanalCollection>("/peta/saluran"),
  plotMap: () => request<PlotCollection>("/peta/petak"),
  // no file: the server reads its own data folder
  importFollowUp: (file?: File) => {
    if (!file) {
      return request<FollowUpSummary>("/impor/susulan", { method: "POST" });
    }
    const form = new FormData();
    form.append(UPLOAD_FIELD, file);
    // no Content-Type: the browser sets the multipart boundary
    return request<FollowUpSummary>("/impor/susulan", { method: "POST", body: form });
  },
};

export const queryKeys = {
  health: ["health"] as const,
  assets: ["assets"] as const,
  asset: (code: string) => ["asset", code] as const,
  impact: (code: string) => ["impact", code] as const,
  canalRecap: ["canal-recap"] as const,
  priorities: (limit: number) => ["priorities", limit] as const,
  qualitySummary: ["quality-summary"] as const,
  findings: ["findings"] as const,
  canalMap: ["canal-map"] as const,
  plotMap: ["plot-map"] as const,
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan yang tidak dikenal.";
}
