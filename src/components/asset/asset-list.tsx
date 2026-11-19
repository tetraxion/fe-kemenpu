"use client";

import { useId } from "react";

import { ConditionBadge } from "@/components/condition-badge";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { EMPTY_FILTER, type AssetFilter } from "@/lib/asset-filter";
import { formatInteger } from "@/lib/format";
import { CONDITIONS, CONDITION_LABELS, KINDS, KIND_LABELS, kindLabel } from "@/lib/labels";
import type { Asset } from "@/lib/types";

/** Search, filters and the list of structures. The same filter drives the symbols on the map. */
export function AssetList({
  assets,
  total,
  filter,
  onFilterChange,
  onSelect,
}: {
  assets: Asset[];
  total: number;
  filter: AssetFilter;
  onFilterChange: (filter: AssetFilter) => void;
  onSelect: (code: string) => void;
}) {
  const searchId = useId();
  const kindId = useId();
  const conditionId = useId();
  const filtered = filter.search !== "" || filter.kind !== "" || filter.condition !== "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={searchId} className="text-xs font-semibold text-foreground">
            Cari bangunan
          </label>
          <Input
            id={searchId}
            type="search"
            value={filter.search}
            placeholder="Kode, nomenklatur, atau saluran"
            onChange={(event) => onFilterChange({ ...filter, search: event.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={kindId} className="text-xs font-semibold text-foreground">
              Jenis
            </label>
            <NativeSelect
              id={kindId}
              className="w-full"
              value={filter.kind}
              onChange={(event) => onFilterChange({ ...filter, kind: event.target.value })}
            >
              <NativeSelectOption value="">Semua jenis</NativeSelectOption>
              {KINDS.map((kind) => (
                <NativeSelectOption key={kind} value={kind}>
                  {KIND_LABELS[kind]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={conditionId} className="text-xs font-semibold text-foreground">
              Kondisi
            </label>
            <NativeSelect
              id={conditionId}
              className="w-full"
              value={filter.condition}
              onChange={(event) => onFilterChange({ ...filter, condition: event.target.value })}
            >
              <NativeSelectOption value="">Semua kondisi</NativeSelectOption>
              {CONDITIONS.map((condition) => (
                <NativeSelectOption key={condition} value={condition}>
                  {CONDITION_LABELS[condition]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>
      </div>

      <div className="flex min-h-9 items-center justify-between gap-3">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {filtered
            ? `${formatInteger(assets.length)} dari ${formatInteger(total)} bangunan`
            : `${formatInteger(total)} bangunan`}
        </p>
        {filtered ? (
          <Button variant="link" size="lg" className="px-0 text-brand-2" onClick={() => onFilterChange(EMPTY_FILTER)}>
            Hapus filter
          </Button>
        ) : null}
      </div>

      {assets.length === 0 ? (
        <EmptyState
          title={total === 0 ? "Belum ada bangunan" : "Tidak ada bangunan yang cocok"}
          note={total === 0 ? "Berkas inventaris kosong atau tidak terbaca." : "Ubah kata pencarian atau filter."}
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {assets.map((asset) => (
            <li key={asset.kode_aset}>
              <button
                type="button"
                onClick={() => onSelect(asset.kode_aset)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted active:bg-brand-2-light"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-semibold text-foreground">
                    {asset.nomenklatur ?? asset.kode_aset}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {asset.kode_aset} · {kindLabel(asset.jenis)}
                    {asset.lat === null ? " · tanpa koordinat" : ""}
                  </span>
                </span>
                <ConditionBadge condition={asset.kondisi} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
