"use client";

import { useQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import { api, queryKeys } from "@/lib/api";
import type { HealthStatus } from "@/lib/types";

/** Polls /api/health until the import is done. */
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: api.health,
    staleTime: 0,
    refetchInterval: (query) => (query.state.data?.status === "siap" ? false : 1500),
    retry: false,
  });
}

export function ImportGate({ children }: { children: React.ReactNode }) {
  const health = useHealth();
  const status: HealthStatus | undefined = health.data?.status;

  if (status === "siap") {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4 sm:p-8">
      {status === "gagal" ? (
        <ErrorState
          title="Impor data gagal"
          error={new Error("Server tidak dapat mengimpor folder data. Periksa log backend, lalu nyalakan ulang aplikasi.")}
        />
      ) : health.isError ? (
        <ErrorState title="Status aplikasi tidak dapat dibaca" error={health.error} onRetry={() => health.refetch()} />
      ) : (
        <div role="status" aria-live="polite" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-semibold text-brand">Data sedang diimpor</p>
          <p className="text-[13px] leading-normal text-muted-foreground">
            Aplikasi membaca dan membersihkan berkas di folder data. Halaman ini terbuka sendiri setelah selesai.
          </p>
          <Skeleton className="h-2 w-full" />
        </div>
      )}
    </div>
  );
}
