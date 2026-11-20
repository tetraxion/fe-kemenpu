import type { Metadata } from "next";
import { Suspense } from "react";

import { MapView } from "@/components/map/map-view";

export const metadata: Metadata = { title: "Peta jaringan" };

export default function MapPage() {
  // useSearchParams in MapView needs a Suspense boundary
  return (
    <Suspense fallback={null}>
      <MapView />
    </Suspense>
  );
}
