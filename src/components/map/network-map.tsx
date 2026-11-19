"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";

import { escapeHtml, formatDecimal } from "@/lib/format";
import { conditionLabel, kindLabel, levelLabel } from "@/lib/labels";
import { IMPACT_HEX, PLOT_HEX, conditionDash, conditionHex, kindSymbol, levelWeight } from "@/lib/map-style";
import type { Asset, CanalCollection, PlotCollection } from "@/lib/types";

export interface NetworkMapProps {
  canals: CanalCollection;
  plots: PlotCollection;
  /** Structures to draw. Those without coordinates are skipped. */
  assets: Asset[];
  selectedCode: string | null;
  /** Codes of the plots to emphasise, or null when nothing is highlighted. */
  highlightedPlots: ReadonlySet<string> | null;
  onSelectAsset: (code: string) => void;
}

const MARKER_SIZE = 30;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function popup(title: string, rows: [string, string][]): string {
  const items = rows.map(([term, value]) => `<dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd>`).join("");
  return `<div class="map-popup"><div class="map-popup-title">${escapeHtml(title)}</div><dl>${items}</dl></div>`;
}

function plotStyle(code: string, highlighted: ReadonlySet<string> | null): L.PathOptions {
  if (highlighted?.has(code)) {
    return { color: IMPACT_HEX, weight: 2.5, fillColor: IMPACT_HEX, fillOpacity: 0.45 };
  }
  // With a highlight active the other plots step back, so the impacted ones read first.
  return { color: PLOT_HEX, weight: 1, fillColor: PLOT_HEX, fillOpacity: highlighted ? 0.06 : 0.18 };
}

/**
 * The network map. Leaflet is driven directly instead of through a React
 * binding: the map is created and removed in one effect, and each layer has
 * its own effect, so a change to the selection redraws only what changed.
 */
export default function NetworkMap({ canals, plots, assets, selectedCode, highlightedPlots, onSelectAsset }: NetworkMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const plotLayerRef = useRef<L.GeoJSON | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const fittedRef = useRef(false);
  // The latest callback, so markers do not need rebuilding when it changes.
  const onSelectRef = useRef(onSelectAsset);
  useEffect(() => {
    onSelectRef.current = onSelectAsset;
  }, [onSelectAsset]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const map = L.map(container, { zoomControl: true, minZoom: 9, maxZoom: 18 }).setView([-7.64, 110.42], 12);
    map.attributionControl.setPrefix(false);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    // Fixed drawing order: plots below canals, canals below structures.
    map.createPane("plots").style.zIndex = "410";
    map.createPane("canals").style.zIndex = "420";
    map.createPane("assets").style.zIndex = "610";
    mapRef.current = map;
    fittedRef.current = false;

    // The map sits in a flexible layout; tell Leaflet whenever its box changes.
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      plotLayerRef.current = null;
    };
  }, []);

  // Plots
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const layer = L.geoJSON(plots, {
      pane: "plots",
      style: (feature) => plotStyle(feature?.properties.kode_petak ?? "", null),
      onEachFeature: (feature, featureLayer) => {
        const p = feature.properties;
        featureLayer.bindPopup(
          popup(`Petak ${p.kode_petak}`, [
            ["Nama", p.nama_petak ?? "Tanpa nama"],
            ["Luas", `${formatDecimal(p.luas_ha)} ha`],
            ["Bangunan sadap", p.nomenklatur_sadap ?? "Tidak tercatat"],
          ]),
        );
      },
    }).addTo(map);
    plotLayerRef.current = layer;
    return () => {
      layer.remove();
      plotLayerRef.current = null;
    };
  }, [plots]);

  // Highlight of impacted plots
  useEffect(() => {
    plotLayerRef.current?.eachLayer((featureLayer) => {
      const path = featureLayer as L.Path & { feature?: GeoJSON.Feature };
      const code = String(path.feature?.properties?.kode_petak ?? "");
      path.setStyle(plotStyle(code, highlightedPlots));
      if (highlightedPlots?.has(code)) {
        path.bringToFront();
      }
    });
  }, [highlightedPlots, plots]);

  // Canals
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const layer = L.geoJSON(canals, {
      pane: "canals",
      style: (feature) => ({
        color: conditionHex(feature?.properties.kondisi ?? null),
        weight: levelWeight(feature?.properties.tingkat ?? null),
        dashArray: conditionDash(feature?.properties.kondisi ?? null),
        lineCap: "butt",
        opacity: 1,
      }),
      onEachFeature: (feature, featureLayer) => {
        const p = feature.properties;
        featureLayer.bindPopup(
          popup(p.nama_saluran ?? "Saluran tanpa nama", [
            ["Ruas", p.id_ruas],
            ["Tingkat", levelLabel(p.tingkat)],
            ["Kondisi", conditionLabel(p.kondisi)],
            ["Panjang", `${formatDecimal(p.panjang_m / 1000)} km`],
          ]),
        );
      },
    }).addTo(map);

    if (!fittedRef.current) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.08), { animate: false });
        fittedRef.current = true;
      }
    }
    return () => {
      layer.remove();
    };
  }, [canals]);

  // Structures
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const group = L.layerGroup().addTo(map);
    const markers = markersRef.current;
    markers.clear();

    for (const asset of assets) {
      if (asset.lat === null || asset.lon === null) {
        continue;
      }
      const name = `${asset.nomenklatur ?? asset.kode_aset}, ${kindLabel(asset.jenis)}, ${conditionLabel(asset.kondisi)}`;
      const marker = L.marker([asset.lat, asset.lon], {
        pane: "assets",
        keyboard: true,
        title: name,
        icon: L.divIcon({
          className: "asset-marker",
          html: kindSymbol(asset.jenis, conditionHex(asset.kondisi)),
          iconSize: [MARKER_SIZE, MARKER_SIZE],
          iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
        }),
      });
      marker.on("click", () => onSelectRef.current(asset.kode_aset));
      marker.addTo(group);
      marker.getElement()?.setAttribute("aria-label", `Bangunan ${name}`);
      markers.set(asset.kode_aset, marker);
    }

    if (!fittedRef.current && markers.size > 0) {
      const bounds = L.latLngBounds([...markers.values()].map((m) => m.getLatLng()));
      map.fitBounds(bounds.pad(0.1), { animate: false });
      fittedRef.current = true;
    }
    return () => {
      group.remove();
      markers.clear();
    };
  }, [assets]);

  // Selection: mark the symbol and bring it into view.
  useEffect(() => {
    const map = mapRef.current;
    for (const [code, marker] of markersRef.current) {
      const selected = code === selectedCode;
      marker.getElement()?.setAttribute("data-selected", String(selected));
      marker.setZIndexOffset(selected ? 1000 : 0);
    }
    const marker = selectedCode ? markersRef.current.get(selectedCode) : undefined;
    if (map && marker && !map.getBounds().pad(-0.15).contains(marker.getLatLng())) {
      map.setView(marker.getLatLng(), Math.max(map.getZoom(), 14), { animate: !prefersReducedMotion() });
    }
  }, [selectedCode, assets]);

  // Show every impacted plot when the highlight is switched on.
  useEffect(() => {
    const map = mapRef.current;
    const layer = plotLayerRef.current;
    if (!map || !layer || !highlightedPlots || highlightedPlots.size === 0) {
      return;
    }
    const bounds = L.latLngBounds([]);
    layer.eachLayer((featureLayer) => {
      const polygon = featureLayer as L.Polygon & { feature?: GeoJSON.Feature };
      if (highlightedPlots.has(String(polygon.feature?.properties?.kode_petak ?? ""))) {
        bounds.extend(polygon.getBounds());
      }
    });
    const marker = selectedCode ? markersRef.current.get(selectedCode) : undefined;
    if (marker) {
      bounds.extend(marker.getLatLng());
    }
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.1), { animate: !prefersReducedMotion(), maxZoom: 15 });
    }
    // Only the highlight itself moves the view; a later selection is handled above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedPlots]);

  return <div ref={containerRef} role="region" aria-label="Peta jaringan irigasi" className="size-full" />;
}
