"use client";

import { useQuery } from "@tanstack/react-query";
import { useId, useMemo, useState } from "react";

import { BODY_CELL, HEAD_CELL, PageBody, TableFrame } from "@/components/page-body";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, LoadingRows } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, queryKeys } from "@/lib/api";
import { formatInteger } from "@/lib/format";
import { REQUIRED_CATEGORIES, categoryLabel } from "@/lib/labels";
import type { CategoryCount, Finding } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

/** Required categories first, in assignment order, then the rest by name. */
function orderCategories(counts: CategoryCount[]): CategoryCount[] {
  const rank = (category: string) => {
    const index = REQUIRED_CATEGORIES.indexOf(category);
    return index === -1 ? REQUIRED_CATEGORIES.length : index;
  };
  return [...counts].sort(
    (a, b) => rank(a.kategori) - rank(b.kategori) || categoryLabel(a.kategori).localeCompare(categoryLabel(b.kategori), "id"),
  );
}

function CategorySummary({
  counts,
  active,
  onPick,
}: {
  counts: CategoryCount[];
  active: string;
  onPick: (category: string) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {counts.map((count) => {
        const selected = active === count.kategori;
        return (
          <li key={count.kategori}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onPick(selected ? "" : count.kategori)}
              className={cn(
                "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
                selected
                  ? "border-brand-2 bg-brand-2-light font-semibold text-brand"
                  : "border-border bg-card hover:bg-muted active:bg-brand-light",
              )}
            >
              <span className="min-w-0">{categoryLabel(count.kategori)}</span>
              <span className="font-semibold text-brand">{formatInteger(count.jumlah)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function matches(finding: Finding, category: string, source: string, needle: string): boolean {
  if (category && finding.kategori !== category) {
    return false;
  }
  if (source && finding.sumber !== source) {
    return false;
  }
  if (!needle) {
    return true;
  }
  return [finding.pengenal, finding.masalah, finding.tindakan].some((value) => value.toLowerCase().includes(needle));
}

export function QualityView() {
  const summary = useQuery({ queryKey: queryKeys.qualitySummary, queryFn: api.qualitySummary });
  const findings = useQuery({ queryKey: queryKeys.findings, queryFn: api.findings });

  const sourceId = useId();
  const searchId = useId();
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const counts = useMemo(() => orderCategories(summary.data?.data ?? []), [summary.data]);
  const sources = useMemo(
    () => [...new Set(findings.data?.data.map((finding) => finding.sumber))].sort(),
    [findings.data],
  );
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (findings.data?.data ?? []).filter((finding) => matches(finding, category, source, needle));
  }, [findings.data, category, source, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const hasFilter = category !== "" || source !== "" || search !== "";

  // filter changes go back to the first page
  function update(change: () => void) {
    change();
    setPage(0);
  }

  return (
    <PageBody>
      <PageHeader
        title="Kualitas data"
        description="Setiap baris atau fitur yang diperbaiki, ditandai, atau dibuang saat impor dicatat di sini, beserta tindakan yang diambil."
      />

      <section aria-labelledby="ringkasan-kategori" className="flex flex-col gap-3">
        <h2 id="ringkasan-kategori" className="text-base font-semibold text-brand">
          Jumlah temuan per kategori
        </h2>
        {summary.isPending ? <LoadingRows rows={3} label="Memuat ringkasan kualitas data" /> : null}
        {summary.isError ? (
          <ErrorState title="Ringkasan tidak dapat dimuat" error={summary.error} onRetry={() => summary.refetch()} />
        ) : null}
        {summary.data && counts.length === 0 ? <EmptyState title="Tidak ada temuan" /> : null}
        {counts.length > 0 ? (
          <>
            <p className="text-xs text-muted-foreground">Pilih kategori untuk menyaring daftar di bawah.</p>
            <CategorySummary counts={counts} active={category} onPick={(next) => update(() => setCategory(next))} />
          </>
        ) : null}
      </section>

      <section aria-labelledby="daftar-temuan" className="flex flex-col gap-3">
        <h2 id="daftar-temuan" className="text-base font-semibold text-brand">
          Daftar temuan
        </h2>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-full flex-col gap-1.5 sm:w-72">
            <label htmlFor={searchId} className="text-xs font-semibold text-foreground">
              Cari
            </label>
            <Input
              id={searchId}
              type="search"
              value={search}
              placeholder="Pengenal baris, masalah, atau tindakan"
              onChange={(event) => update(() => setSearch(event.target.value))}
            />
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-64">
            <label htmlFor={sourceId} className="text-xs font-semibold text-foreground">
              Berkas sumber
            </label>
            <NativeSelect
              id={sourceId}
              className="w-full"
              value={source}
              onChange={(event) => update(() => setSource(event.target.value))}
            >
              <NativeSelectOption value="">Semua berkas</NativeSelectOption>
              {sources.map((name) => (
                <NativeSelectOption key={name} value={name}>
                  {name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          {hasFilter ? (
            <Button
              variant="outline"
              onClick={() =>
                update(() => {
                  setCategory("");
                  setSource("");
                  setSearch("");
                })
              }
            >
              Hapus filter
            </Button>
          ) : null}
        </div>

        {findings.isPending ? <LoadingRows rows={8} label="Memuat daftar temuan" /> : null}
        {findings.isError ? (
          <ErrorState title="Daftar temuan tidak dapat dimuat" error={findings.error} onRetry={() => findings.refetch()} />
        ) : null}

        {findings.data ? (
          <>
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {hasFilter
                ? `${formatInteger(filtered.length)} dari ${formatInteger(findings.data.jumlah)} temuan`
                : `${formatInteger(findings.data.jumlah)} temuan`}
              {category ? `, kategori ${categoryLabel(category)}` : ""}
            </p>

            {filtered.length === 0 ? (
              <EmptyState
                title={findings.data.jumlah === 0 ? "Tidak ada temuan" : "Tidak ada temuan yang cocok"}
                note={findings.data.jumlah === 0 ? "Semua baris berkas sumber bersih." : "Ubah kata pencarian atau filter."}
              />
            ) : (
              <TableFrame>
                <Table className="min-w-[860px]">
                  <caption className="sr-only">Temuan kualitas data</caption>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead scope="col" className={HEAD_CELL}>
                        Berkas sumber
                      </TableHead>
                      <TableHead scope="col" className={HEAD_CELL}>
                        Pengenal baris
                      </TableHead>
                      <TableHead scope="col" className={HEAD_CELL}>
                        Kategori
                      </TableHead>
                      <TableHead scope="col" className={HEAD_CELL}>
                        Masalah
                      </TableHead>
                      <TableHead scope="col" className={HEAD_CELL}>
                        Tindakan
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((finding, index) => (
                      <TableRow
                        key={`${current}-${index}`}
                        className={cn("hover:bg-transparent", index % 2 === 0 ? "bg-zebra" : "bg-card")}
                      >
                        <TableCell className={cn(BODY_CELL, "whitespace-nowrap text-muted-foreground")}>
                          {finding.sumber}
                        </TableCell>
                        <TableCell className={cn(BODY_CELL, "whitespace-nowrap")}>{finding.pengenal}</TableCell>
                        <TableCell className={cn(BODY_CELL, "whitespace-nowrap")}>{categoryLabel(finding.kategori)}</TableCell>
                        <TableCell className={cn(BODY_CELL, "min-w-56 whitespace-normal")}>{finding.masalah}</TableCell>
                        <TableCell className={cn(BODY_CELL, "min-w-56 whitespace-normal")}>{finding.tindakan}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableFrame>
            )}

            {pageCount > 1 ? (
              <nav aria-label="Halaman daftar temuan" className="flex items-center justify-between gap-3">
                <Button variant="outline" disabled={current === 0} onClick={() => setPage(current - 1)}>
                  Sebelumnya
                </Button>
                <span className="text-xs text-muted-foreground">
                  Halaman {current + 1} dari {pageCount}
                </span>
                <Button variant="outline" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>
                  Berikutnya
                </Button>
              </nav>
            ) : null}
          </>
        ) : null}
      </section>
    </PageBody>
  );
}
