import type { Metadata } from "next";

import { CanalRecapView } from "@/components/canal/canal-recap-view";

export const metadata: Metadata = { title: "Rekap panjang saluran" };

export default function CanalRecapPage() {
  return <CanalRecapView />;
}
