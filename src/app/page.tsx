import type { Metadata } from "next";
import { Suspense } from "react";

import { MapView } from "@/components/map/map-view";

export const metadata: Metadata = { title: "Peta jaringan" };

export default function MapPage() {
  // MapView reads the open structure from the query string, which is only
  // known in the browser, so it renders behind a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <MapView />
    </Suspense>
  );
}
