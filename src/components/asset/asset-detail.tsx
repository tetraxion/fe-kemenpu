"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";

import { ConditionBadge, FlagBadge } from "@/components/condition-badge";
import { EmptyState, ErrorState, LoadingRows } from "@/components/states";
import { Button } from "@/components/ui/button";
import { api, queryKeys } from "@/lib/api";
import { formatDate, formatDecimal, formatInteger } from "@/lib/format";
import { FLAG_NOTES, kindLabel } from "@/lib/labels";
import type { AssetDetail as AssetDetailData, Impact, Report } from "@/lib/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-border pt-4">
      <h3 className="text-sm font-semibold text-brand">{title}</h3>
      {children}
    </section>
  );
}

function Facts({ asset }: { asset: AssetDetailData }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-[13px] leading-normal">
      <dt className="text-muted-foreground">Kondisi terkini</dt>
      <dd className="flex flex-wrap items-center gap-2">
        <ConditionBadge condition={asset.kondisi} />
        {asset.tgl_kondisi ? <span className="text-muted-foreground">per {formatDate(asset.tgl_kondisi)}</span> : null}
      </dd>
      <dt className="text-muted-foreground">Jenis</dt>
      <dd>{kindLabel(asset.jenis)}</dd>
      <dt className="text-muted-foreground">Saluran</dt>
      <dd>{asset.nama_saluran ?? "Tidak tercatat"}</dd>
      <dt className="text-muted-foreground">Koordinat</dt>
      <dd>
        {asset.lat !== null && asset.lon !== null
          ? `${asset.lat.toFixed(5)}, ${asset.lon.toFixed(5)}`
          : "Tidak ada, bangunan tidak tampil di peta"}
      </dd>
    </dl>
  );
}

function Flags({ flags }: { flags: string[] }) {
  if (flags.length === 0) {
    return null;
  }
  return (
    <Section title="Tanda">
      <ul className="flex flex-col gap-2.5">
        {flags.map((flag) => {
          const known = FLAG_NOTES[flag];
          return (
            <li key={flag} className="flex flex-col items-start gap-1">
              <FlagBadge>{known?.label ?? flag}</FlagBadge>
              {known ? <p className="text-xs leading-normal text-muted-foreground">{known.note}</p> : null}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function ImpactSection({
  impact,
  hasPosition,
  highlighted,
  onToggleHighlight,
}: {
  impact: Impact;
  hasPosition: boolean;
  highlighted: boolean;
  onToggleHighlight: () => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted p-3">
          <span className="text-xs text-muted-foreground">Luas terdampak</span>
          <span className="text-xl leading-tight font-semibold text-brand">
            {formatDecimal(impact.luas_terdampak_ha)} <span className="text-sm font-medium">ha</span>
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted p-3">
          <span className="text-xs text-muted-foreground">Petak terdampak</span>
          <span className="text-xl leading-tight font-semibold text-brand">{formatInteger(impact.jumlah_petak)}</span>
        </div>
      </div>

      {impact.jumlah_petak === 0 ? (
        <p className="text-xs leading-normal text-muted-foreground">
          {hasPosition
            ? "Tidak ada petak tersier di hilir bangunan ini."
            : "Bangunan ini tidak punya posisi pada jaringan, sehingga dampaknya tidak dihitung."}
        </p>
      ) : (
        <>
          <Button variant="outline" aria-pressed={highlighted} onClick={onToggleHighlight} className="self-start">
            {highlighted ? "Hentikan sorotan petak" : "Sorot petak terdampak di peta"}
          </Button>
          <div className="scrollbar-thin max-h-56 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-left text-[13px]">
              <caption className="sr-only">Petak tersier yang terdampak</caption>
              <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Kode petak
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    Luas (ha)
                  </th>
                </tr>
              </thead>
              <tbody>
                {impact.petak.map((plot, index) => (
                  <tr key={plot.kode_petak} className={index % 2 === 0 ? "bg-zebra" : "bg-card"}>
                    <td className="px-3 py-2">{plot.kode_petak}</td>
                    <td className="px-3 py-2 text-right">{formatDecimal(plot.luas_ha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function History({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return <EmptyState title="Belum ada laporan" note="Kondisi terkini diambil dari inventaris." />;
  }
  return (
    <ol className="flex flex-col gap-2.5">
      {reports.map((report) => {
        const cancelled = report.status === "batal";
        return (
          <li key={report.id_laporan} className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-foreground">{formatDate(report.tanggal)}</span>
              <ConditionBadge condition={report.kondisi} />
              {cancelled ? <FlagBadge>Batal</FlagBadge> : null}
            </div>
            {report.jenis_kerusakan ? (
              <p className={cancelled ? "text-[13px] text-muted-foreground line-through" : "text-[13px]"}>
                {report.jenis_kerusakan}
              </p>
            ) : null}
            {report.keterangan ? <p className="text-xs leading-normal text-muted-foreground">{report.keterangan}</p> : null}
            <p className="text-xs text-muted-foreground">
              {report.id_laporan}
              {report.petugas ? ` · ${report.petugas}` : ""}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/** Latest condition, flags, downstream impact and report history of one structure. */
export function AssetDetail({
  code,
  highlighted,
  onToggleHighlight,
  onBack,
}: {
  code: string;
  highlighted: boolean;
  onToggleHighlight: () => void;
  onBack: () => void;
}) {
  const detail = useQuery({ queryKey: queryKeys.asset(code), queryFn: () => api.asset(code) });
  const impact = useQuery({ queryKey: queryKeys.impact(code), queryFn: () => api.impact(code) });

  // Opening a structure from the map moves focus to its heading, so keyboard
  // and screen-reader users land on what they just opened.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [code]);

  const asset = detail.data;

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="lg" onClick={onBack} className="-ml-2 self-start text-brand-2">
        <ArrowLeft aria-hidden="true" />
        Semua bangunan
      </Button>

      <div className="flex flex-col gap-1">
        <h2 ref={headingRef} tabIndex={-1} className="text-xl leading-tight font-semibold text-brand outline-none">
          {asset?.nomenklatur ?? code}
        </h2>
        <p className="text-[13px] text-muted-foreground">Kode aset {code}</p>
      </div>

      {detail.isPending ? <LoadingRows rows={4} label="Memuat data bangunan" /> : null}
      {detail.isError ? (
        <ErrorState title="Bangunan tidak dapat dimuat" error={detail.error} onRetry={() => detail.refetch()} />
      ) : null}

      {asset ? (
        <>
          <Facts asset={asset} />
          <Flags flags={asset.tanda} />

          <Section title="Dampak hilir">
            {impact.isPending ? <LoadingRows rows={2} label="Menghitung dampak hilir" /> : null}
            {impact.isError ? (
              <ErrorState title="Dampak hilir tidak dapat dimuat" error={impact.error} onRetry={() => impact.refetch()} />
            ) : null}
            {impact.data ? (
              <ImpactSection
                impact={impact.data}
                hasPosition={asset.lat !== null && !asset.tanda.includes("jauh_dari_saluran")}
                highlighted={highlighted}
                onToggleHighlight={onToggleHighlight}
              />
            ) : null}
          </Section>

          <Section title={`Riwayat laporan (${formatInteger(asset.riwayat.length)})`}>
            <History reports={asset.riwayat} />
          </Section>
        </>
      ) : null}
    </div>
  );
}
