"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { BODY_CELL, HEAD_CELL, PageBody, TableFrame } from "@/components/page-body";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, LoadingRows } from "@/components/states";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, queryKeys } from "@/lib/api";
import { formatDecimal } from "@/lib/format";
import { CONDITIONS, CONDITION_LABELS, levelLabel } from "@/lib/labels";
import { pivotRecap, share, type RecapRow } from "@/lib/recap";
import { cn } from "@/lib/utils";

function LengthCells({ row }: { row: RecapRow }) {
  return (
    <>
      {CONDITIONS.map((condition) => (
        <TableCell key={condition} className={cn(BODY_CELL, "text-right")}>
          {formatDecimal(row.byCondition[condition])}
        </TableCell>
      ))}
      <TableCell className={cn(BODY_CELL, "text-right font-semibold")}>{formatDecimal(row.total)}</TableCell>
    </>
  );
}

/** Canal length per level and condition, after duplicate segments were dropped. */
export function CanalRecapView() {
  const recap = useQuery({ queryKey: queryKeys.canalRecap, queryFn: api.canalRecap });
  const table = useMemo(() => pivotRecap(recap.data?.data ?? []), [recap.data]);
  const damaged = table.totals.total - table.totals.byCondition.baik;

  return (
    <PageBody>
      <PageHeader
        title="Rekap panjang saluran"
        description="Panjang ruas dijumlahkan per tingkat dan kondisi, dalam kilometer, setelah ruas ganda dibuang."
      />

      {recap.isPending ? <LoadingRows rows={4} label="Memuat rekap saluran" /> : null}
      {recap.isError ? (
        <ErrorState title="Rekap saluran tidak dapat dimuat" error={recap.error} onRetry={() => recap.refetch()} />
      ) : null}
      {recap.data && table.rows.length === 0 ? (
        <EmptyState title="Belum ada ruas saluran" note="Berkas saluran kosong atau tidak terbaca." />
      ) : null}

      {table.rows.length > 0 ? (
        <>
          <p className="text-sm leading-normal text-foreground">
            Dari <strong className="font-semibold">{formatDecimal(table.totals.total)} km</strong> saluran,{" "}
            <strong className="font-semibold text-severe">{formatDecimal(damaged)} km</strong> (
            {formatDecimal(share(damaged, table.totals.total))}%) dalam kondisi rusak.
          </p>

          <TableFrame>
            <Table className="min-w-[620px]">
              <caption className="sr-only">Panjang saluran dalam kilometer per tingkat dan kondisi</caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col" className={HEAD_CELL}>
                    Tingkat
                  </TableHead>
                  {CONDITIONS.map((condition) => (
                    <TableHead key={condition} scope="col" className={cn(HEAD_CELL, "text-right")}>
                      {CONDITION_LABELS[condition]} (km)
                    </TableHead>
                  ))}
                  <TableHead scope="col" className={cn(HEAD_CELL, "text-right")}>
                    Total (km)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.rows.map((row, index) => (
                  <TableRow key={row.level} className={cn("hover:bg-transparent", index % 2 === 0 ? "bg-zebra" : "bg-card")}>
                    <TableHead scope="row" className={cn(BODY_CELL, "h-auto font-semibold text-foreground")}>
                      {levelLabel(row.level)}
                    </TableHead>
                    <LengthCells row={row} />
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-muted">
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="row" className={cn(BODY_CELL, "h-auto font-semibold text-foreground")}>
                    Semua tingkat
                  </TableHead>
                  <LengthCells row={table.totals} />
                </TableRow>
              </TableFooter>
            </Table>
          </TableFrame>
        </>
      ) : null}
    </PageBody>
  );
}
