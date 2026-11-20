"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";

import { AssetDetail } from "@/components/asset/asset-detail";
import { AssetList } from "@/components/asset/asset-list";
import { MapLegend } from "@/components/map/map-legend";
import { ErrorState, LoadingRows } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import { api, queryKeys } from "@/lib/api";
import { EMPTY_FILTER, filterAssets, type AssetFilter } from "@/lib/asset-filter";

// Leaflet needs the browser
const NetworkMap = dynamic(() => import("@/components/map/network-map"), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

function MapPlaceholder() {
  return (
    <div role="status" className="size-full p-3">
      <span className="sr-only">Memuat peta</span>
      <Skeleton className="size-full" />
    </div>
  );
}

export function MapView() {
  const router = useRouter();
  const selectedCode = useSearchParams().get("aset");

  const assets = useQuery({ queryKey: queryKeys.assets, queryFn: api.assets });
  const canals = useQuery({ queryKey: queryKeys.canalMap, queryFn: api.canalMap });
  const plots = useQuery({ queryKey: queryKeys.plotMap, queryFn: api.plotMap });
  const impact = useQuery({
    queryKey: queryKeys.impact(selectedCode ?? ""),
    queryFn: () => api.impact(selectedCode ?? ""),
    enabled: selectedCode !== null,
  });

  const [filter, setFilter] = useState<AssetFilter>(EMPTY_FILTER);
  // kept here so the list reopens on the same page after a detail view
  const [listPage, setListPage] = useState(0);
  // opening another structure drops the highlight
  const [highlightFor, setHighlightFor] = useState<string | null>(null);
  const highlighted = selectedCode !== null && highlightFor === selectedCode;

  const visibleAssets = useMemo(() => filterAssets(assets.data?.data ?? [], filter), [assets.data, filter]);
  // keep the open structure on the map even when filtered out
  const mapAssets = useMemo(() => {
    const selected = assets.data?.data.find((asset) => asset.kode_aset === selectedCode);
    return selected && !visibleAssets.includes(selected) ? [...visibleAssets, selected] : visibleAssets;
  }, [assets.data, visibleAssets, selectedCode]);

  const highlightedPlots = useMemo(
    () => (highlighted && impact.data ? new Set(impact.data.petak.map((plot) => plot.kode_petak)) : null),
    [highlighted, impact.data],
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const select = useCallback(
    (code: string) => {
      router.replace(`/?aset=${encodeURIComponent(code)}`, { scroll: false });
      // on phones the panel is below the map
      if (window.matchMedia("(max-width: 1023px)").matches) {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        panelRef.current?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
      }
    },
    [router],
  );
  const clearSelection = useCallback(() => router.replace("/", { scroll: false }), [router]);

  // a failed refetch keeps the map that is already drawn
  const layersFailed = (canals.isError && !canals.data) || (plots.isError && !plots.data);
  const layersReady = canals.data && plots.data;

  return (
    // no flex-1: it overrides the fixed desktop height
    <div className="flex flex-col lg:h-[calc(100dvh-4rem)] lg:flex-none lg:flex-row">
      <section aria-label="Peta" className="relative isolate h-[60dvh] min-h-80 shrink-0 lg:h-auto lg:min-w-0 lg:flex-1">
        {layersFailed ? (
          <div className="p-4">
            <ErrorState
              title="Lapisan peta tidak dapat dimuat"
              error={canals.error ?? plots.error}
              onRetry={() => {
                canals.refetch();
                plots.refetch();
              }}
            />
          </div>
        ) : layersReady ? (
          <>
            <NetworkMap
              canals={canals.data}
              plots={plots.data}
              assets={mapAssets}
              selectedCode={selectedCode}
              highlightedPlots={highlightedPlots}
              onSelectAsset={select}
            />
            <MapLegend />
          </>
        ) : (
          <MapPlaceholder />
        )}
      </section>

      <div
        ref={panelRef}
        className="scrollbar-thin flex scroll-mt-16 flex-col gap-4 border-t border-border bg-card p-4 sm:p-5 lg:min-h-0 lg:w-[400px] lg:shrink-0 lg:overflow-y-auto lg:border-t-0 lg:border-l"
      >
        {/* on desktop the top bar already shows the page name */}
        <h1 className="text-xl leading-tight font-semibold text-brand lg:sr-only">Peta jaringan</h1>

        {selectedCode ? (
          <AssetDetail
            code={selectedCode}
            highlighted={highlighted}
            onToggleHighlight={() => setHighlightFor(highlighted ? null : selectedCode)}
            onBack={clearSelection}
          />
        ) : assets.isPending ? (
          <LoadingRows label="Memuat daftar bangunan" />
        ) : assets.isError ? (
          <ErrorState title="Daftar bangunan tidak dapat dimuat" error={assets.error} onRetry={() => assets.refetch()} />
        ) : (
          <>
            <p className="text-[13px] leading-normal text-muted-foreground">
              Pilih bangunan di peta atau dari daftar untuk melihat kondisi, riwayat laporan, dan petak yang terdampak.
            </p>
            <AssetList
              assets={visibleAssets}
              total={assets.data.jumlah}
              filter={filter}
              onFilterChange={(next) => {
                setFilter(next);
                setListPage(0);
              }}
              page={listPage}
              onPageChange={setListPage}
              onSelect={select}
            />
          </>
        )}
      </div>
    </div>
  );
}
