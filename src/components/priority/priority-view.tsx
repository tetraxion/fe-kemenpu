"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";

import { ConditionBadge } from "@/components/condition-badge";
import { BODY_CELL, HEAD_CELL, PageBody, TableFrame } from "@/components/page-body";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, LoadingRows } from "@/components/states";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, queryKeys } from "@/lib/api";
import { formatDecimal } from "@/lib/format";
import { kindLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

// the API has no upper bound on limit
const ALL_ROWS = 100000;
const LIMITS = [
  { value: 20, label: "20 teratas" },
  { value: 50, label: "50 teratas" },
  { value: ALL_ROWS, label: "Semua" },
];

export function PriorityView() {
  const router = useRouter();
  const limitId = useId();
  const [limit, setLimit] = useState(20);

  const priorities = useQuery({ queryKey: queryKeys.priorities(limit), queryFn: () => api.priorities(limit) });
  // the ranking only carries codes; names and types come from here
  const assets = useQuery({ queryKey: queryKeys.assets, queryFn: api.assets });
  const byCode = useMemo(() => new Map(assets.data?.data.map((asset) => [asset.kode_aset, asset])), [assets.data]);

  const rows = priorities.data?.data ?? [];

  return (
    <PageBody>
      <PageHeader
        title="Prioritas pemeliharaan"
        description="Skor = bobot kondisi terkini (ringan 1, sedang 2, berat 4) × luas petak yang kehilangan air bila bangunan itu tidak berfungsi. Pilih baris untuk membuka bangunannya di peta."
        actions={
          <div className="flex items-center gap-2">
            <label htmlFor={limitId} className="text-xs font-semibold text-foreground">
              Tampilkan
            </label>
            <NativeSelect id={limitId} value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
              {LIMITS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        }
      />

      {priorities.isPending ? <LoadingRows rows={8} label="Memuat daftar prioritas" /> : null}
      {priorities.isError ? (
        <ErrorState title="Daftar prioritas tidak dapat dimuat" error={priorities.error} onRetry={() => priorities.refetch()} />
      ) : null}
      {priorities.data && rows.length === 0 ? (
        <EmptyState
          title="Tidak ada bangunan yang perlu diprioritaskan"
          note="Daftar ini hanya memuat bangunan rusak yang punya petak terdampak di hilirnya."
        />
      ) : null}

      {rows.length > 0 ? (
        <ol className="flex flex-col gap-2 md:hidden">
          {rows.map((row) => {
            const asset = byCode.get(row.kode_aset);
            return (
              <li key={row.kode_aset}>
                <Link
                  href={`/?aset=${encodeURIComponent(row.kode_aset)}`}
                  className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-3 active:bg-brand-2-light"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                      {row.peringkat}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold text-brand-2">
                        {asset?.nomenklatur ?? row.kode_aset}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {row.kode_aset}
                        {asset ? ` · ${kindLabel(asset.jenis)}` : ""}
                      </span>
                    </span>
                    <ConditionBadge condition={row.kondisi} />
                  </span>
                  <span className="flex items-baseline justify-between gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
                    <span>
                      Luas terdampak{" "}
                      <span className="font-semibold text-foreground">{formatDecimal(row.luas_terdampak_ha)} ha</span>
                    </span>
                    <span>
                      Skor <span className="font-semibold text-foreground">{formatDecimal(row.skor)}</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : null}

      {rows.length > 0 ? (
        <TableFrame className="hidden md:block">
          <Table className="min-w-[640px]">
            <caption className="sr-only">Bangunan diurutkan dari skor prioritas terbesar</caption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className={cn(HEAD_CELL, "w-16 text-right")}>
                  No.
                </TableHead>
                <TableHead scope="col" className={HEAD_CELL}>
                  Bangunan
                </TableHead>
                <TableHead scope="col" className={HEAD_CELL}>
                  Jenis
                </TableHead>
                <TableHead scope="col" className={HEAD_CELL}>
                  Kondisi
                </TableHead>
                <TableHead scope="col" className={cn(HEAD_CELL, "text-right")}>
                  Luas terdampak (ha)
                </TableHead>
                <TableHead scope="col" className={cn(HEAD_CELL, "text-right")}>
                  Skor
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => {
                const asset = byCode.get(row.kode_aset);
                const href = `/?aset=${encodeURIComponent(row.kode_aset)}`;
                return (
                  <TableRow
                    key={row.kode_aset}
                    // pointer only; the link in the row is the keyboard path
                    onClick={() => router.push(href)}
                    className={cn("cursor-pointer hover:bg-brand-2-light", index % 2 === 0 ? "bg-zebra" : "bg-card")}
                  >
                    <TableCell className={cn(BODY_CELL, "text-right text-muted-foreground")}>{row.peringkat}</TableCell>
                    <TableCell className={BODY_CELL}>
                      <Link
                        href={href}
                        onClick={(event) => event.stopPropagation()}
                        className="font-semibold text-brand-2 underline-offset-4 hover:underline"
                      >
                        {asset?.nomenklatur ?? row.kode_aset}
                      </Link>
                      <span className="block text-xs text-muted-foreground">{row.kode_aset}</span>
                    </TableCell>
                    <TableCell className={BODY_CELL}>{asset ? kindLabel(asset.jenis) : ""}</TableCell>
                    <TableCell className={BODY_CELL}>
                      <ConditionBadge condition={row.kondisi} />
                    </TableCell>
                    <TableCell className={cn(BODY_CELL, "text-right")}>{formatDecimal(row.luas_terdampak_ha)}</TableCell>
                    <TableCell className={cn(BODY_CELL, "text-right font-semibold")}>{formatDecimal(row.skor)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableFrame>
      ) : null}
    </PageBody>
  );
}
